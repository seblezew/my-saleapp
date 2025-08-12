import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CustomerListComponent } from './admin/customers/customer-list/customer-list.component';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { SellerGuard } from './seller.guard';
import { SellerDashboardComponent } from './components/seller-dashboard/seller-dashboard.component';
import { AdminRegisterSellerComponent } from './admin-register-seller/admin-register-seller.component';
import { SellerManagementComponent } from './seller-management/seller-management.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SellerProductListComponent } from './seller/seller-product-list/seller-product-list.component';
import { SellerProductFormComponent } from './seller/seller-product-form/seller-product-form.component';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [AuthGuard] 
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },

  // Product routes (public)
  { 
    path: 'products', 
    component: ProductListComponent,
    data: { title: 'Products' } 
  },
  { 
    path: 'products/:id', 
    component: ProductDetailComponent,
    data: { title: 'Product Details' } 
  },

  // Admin routes
  { 
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent,
        data: { title: 'Admin Dashboard' } 
      },
      { 
        path: 'customers', 
        component: CustomerListComponent,
        data: { title: 'Customer Management' } 
      },
      { 
        path: 'register-seller', 
        component: AdminRegisterSellerComponent,
        data: { title: 'Register Seller' } 
      },
      { 
        path: 'seller-management', 
        component: SellerManagementComponent,
        data: { title: 'Seller Management' } 
      },
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      }
    ]
  },

  // Seller routes
  { 
    path: 'seller',
    canActivate: [AuthGuard, SellerGuard],
    children: [
      { 
        path: 'dashboard', 
        component: SellerDashboardComponent,
        data: { title: 'Seller Dashboard' } 
      },
      { 
        path: 'products', 
        component: SellerProductListComponent,
        data: { title: 'My Products' } 
      },
      { 
        path: 'products/new', 
        component: SellerProductFormComponent,
        data: { title: 'Add New Product' } 
      },
      { 
        path: 'products/edit/:id', 
        component: SellerProductFormComponent,
        data: { title: 'Edit Product' } 
      },
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      }
    ]
  },

  // Regular user dashboard
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'User Dashboard' } 
  },

  // Fallback route
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload',
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    enableTracing: false,
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }