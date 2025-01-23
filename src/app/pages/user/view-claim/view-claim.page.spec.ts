import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewClaimPage } from './view-claim.page';

describe('ViewClaimPage', () => {
  let component: ViewClaimPage;
  let fixture: ComponentFixture<ViewClaimPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewClaimPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
