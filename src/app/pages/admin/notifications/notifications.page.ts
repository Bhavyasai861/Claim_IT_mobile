import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone:true,
  imports:[CommonModule,IonicModule,FormsModule]
})
export class NotificationsPage implements OnInit {

  pendingClaims: any[] = [];
  notifications: any[] = [];
  loader = true;
  isLoading: boolean = false;
  constructor(private claimService: ClaimitService) {}

  async ngOnInit() {
    this.pendingClaims = await this.claimService.getClaims();
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.claimService.getNotifications().subscribe(
      (res: any) => {
        if (res && res.data) {
          this.isLoading = true;
          this.notifications = res.data; 
          const unreadNotifications = this.notifications.filter(notification => !notification.read);
          const unreadCount = unreadNotifications.length;
          this.claimService.setNotificationCount(unreadCount);
          this.loader = false;
        }
      },
    );
  }

  async markAsRead(notificationId: any) {
    const reqBody = {
      id: notificationId,
      isRead: true,
    };
      const response = await this.claimService.updateNotification(reqBody);
      if (response) {
        this.loadNotifications();
      }
    } 
  
}
