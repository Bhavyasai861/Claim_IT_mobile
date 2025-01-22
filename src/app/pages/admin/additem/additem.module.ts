import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdditemPageRoutingModule } from './additem-routing.module';

import { AdditemPage } from './additem.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdditemPageRoutingModule,
    AdditemPage
  ],
  declarations: []
})
export class AdditemPageModule {}
