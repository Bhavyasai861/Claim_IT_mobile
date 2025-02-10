import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoryManagementPageRoutingModule } from './category-management-routing.module';

import { CategoryManagementPage } from './category-management.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoryManagementPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: []
})
export class CategoryManagementPageModule {}
