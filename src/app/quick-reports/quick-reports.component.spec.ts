import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickReportsComponent } from './quick-reports.component';

describe('QuickReportsComponent', () => {
  let component: QuickReportsComponent;
  let fixture: ComponentFixture<QuickReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
