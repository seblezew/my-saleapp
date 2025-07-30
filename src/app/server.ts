import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  terms: boolean;
}

interface DatabaseError extends Error {
  message: string;
  code?: string;
}

const app = express();
const port = process.env['PORT'] || 3000;

// PostgreSQL connection
const pool = new Pool({
  user: process.env['DB_USER'] || 'vertx_user',
  host: process.env['DB_HOST'] || 'localhost',
  database: process.env['DB_NAME'] || 'sms_db',
  password: process.env['DB_PASSWORD'] || '1234',
  port: parseInt(process.env['DB_PORT'] || '5432'),
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database with proper schema
async function initializeDatabase(): Promise<void> {
  try {
    // Create user_roles table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        role_id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create users table with your exact schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        role_id INTEGER REFERENCES user_roles(role_id) DEFAULT 2, -- Default to 'user' role
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default roles if not exists
    await pool.query(`
      INSERT INTO user_roles (role_name, description)
      VALUES 
        ('admin', 'Administrator with full access'),
        ('user', 'Regular user account')
      ON CONFLICT (role_name) DO NOTHING;
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, firstName, lastName, email, password, phone, terms }: User = req.body;

  try {
    // Validate input
    if (!username || !firstName || !lastName || !email || !password || !terms) {
      return res.status(400).json({ 
        error: 'All fields are required',
        fieldErrors: {
          username: !username ? 'Username is required' : undefined,
          firstName: !firstName ? 'First name is required' : undefined,
          lastName: !lastName ? 'Last name is required' : undefined,
          email: !email ? 'Email is required' : undefined,
          password: !password ? 'Password is required' : undefined,
          terms: !terms ? 'You must accept the terms' : undefined
        }
      });
    }

    // Check if username or email exists
    const userExists = await pool.query(
      'SELECT username, email FROM users WHERE username = $1 OR email = $2 LIMIT 1',
      [username, email]
    );

    if (userExists.rows && userExists.rows.length > 0) {
      const existingUser = userExists.rows[0];
      return res.status(400).json({ 
        error: 'Username or email already exists',
        fieldErrors: {
          username: existingUser.username === username ? 'Username already taken' : undefined,
          email: existingUser.email === email ? 'Email already registered' : undefined
        }
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user with transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO users 
         (username, password_hash, first_name, last_name, email, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING user_id, username, first_name, last_name, email, created_at`,
        [username, passwordHash, firstName, lastName, email, phone]
      );

      await client.query('COMMIT');

      return res.status(201).json({ 
        success: true,
        message: 'Registration successful',
        user: result.rows[0]
      });
    } catch (err) {
      await client.query('ROLLBACK');
      const error = err as DatabaseError;
      console.error('Registration error:', error);
      return res.status(500).json({ 
        error: 'Registration failed',
        details: error.message 
      });
    } finally {
      client.release();
    }
  } catch (err) {
    const error = err as DatabaseError;
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Initialize and start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch((err) => {
  const error = err as DatabaseError;
  console.error('Database initialization failed:', error);
  process.exit(1);
});