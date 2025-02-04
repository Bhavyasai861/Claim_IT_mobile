import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpiredItemsPage } from './expired-items.page';

describe('ExpiredItemsPage', () => {
  let component: ExpiredItemsPage;
  let fixture: ComponentFixture<ExpiredItemsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpiredItemsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
