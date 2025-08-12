import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  getSummaryCards() {
    return of([
      {
        title: "Today's Sales",
        value: 3250,
        change: 12,
        trend: 'up',
        icon: 'attach_money'
      },
      {
        title: "Pending Orders",
        value: 5,
        change: -2,
        trend: 'neutral',
        icon: 'pending_actions'
      },
      {
        title: "Completed Orders",
        value: 18,
        change: 5,
        trend: 'up',
        icon: 'check_circle'
      },
      {
        title: "Top Product",
        value: "Laptop",
        secondary: "25 sold",
        icon: 'star'
      }
    ]);
  }

  getRecentOrders() {
    return of([
      {
        orderId: '1001',
        customer: {
          name: 'John Smith',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        date: new Date(),
        amount: 1250,
        status: 'completed'
      },
      {
        orderId: '1002',
        customer: {
          name: 'Sarah Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        date: new Date(),
        amount: 899,
        status: 'shipped'
      },
      {
        orderId: '1003',
        customer: {
          name: 'Michael Brown',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
        },
        date: new Date(),
        amount: 450,
        status: 'pending'
      },
      {
        orderId: '1004',
        customer: {
          name: 'Emily Davis',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        date: new Date(),
        amount: 1250,
        status: 'completed'
      },
      {
        orderId: '1005',
        customer: {
          name: 'Robert Wilson',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
        },
        date: new Date(),
        amount: 650,
        status: 'pending'
      }
    ]);
  }
}