import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

import { AuthService } from '../auth.service';
import { SellerService } from '../seller.service';
import { CustomerService } from '../services/customer.service';
import { OrderService } from '../services/orders.service';
import { ProductService } from '../services/product.service';
import { Seller } from '../models/seller.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model'; // Added this import

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    sellers: 0,
    customers: 0,
    products: 0,
    orders: 0,
    revenue: 0
  };

  recentOrders: Order[] = [];
  topSellers: Seller[] = [];
  loading = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sellerService: SellerService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;
    try {
      const [
        sellers,
        customers,
        products,
        orders,
        recentOrders,
        topSellers
      ] = await Promise.all([
        lastValueFrom(this.sellerService.getSellers()),
        lastValueFrom(this.customerService.getCustomers()),
        lastValueFrom(this.productService.getProducts()),
        lastValueFrom(this.orderService.getAllOrders()),
        lastValueFrom(this.orderService.getRecentOrders(5)),
        lastValueFrom(this.sellerService.getTopSellers(3))
      ]);

      this.stats = {
        sellers: sellers.length,
        customers: customers.length,
        products: products.length, // Removed type assertion since we now have the Product type
        orders: orders.length,
        revenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      };

      this.recentOrders = recentOrders;
      this.topSellers = this.mapToSellerModel(topSellers);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      this.loading = false;
    }
  }

  private mapToSellerModel(sellers: any[]): Seller[] {
    return sellers.map(seller => ({
      id: seller.id,
      firstName: seller.firstName || seller.name?.split(' ')[0] || '',
      lastName: seller.lastName || seller.name?.split(' ')[1] || '',
      email: seller.email || '',
      phone: seller.phone || '',
      totalSales: seller.totalSales || seller.sales || 0,
      orderCount: seller.orderCount || seller.orders || 0,
    }));
  }

  goTo(route: string): void {
    const routeMap: Record<string, string> = {
      users: '/admin/register-seller',
      customers: '/admin/customers',
      products: '/admin/products',
      orders: '/admin/orders',
      invoices: '/admin/invoices',
      reports: '/admin/reports',
      sellers: '/admin/seller-management'
    };
    this.router.navigate([routeMap[route] || '/admin']);
  }

  navigateTo(route: string): void {
    this.router.navigate([`/admin/${route}`]);
  }

  navigateToSellerManagement(): void {
    this.router.navigate(['/admin/seller-management']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
