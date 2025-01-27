import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-claim-modal',
  templateUrl: './claim-modal.component.html',
  styleUrls: ['./claim-modal.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule,ReactiveFormsModule  ],
})
export class ClaimModalComponent  implements OnInit {

  claimForm!: FormGroup;
  enableSave: boolean = true;
  emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.initializeContactForm();
    this.claimForm.statusChanges.subscribe((status: any) => {
      this.enableSave = status !== 'VALID';
    });
  }

  initializeContactForm() {
    this.claimForm = this.fb.group({
      name: this.fb.control('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(this.emailRegex),
      ]),
      message: this.fb.control(''),
    });
  }

  get email() {
    return this.claimForm.get('email');
  }

  get name() {
    return this.claimForm.get('name');
  }

  onCancel() {
    this.modalCtrl.dismiss(undefined);
  }

  onSubmit() {
    this.modalCtrl.dismiss(this.claimForm.value);
  }

}
