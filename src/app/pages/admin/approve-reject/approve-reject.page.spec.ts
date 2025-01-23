import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApproveRejectPage } from './approve-reject.page';

describe('ApproveRejectPage', () => {
  let component: ApproveRejectPage;
  let fixture: ComponentFixture<ApproveRejectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRejectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
