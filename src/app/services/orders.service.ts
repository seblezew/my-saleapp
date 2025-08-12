import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl + '/orders';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getRecentOrders(count: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/recent`, {
      params: { limit: count.toString() }
    });
  }

  getOrdersBySeller(sellerId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}?sellerId=${sellerId}`);
  }

  getPendingOrders(sellerId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/pending?sellerId=${sellerId}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/status`, { status });
  }
}

export { Order };
