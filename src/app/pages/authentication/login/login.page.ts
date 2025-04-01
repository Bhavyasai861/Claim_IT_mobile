import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { ClaimitService } from 'src/app/pages/SharedServices/claimit.service';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { LoaderComponent } from '../../admin/loader/loader.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, LoaderComponent],
  providers: [ClaimitService]
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;
  errMsg: string | null = null;
  hidePassword = true;
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    public service: ClaimitService,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

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
      this.isLoading = true;
      this.service.adminLogin(email, password).subscribe(
        async (response: any) => {
          this.isLoading = false;
          if (response.isAdmin) {
            localStorage.setItem('isLogin', 'true');
            this.service.updateRole('admin');
            localStorage.setItem('role', 'admin');
            await this.showToast('Login successful');
            localStorage.setItem('organizations', JSON.stringify(response.organizations));
            await this.requestLocationPermission();
  
            this.showOrganizationSelection();
  
            this.service.loginResponse.next(true);
          } else if(response.isSuperAdmin){
            localStorage.setItem('isLogin', 'true');
            this.service.updateRole('superadmin');
            localStorage.setItem('role', 'superadmin');
            await this.showToast('Login successful');
            this.showOrganizationSelection();
          }
            else {
            this.showToast(response.message);
          }
        },
        (error: any) => {
          this.isLoading = false;
          let errorMessage = 'An unexpected error occurred.';
          if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          this.showToast(errorMessage);
        }
      );
    } else {
      this.isLoading = false;
      this.showToast('Please fill in all fields correctly.');
    }
  }
  
  async showOrganizationSelection() {
    const role = localStorage.getItem('role');   
    if (role === 'admin') {
      const storedOrganizations = localStorage.getItem('organizations');
  
      if (!storedOrganizations) {
        this.showToast('No organizations available.');
        return;
      }
      const organizations = JSON.parse(storedOrganizations);  
      if (!Array.isArray(organizations) || organizations.length === 0) {
        this.showToast('No organizations available.');
        return;
      }
      const alert = await this.alertController.create({
        header: 'Select Organization',
        inputs: organizations.map((org: { orgName: string; orgId: string }) => ({
          type: 'radio',
          label: org.orgName,
          value: { id: org.orgId, name: org.orgName }
        })),
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Confirm',
            handler: (selectedOrg) => {
              if (selectedOrg) {
                localStorage.setItem('organizationId', selectedOrg.id);
                localStorage.setItem('organizationName', selectedOrg.name);
                this.router.navigate(['/claimIt/additem']);
              } else {
                this.showToast('Please select an organization.');
              }
            }
          }
        ]
      });
  
      await alert.present();
  
    } else if (role === 'superadmin') {
      this.http.get<any[]>('http://172.17.12.101:8081/api/users/organisation').subscribe(async (organizations) => {
        if (!organizations || organizations.length === 0) {
          this.showToast('No organizations available.');
          return;
        }
  
        const alert = await this.alertController.create({
          header: 'Select Organization',
          inputs: organizations.map(org => ({
            type: 'radio',
            label: org.orgName,
            value: { id: org.orgId, name: org.orgName }
          })),
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Confirm',
              handler: (selectedOrg) => {
                if (selectedOrg) {
                  localStorage.setItem('organizationId', selectedOrg.id);
                  localStorage.setItem('organizationName', selectedOrg.name);
                  this.router.navigate(['/claimIt/additem']);
                } else {
                  this.showToast('Please select an organization.');
                }
              }
            }
          ]
        });
  
        await alert.present();
      }, (error) => {
        this.showToast('Failed to load organizations.');
      });
    }
  }
  
  // async onSubmit() {
  //   if (this.loginForm.valid) {
  //     const { email, password } = this.loginForm.value;
  //     this.isLoading = true;
  //     this.service.adminLogin(email, password).subscribe(
  //       async (response: any) => {
  //         if (response.isAdmin) {
  //           this.isLoading = false;
  //           localStorage.setItem('isLogin', 'true');
  //           this.service.updateRole('admin');
  //           localStorage.setItem('role', 'admin');
  //           await this.showToast('Login successful');
  //           await this.requestLocationPermission();
  //           this.router.navigate(['/claimIt/additem']);
  //           this.service.loginResponse.next(true);
  //         } else {
  //           this.isLoading = false;
  //           this.showToast(response.message);
  //         }
  //       },
  //       (error: any) => {
  //         this.isLoading = false;
  //         this.showToast(error.message || 'An unexpected error occurred.');
  //       }
  //     );
  //   } else {
  //     this.isLoading = false;
  //     this.showToast('Please fill in all fields correctly.');
  //   }
  // }


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
  userNavigate() {
    this.http.get<any[]>('http://172.17.12.101:8081/api/users/organisation').subscribe(async (organizations) => {
      if (organizations.length === 0) {
        this.showToast('No organizations available.');
        return;
      }
      const alert = await this.alertController.create({
        header: 'Select Organization',
        inputs: organizations.map(org => ({
          type: 'radio',
          label: org.orgName,
          value: { id: org.orgId, name: org.orgName }
        })),
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Confirm',
            handler: (selectedOrg) => {
              if (selectedOrg) {
                localStorage.setItem('organizationId', selectedOrg.id);
                localStorage.setItem('organizationName', selectedOrg.name);
                localStorage.setItem('isLogin', 'true');
                this.service.updateRole('user');
                localStorage.setItem('role', 'user');
                this.router.navigate(['/claimIt/user-home']);
                this.service.loginResponse.next(true)

              } else {
                this.showToast('Please select an organization.');
              }
            }
          }
        ]
      });

      await alert.present();
    }, (error) => {
      this.showToast('Failed to load organizations.');
    });

    // this.router.navigate(['/claimIt/user-home']);
  }

  forgotPassword() {
    this.showToast('Forgot Password functionality coming soon.');
  }
}
