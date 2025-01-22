import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-additem',
  templateUrl: './additem.page.html',
  styleUrls: ['./additem.page.scss'],
  standalone:true,
  imports:[CommonModule, FormsModule, IonicModule,]
})
export class AdditemPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
