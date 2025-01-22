import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdditemPage } from './additem.page';

describe('AdditemPage', () => {
  let component: AdditemPage;
  let fixture: ComponentFixture<AdditemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
