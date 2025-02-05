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
      return [
        { title: 'Dashboard', url: '/claimIt/admin-home', icon: 'home-outline' },
        { title: 'Additem', url: '/claimIt/additem', icon: 'add-circle-outline' },
        { title: 'Approve / Reject', url: '/claimIt/approve-reject', icon: 'checkmark-circle-outline' },
        { title: 'Expired Items', url: '/claimIt/expired-items', icon: 'pricetag-outline' },
        { title: 'Category Management', url: '/claimIt/category-management', icon: 'notifications-outline' },
        { title: 'Notifications', url: '/claimIt/notifications', icon: 'notifications-outline' },
        { title: 'Logout', icon: 'log-out-outline', action: 'logout' }, 
      ];
    } else if (role === 'user') {
      return [
        { title: 'Dashboard', url: '/claimIt/dashboard', icon: 'home-outline' },
        { title: 'Search & Claim', url: '/claimIt/user-home', icon: 'search-outline' },
        { title: 'View / Unclaim', url: '/claimIt/view-claim', icon: 'eye-outline' },
        { title: 'Logout', icon: 'log-out-outline', action: 'logout' }, 
      ];
    }else{
      return []
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
