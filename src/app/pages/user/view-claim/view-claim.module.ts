import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewClaimPageRoutingModule } from './view-claim-routing.module';

import { ViewClaimPage } from './view-claim.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewClaimPageRoutingModule,
    ViewClaimPage
  ],
  declarations: []
})
export class ViewClaimPageModule {}
