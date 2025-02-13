import { CommonModule, formatDate } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { environment } from 'src/environments/enivonment.dev';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-expired-items',
  templateUrl: './expired-items.page.html',
  styleUrls: ['./expired-items.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatInputModule],
  providers: [provideNativeDateAdapter(), DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class ExpiredItemsPage implements OnInit {
  expiredItems: any[] = []
  newToDate: any;
  isModalOpen = false;
  receivedDate: any = '';
  isLoading: boolean = false;
  isImageModalOpen = false;
  selectedImage: string = '';
  selectedDate: any
  toDate: Date | null = null;
  fromDate: any;  // To store the selected fromDate
  newExpiryDate: string = '';
  isUpdateMode: boolean = false;
  selectedFrom: string | null = null;
  selectedTo: string | null = null;
  dateError: boolean = false;
  today = new Date();
  minDate: string = '2000-01-01'; 
  maxDate: string = this.today.toISOString().split('T')[0];
  showCalendar: boolean = false;
  displayDateRange: string = 'Select Date Range';
  noRecord: boolean = false;
  constructor(private datePipe: DatePipe, private claimService: ClaimitService, private alertController: AlertController,) { }

  ngOnInit() {
    this.getData()
  }
  getData(fromDate?: string, toDate?: string) {
    this.isLoading = true;
    let url = '';
    if (fromDate && toDate) {
      url = `${environment.getExpiredItems}?fromDate=${fromDate}&toDate=${toDate}`;
    } else {
      url = 'https://100.28.242.219.nip.io/api/admin/archived';
    }
    this.claimService.getExpiredItems(url).subscribe(
      (res: any) => {
        this.expiredItems = res;
        if (res.length !== 0) {
          this.noRecord = false;
        }
        else {
          this.noRecord = true;
        }
        this.expiredItems.forEach(item => {
          item.receivedDate = new Date(item.receivedDate).toISOString().split('T')[0];
          item.expirationDate = new Date(item.expirationDate).toISOString().split('T')[0];
        });
        this.isLoading = false;        
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching data:', error);
      }
    );
  }

  async onDateChange(): Promise<void> {
    const fromDate = this.selectedFrom || null;
    const toDate = this.selectedTo || null;
    if (fromDate && toDate) {
      this.getData(fromDate, toDate);
    }
  }
  changeDate(dateString: string | null): string {
    if (!dateString) return '';
    return formatDate(dateString, 'MMM-dd-yyyy', 'en-US'); // "Feb 21 2025"
  }
  updateDateRange(event: any) {
    const selectedDate = event.detail.value.split('T')[0];  
    if (!this.selectedFrom) {
      this.selectedFrom = selectedDate;
      this.dateError = false;
    } else if (!this.selectedTo) {
      if (selectedDate >= this.selectedFrom) {
        this.selectedTo = selectedDate;
        this.dateError = false;  
        // Automatically fetch data once both dates are set
        this.onDateChange();
      } else {
        this.dateError = true;
      }
    } else {
      this.selectedFrom = selectedDate;
      this.selectedTo = null;
      this.dateError = false;
    }
  }
  

  openCalendar() {
    this.showCalendar = true;
  }
  closeModal() {
    this.showCalendar = false;
  }
  async onUpdate(): Promise<void> {
    this.isUpdateMode = true; 
    const toDate = this.selectedTo || null
    const alert = await this.alertController.create({
      header: 'Update Date',
      message: 'Do you want to update the expired date?',
      inputs: [
        {
          name: 'newToDate',
          type: 'date',
          placeholder: 'Select a new "To Date"',
          value: toDate 
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.isUpdateMode = false;  
            this.newExpiryDate = '';
            console.log("this.newExpiryDate", this.newExpiryDate);

          }
        },
        {
          text: 'Yes',
          handler: (data) => {
            this.newExpiryDate = data.newToDate;
            console.log("this.newExpiryDate", this.newExpiryDate);

            this.updateDate(this.newExpiryDate);  
          }
        }
      ]
    });
    await alert.present();
  }
  // Format date to a suitable string format
  formatDate(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  clearSelectedDates() {
    this.selectedFrom = null;
    this.selectedTo = null;
    this.noRecord = false;
    this.getData();
  }
  updateDate(newExpireDate: any) {
    const fromDate = this.selectedFrom
    const toDate = this.selectedTo

    const params = {
      fromDate: fromDate,
      toDate: toDate,
      expirationDate: newExpireDate,  
    };
    // Call the service to update the date
    this.claimService.updateDate(params).subscribe(
      (response: any) => {
        if (response.Success === true) {
          this.getData();
          this.selectedFrom = null;
          this.selectedTo = null;
          this.isUpdateMode = false; 
        } else {
          console.warn('Update was not successful:', response);
        }
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

  onModalDismiss() {
    setTimeout(() => {
      this.isModalOpen = false;
    }, 300);
  }
  closeCalendarDialog() {
    this.isModalOpen = false;
  }
}
