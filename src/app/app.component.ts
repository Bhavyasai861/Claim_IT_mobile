import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ClaimitService } from './pages/SharedServices/claimit.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  appPages: any[] = [];
  public isMenuOpen = false;

  constructor(private navCtrl: NavController, private alertController: AlertController,private  service: ClaimitService) {
    this.loadSideMenu();
  }

  ionViewWillEnter() {
    this.loadSideMenu();
  }

  loadSideMenu() {
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      this.appPages = [
        { title: 'Dashboard', url: 'admin-home', icon: 'home-outline' },
        { title: 'Additem', url: 'additem', icon: 'add-circle-outline' },
        { title: 'Approve / Reject', url: 'approve-reject', icon: 'checkmark-circle-outline' },
        { title: 'Notifications', url: 'notifications', icon: 'notifications-outline' },
        { title: 'Logout', icon: 'log-out-outline', action: 'logout' }, 
      ];
    } else if (role === 'user') {
      this.appPages = [
        { title: 'Dashboard', url: 'dashboard', icon: 'home-outline' },
        { title: 'Search & Claim', url: 'user-home', icon: 'search-outline' },
        { title: 'View / Unclaim', url: 'view-claim', icon: 'eye-outline' },
        { title: 'Logout', icon: 'log-out-outline', action: 'logout' }, 
      ];
    }else{
      this.appPages=[]
    }
  }

  // Show confirmation popup for logout
  async showLogoutConfirmation() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Logout canceled');
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.logout();
          },
        },
      ],
    });

    await alert.present();
  }

  logout() {
    this.service.updateRole('');
    this.navCtrl.navigateRoot('login'); 
  }

  handleMenuItemClick(action: string) {
    if (action === 'logout') {
      this.showLogoutConfirmation(); 
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
