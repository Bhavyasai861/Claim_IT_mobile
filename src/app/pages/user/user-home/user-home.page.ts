import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
  standalone:true,
  imports:[CommonModule, FormsModule, IonicModule,]
})
export class UserHomePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
