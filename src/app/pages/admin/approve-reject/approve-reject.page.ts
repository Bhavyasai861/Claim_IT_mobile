import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-approve-reject',
  templateUrl: './approve-reject.page.html',
  styleUrls: ['./approve-reject.page.scss'],
  standalone:true,
  imports:[CommonModule,IonicModule,FormsModule,ReactiveFormsModule]
})
export class ApproveRejectPage implements OnInit {
  approveRejectForm!:FormGroup
  constructor(private fb:FormBuilder) { }

  ngOnInit() {
    this.approveRejectForm = this.fb.group({
      email: ['',],
      name: [''],
      date:[''],
      status:['']
    });
  }
  submitForm(){

  }
}
