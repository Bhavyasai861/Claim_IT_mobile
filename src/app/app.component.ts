import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  appPages: any[] = [];
  public isMenuOpen = false;
  constructor() {
    this.loadSideMenu();
  }
  ionViewWillEnter(){
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
        { title: 'Logout', url: 'login', icon: 'log-out-outline' }, 
      ];
    } else if (role === 'user') {
      this.appPages = [
        { title: 'Dashboard', url: 'dashboard', icon: 'home-outline' }, 
        { title: 'Search & Claim', url: 'user-home', icon: 'search-outline' }, 
        { title: 'View / Unclaim', url: 'view-claim', icon: 'eye-outline' }, 
        { title: 'Logout', url: 'login', icon: 'log-out-outline' }, 
      ];
    }
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

