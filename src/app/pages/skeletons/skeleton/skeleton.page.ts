import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.page.html',
  styleUrls: ['./skeleton.page.scss'],
  imports:[CommonModule,IonicModule,FormsModule,]
})
export class SkeletonPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
