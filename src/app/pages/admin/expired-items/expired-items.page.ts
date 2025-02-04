import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-expired-items',
  templateUrl: './expired-items.page.html',
  styleUrls: ['./expired-items.page.scss'],
  imports:[CommonModule,IonicModule,FormsModule]
})
export class ExpiredItemsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
