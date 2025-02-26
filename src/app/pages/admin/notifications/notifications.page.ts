import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { LoaderComponent } from '../loader/loader.component';
import { ErrorService } from '../../SharedServices/error.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone:true,
  imports:[CommonModule,IonicModule,FormsModule,LoaderComponent]
})
export class NotificationsPage implements OnInit {

  pendingClaims: any[] = [];
  notifications: any[] = [];
  loader = true;
  isLoading: boolean = false;
  noRecord:boolean= false
  errorImage: string | null = null;
  errorMessage: string = '';

  constructor(private claimService: ClaimitService,private errorService: ErrorService) {}

  async ngOnInit() {
    this.pendingClaims = await this.claimService.getClaims();
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.claimService.getNotifications().subscribe(
      (res: any) => {
        if (res && res.data) {
          this.isLoading = false;
          this.notifications = res.data; 
          if (res.length !== 0) {
            this.noRecord = false;
          }
          else {
            this.noRecord = true;
          }
          const unreadNotifications = this.notifications.filter(notification => !notification.read);
          const unreadCount = unreadNotifications.length;
          this.claimService.setNotificationCount(unreadCount);
          this.loader = false;
        }
      },(error) => {
        this.isLoading = false;
        this.errorImage = this.errorService.getErrorImage(error.status);
        this.errorMessage = this.errorService.getErrorMessage(error.status);
        console.error('Error fetching categories:', error.status);
      },
    );
  }

  async markAsRead(notificationId: any) {
    const reqBody = {
      id: notificationId,
      isRead: true,
    };
  
    this.isLoading = true;
  
    try {
      const response = await this.claimService.updateNotification(reqBody);
      if (response) {
        this.loadNotifications();
      } else {
        console.warn('Failed to mark notification as read:', response);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  
}
