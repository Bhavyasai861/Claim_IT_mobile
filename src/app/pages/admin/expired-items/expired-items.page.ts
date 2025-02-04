import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';

@Component({
  selector: 'app-expired-items',
  templateUrl: './expired-items.page.html',
  styleUrls: ['./expired-items.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExpiredItemsPage implements OnInit {
  expiredItems: any = []
  isModalOpen = false;
  searchQuery: string = '';
  itemId:any
  receivedDate: string = '';
  highlightedDates: any = [];
  newSelectedDate: string = '';
  constructor(private claimService: ClaimitService, private alertController: AlertController,) { }

  ngOnInit() {
    this.getData()
  }
  getData() {
    this.claimService.getExpiredItems().subscribe(
      (res: any) => {
        this.expiredItems = res
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

  }
  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }
  openCalendarDialog(item: any) {
    this.itemId = item.itemId;  
    console.log(this.itemId,"sdihw");
    
    const date = new Date(item.receivedDate);
    this.receivedDate = date.toISOString().split('T')[0];
    this.highlightedDates = [
      {
        date: this.receivedDate,
        textColor: 'white',
        backgroundColor: '#00897b'
      }
    ];

    this.isModalOpen = true;
  }
  async onDateSelected(event: any) {
    const selectedDate = event.detail.value.split('T')[0];    
    if (selectedDate > this.receivedDate) {
      this.newSelectedDate = selectedDate;
      const alert = await this.alertController.create({
        header: 'Change Date',
        message: 'Do you want to change the received date?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.newSelectedDate = ''; 
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.receivedDate = this.newSelectedDate;
              this.updateDate()
              this.isModalOpen = false;
            }
          }
        ]
      });
      await alert.present();
    }
  }
  updateDate(){
    const params = {
      itemId: this.itemId,
      expirationDate: this.receivedDate,
    };
    this.claimService.updateDate(params).subscribe(
      (response: any) => {  
        if (response.Success === true) { 
          this.getData();  
        } else {
          console.warn('Update was not successful:', response);
        }
      }
    );
  }
  onModalDismiss() {
    setTimeout(() => {
      this.isModalOpen = false;
    }, 300);
  }
  closeCalendarDialog() {
    this.isModalOpen = false;
  }
}
