import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { ClaimitService } from 'src/app/pages/SharedServices/claimit.service';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule,ReactiveFormsModule],
  providers:[ClaimitService]
})
export class LoginPage implements OnInit {
 
  loginForm!: FormGroup;
  errMsg: string | null = null;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public service: ClaimitService,
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

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.service.adminLogin(email, password).subscribe(
        async (response: any) => {
          if (response.isAdmin) {
            localStorage.setItem('isLogin', 'true');
            this.service.updateRole('admin');
            localStorage.setItem('role', 'admin');
            await this.showToast('Login successful');
            await this.requestLocationPermission();
            this.router.navigate(['/claimIt/additem']);
            this.service.loginResponse.next(true);
          } else {
            this.showToast(response.message);
          }
        },
        (error: any) => {
          this.showToast(error.message || 'An unexpected error occurred.');
        }
      );
    } else {
      this.showToast('Please fill in all fields correctly.');
    }
  }


  async requestLocationPermission() {
    if (Capacitor.isNativePlatform()) {
      try {
        const permissionStatus = await Geolocation.requestPermissions();
        if (permissionStatus.location === 'granted') {
          const position = await Geolocation.getCurrentPosition();
          console.log('Location:', position);
        } else {
          this.showToast('Location permission denied.');
        }
      } catch (error) {
        this.showToast('Error requesting location permission.');
        console.error(error);
      }
    } else {
      this.showToast('Geolocation is not supported on the web.');
      console.warn('Geolocation plugin is not implemented for the web platform.');
    }
  }
  userNavigate(){
    localStorage.setItem('isLogin', 'true');
    this.service.updateRole('user');
    localStorage.setItem('role', 'user');
    this.router.navigate(['/claimIt/user-home']);
    this.service.loginResponse.next(true)
  }
  
  forgotPassword() {
    this.showToast('Forgot Password functionality coming soon.');
  }
}
