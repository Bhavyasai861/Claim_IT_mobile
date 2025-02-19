import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  imports:[CommonModule,IonicModule, FormsModule,ReactiveFormsModule]
})
export class ContactPage implements OnInit {
  helpForm: FormGroup;
  constructor(private fb: FormBuilder, private toastController: ToastController) { 
    this.helpForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    request: ['', Validators.required]
  });}

  ngOnInit() {
  }
  get email() {
    return this.helpForm.get('email');
  }

  get enableSave() {
    return this.helpForm.invalid;
  }

  async submitRequest() {
    if (this.helpForm.valid) {
      const toast = await this.toastController.create({
        message: 'Your request has been submitted.',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      this.helpForm.reset();
    }
  }
}
