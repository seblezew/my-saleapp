import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../auth.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/orders.service';
import { MessageService } from '../../services/message.service';

interface DashboardStats {
  products: number;
  orders: number;
  pendingOrders: number;
  revenue: number;
}

interface Product {
  id: number;
  name: string;
  stockQuantity: number;
  price?: number;
}

interface Order {
  id: number;
  totalAmount: number;
  status?: string;
  customerName?: string;
  orderDate?: string;
}

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  stats: DashboardStats = {
    products: 0,
    orders: 0,
    pendingOrders: 0,
    revenue: 0
  };
  recentOrders: Order[] = [];
  lowStockProducts: Product[] = [];
  unreadMessages: number = 0;
  loading = true;
  currentUser: any;

  constructor(
    private router: Router,
    public authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;
    const sellerId = this.currentUser.id;
    
    try {
      const [
        products, 
        orders, 
        pendingOrders, 
        lowStockProducts, 
        unreadCount
      ] = await Promise.all([
        lastValueFrom(this.productService.getProductsBySeller(sellerId)),
        lastValueFrom(this.orderService.getOrdersBySeller(sellerId)),
        lastValueFrom(this.orderService.getPendingOrders(sellerId)),
        lastValueFrom(this.productService.getLowStockProducts(sellerId, 10)),
        lastValueFrom(this.messageService.getUnreadCount(sellerId))
      ]);

      this.stats = {
        products: products?.length || 0,
        orders: orders?.length || 0,
        pendingOrders: pendingOrders?.length || 0,
        revenue: orders?.reduce((sum: number, order: Order) => sum + (order.totalAmount || 0), 0) || 0
      };
      this.lowStockProducts = lowStockProducts || [];
      this.recentOrders = orders?.slice(0, 5) || [];
      this.unreadMessages = unreadCount || 0;
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      this.loading = false;
    }
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(`/seller/${route}`);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  updateOrderStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => this.loadDashboardData(),
      error: (err: any) => console.error('Error updating order:', err)
    });
  }

  restockProduct(productId: number): void {
    this.router.navigate([`/seller/products/restock/${productId}`]);
  }
}