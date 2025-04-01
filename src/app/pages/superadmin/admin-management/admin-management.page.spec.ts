import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminManagementPage } from './admin-management.page';

describe('AdminManagementPage', () => {
  let component: AdminManagementPage;
  let fixture: ComponentFixture<AdminManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
