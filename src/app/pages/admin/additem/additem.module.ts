import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdditemPageRoutingModule } from './additem-routing.module';

import { AdditemPage } from './additem.page';
import { HttpClient } from '@angular/common/http';
import { NgxFileDropModule } from 'ngx-file-drop';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdditemPageRoutingModule,
    AdditemPage,
    NgxFileDropModule,
    
  ],
  declarations: []
})
export class AdditemPageModule {}
