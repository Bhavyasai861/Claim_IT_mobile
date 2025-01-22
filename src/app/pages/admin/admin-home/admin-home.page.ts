import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
  standalone:true,
  imports: [CommonModule, FormsModule, IonicModule,]
})
export class AdminHomePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
