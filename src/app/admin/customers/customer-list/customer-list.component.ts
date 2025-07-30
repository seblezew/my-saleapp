import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  newCustomer: Customer = { name: '', email: '', phone: '' };
  isEditing = false;
  currentEditId: number | null = null;

  // JSON Server URL
 readonly apiUrl = 'http://localhost:8888/customers';  // For your Vert.x server

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCustomers();
  }

  getCustomers() {
    this.http.get<Customer[]>(this.apiUrl).subscribe({
      next: data => this.customers = data,
      error: err => this.handleError('Failed to fetch customers', err)
    });
  }

  addCustomer() {
    if (!this.validateCustomer(this.newCustomer)) {
      alert('All fields are required and email must be valid.');
      return;
    }

    if (this.isEditing && this.currentEditId !== null) {
      this.updateCustomer();
      return;
    }

    this.http.post<Customer>(this.apiUrl, this.newCustomer).subscribe({
      next: (created) => {
        this.customers.push(created);
        this.resetForm();
        console.log('Customer added successfully', created);
        alert('Customer added successfully!');
      },
      error: (err) => {
        console.error('Full error details:', err);
        this.handleError('Failed to add customer. Please check:', {
          message: '1. Is the backend server running?',
          details: '2. Check console for more details'
        });
      }
    });
  }

  editCustomer(customer: Customer) {
    this.newCustomer = { ...customer };
    this.isEditing = true;
    this.currentEditId = customer.id || null;
  }

  updateCustomer() {
    if (this.currentEditId === null) return;

    this.http.put<Customer>(`${this.apiUrl}/${this.currentEditId}`, this.newCustomer).subscribe({
      next: (updated) => {
        const index = this.customers.findIndex(c => c.id === this.currentEditId);
        if (index !== -1) this.customers[index] = updated;
        this.resetForm();
      },
      error: (err) => this.handleError('Failed to update customer', err)
    });
  }

  deleteCustomer(customer: Customer) {
    if (!customer.id) return;

    const confirmed = confirm(`Delete customer "${customer.name}"?`);
    if (!confirmed) return;

    this.http.delete(`${this.apiUrl}/${customer.id}`).subscribe({
      next: () => {
        this.customers = this.customers.filter(c => c.id !== customer.id);
      },
      error: (err) => this.handleError('Failed to delete customer', err)
    });
  }

  resetForm() {
    this.newCustomer = { name: '', email: '', phone: '' };
    this.isEditing = false;
    this.currentEditId = null;
  }

  validateCustomer(customer: Customer): boolean {
    return (
      customer.name.trim() !== '' &&
      customer.email.trim() !== '' &&
      customer.phone.trim() !== '' &&
      customer.email.includes('@')
    );
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    alert(`${message}. Backend might not be running.`);
  }
}