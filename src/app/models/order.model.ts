// src/app/models/order.model.ts
export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  orderDate: string; // ISO format
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string; // ISO format
}
