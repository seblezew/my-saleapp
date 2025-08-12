import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRegisterSellerComponent } from './admin-register-seller.component';

describe('AdminRegisterSellerComponent', () => {
  let component: AdminRegisterSellerComponent;
  let fixture: ComponentFixture<AdminRegisterSellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminRegisterSellerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRegisterSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
