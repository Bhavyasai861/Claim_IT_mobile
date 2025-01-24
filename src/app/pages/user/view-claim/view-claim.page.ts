import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-view-claim',
  templateUrl: './view-claim.page.html',
  styleUrls: ['./view-claim.page.scss'],
  standalone:true,
  imports:[CommonModule,IonicModule,FormsModule]
})
export class ViewClaimPage implements OnInit {
  searchValue: any;
  constructor() { }

  ngOnInit() {
  }

}
