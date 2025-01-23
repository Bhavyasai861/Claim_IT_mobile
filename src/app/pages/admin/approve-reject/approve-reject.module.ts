import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApproveRejectPageRoutingModule } from './approve-reject-routing.module';

import { ApproveRejectPage } from './approve-reject.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApproveRejectPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: []
})
export class ApproveRejectPageModule {}
