import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:true,
  imports: [CommonModule, FormsModule, IonicModule,ReactiveFormsModule]
})
export class LoginPage implements OnInit {
 
  loginForm!: FormGroup;
  errMsg: string | null = null;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    // private service: ClaimitService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }

  onSubmit() {
    // if (this.loginForm.valid) {
    //   const { email, password } = this.loginForm.value;

    //   this.service.adminLogin(email, password).subscribe(
    //     (response: any) => {
    //       if (response.isAdmin) {
    //         localStorage.setItem('isLogin', 'true');
    //         localStorage.setItem('role', 'admin');
    //         this.router.navigate(['/claimit/addItem']);
    //         this.service.loginResponse.next(true);
    //       } else {
    //         this.showToast(response.message);
    //       }
    //     },
    //     (error: any) => {
    //       this.showToast(error.message || 'An unexpected error occurred.');
    //     }
    //   );
    // } else {
    //   this.showToast('Please fill in all fields correctly.');
    // }
  }


  
  forgotPassword() {
    this.showToast('Forgot Password functionality coming soon.');
  }
}
