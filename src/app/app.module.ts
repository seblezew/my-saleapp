// src/app/app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './http-interceptor.service';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips'; // Added for chip functionality
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatBadgeModule } from '@angular/material/badge';

// Application Components
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CustomerListComponent } from './admin/customers/customer-list/customer-list.component';
import { AppRoutingModule } from './app-routing.module';
import { SellerDashboardComponent } from './components/seller-dashboard/seller-dashboard.component';
import { SummaryCardsComponent } from './summary-cards/summary-cards.component';
import { RecentOrdersComponent } from './recent-orders/recent-orders.component';
import { CustomerActivityComponent } from './customer-activity/customer-activity.component';
import { ProductPerformanceComponent } from './product-performance/product-performance.component';
import { SalesAnalyticsComponent } from './sales-analytics/sales-analytics.component';
import { NotificationsPanelComponent } from './notifications-panel/notifications-panel.component';
import { QuickReportsComponent } from './quick-reports/quick-reports.component';
import { AdminRegisterSellerComponent } from './admin-register-seller/admin-register-seller.component';
import { SellerManagementComponent } from './seller-management/seller-management.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { LayoutComponent } from './layout/layout.component';

// Services
import { AuthService } from './auth.service';
import { SellerService } from './seller.service';
import { CustomerService } from './customer.service';
import { OrderService } from './services/orders.service';
import { ProductService } from './services/product.service';
import { MessageService } from './services/message.service';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SellerProductListComponent } from './seller/seller-product-list/seller-product-list.component';
import { SellerProductFormComponent } from './seller/seller-product-form/seller-product-form.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    DashboardComponent,
    AdminDashboardComponent,
    CustomerListComponent,
    SellerDashboardComponent,
    SummaryCardsComponent,
    RecentOrdersComponent,
    CustomerActivityComponent,
    ProductPerformanceComponent,
    SalesAnalyticsComponent,
    NotificationsPanelComponent,
    QuickReportsComponent,
    AdminRegisterSellerComponent,
    SellerManagementComponent,
    ProductListComponent,
    ProductFormComponent,
    SidebarComponent,
    UnauthorizedComponent,
    LayoutComponent,
    ProductDetailComponent,
    SellerProductListComponent,
    SellerProductFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,

    // Angular Material Modules
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule, // Added for chip functionality
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatOptionModule,
    MatPaginatorModule,
    MatSortModule,
    MatBadgeModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    AuthService,
    SellerService,
    CustomerService,
    OrderService,
    ProductService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }