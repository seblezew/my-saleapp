import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerActivityComponent } from './customer-activity.component';

describe('CustomerActivityComponent', () => {
  let component: CustomerActivityComponent;
  let fixture: ComponentFixture<CustomerActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerActivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
