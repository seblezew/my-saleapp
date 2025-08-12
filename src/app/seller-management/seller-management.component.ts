import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-management',
  templateUrl: './seller-management.component.html',
  styleUrls: ['./seller-management.component.css']
})
export class SellerManagementComponent {
  displayedColumns: string[] = ['name', 'email', 'status', 'sales', 'actions'];
  sellers = [
    { name: 'John Doe', email: 'john@example.com', isActive: true, sales: 12500 },
    { name: 'Jane Smith', email: 'jane@example.com', isActive: false, sales: 8500 },
    // ... more sample data
  ];

  constructor(private router: Router) {}

  openPermissionsDialog(seller: any) {
    // Implement dialog logic
    console.log('Edit permissions for:', seller);
  }

  toggleSellerStatus(seller: any) {
    seller.isActive = !seller.isActive;
  }

  navigateToRegisterSeller() {
    this.router.navigate(['/admin/register-seller']);
  }
}