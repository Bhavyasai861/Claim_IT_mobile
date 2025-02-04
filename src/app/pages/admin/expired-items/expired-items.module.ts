import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpiredItemsPageRoutingModule } from './expired-items-routing.module';

import { ExpiredItemsPage } from './expired-items.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpiredItemsPageRoutingModule
  ],
  declarations: []
})
export class ExpiredItemsPageModule {}
