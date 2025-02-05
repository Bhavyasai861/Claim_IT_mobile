import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { environment } from 'src/environments/enivonment.dev';

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
  isLoading: boolean = false;
  isImageModalOpen = false;
  selectedImage: string = '';
  
  constructor(private claimService: ClaimitService, private alertController: AlertController,) { }

  ngOnInit() {
    this.getData()
  }
 
  getData(selectedMonth?: number, selectedYear?: number) {
    this.isLoading = true;
    let url = environment.getExpiredItems; 
    if (selectedMonth && selectedYear) {
      url += `?month=${selectedMonth}&year=${selectedYear}`; // Append filters only if selected
    }
  
    this.claimService.getExpiredItems(url).subscribe(
      (res: any) => {
        this.isLoading = false;
        this.expiredItems = res;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching data:', error);
      }
    );
  }
  
  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }
  openImageModal(image: string) {
    this.selectedImage = `data:image/jpeg;base64,${image}`;
    this.isImageModalOpen = true;
  }
  closeImageModal() {
    this.isImageModalOpen = false;
  }
  openCalendarDialog() {
      this.isModalOpen = true;
  }
  async onDateSelected(event: any) {
    const selectedDate = event.detail.value.split('T')[0];   
    const selectedMonth = new Date(selectedDate).getMonth() + 1; 
    const selectedYear = new Date(selectedDate).getFullYear(); 
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
              this.updateDate(selectedMonth, selectedYear)
              this.isModalOpen = false;
              this.getData();  
            }
          }
        ]
      });
      await alert.present();
    }
  }
  
  updateDate(selectedMonth: number, selectedYear: number){
    const params = {
      month: selectedMonth,
      year: selectedYear,
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
