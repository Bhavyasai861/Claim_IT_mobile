import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { environment } from 'src/environments/enivonment.dev';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-expired-items',
  templateUrl: './expired-items.page.html',
  styleUrls: ['./expired-items.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatInputModule ],
  providers: [provideNativeDateAdapter(), DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class ExpiredItemsPage implements OnInit {
  expiredItems: any[] = []
  newToDate: any;
  isModalOpen = false;
  itemId: any
  receivedDate: any = '';
  newSelectedDate: string = '';
  isLoading: boolean = false;
  isImageModalOpen = false;
  selectedImage: string = '';
  selectedDate: any
  toDate: Date | null = null;
  startDate: any;
  endDate: any;
  fromDate: any;  // To store the selected fromDate
  newExpiryDate: string = '';
  isUpdateMode: boolean = false; 

  selectedFrom: string | null = null;
  selectedTo: string | null = null;
  dateError: boolean = false;  
  today = new Date();
  minDate: string = '2000-01-01'; // Set minimum selectable date
  maxDate: string = this.today.toISOString().split('T')[0]; // Disable future dates
  showCalendar: boolean = false;
  displayDateRange: string = 'Select Date Range';
  noRecord: boolean = false;
  constructor(private datePipe: DatePipe,private claimService: ClaimitService, private alertController: AlertController,) {   }

  ngOnInit() {
    this.getData()
  }
  
  async onDateChange(): Promise<void> {
    const fromDate = this.selectedFrom || null;
    const toDate = this.selectedTo || null;
    console.log('Selected Date Range:', fromDate, toDate);
    if (fromDate && toDate) {
      this.getData(fromDate, toDate);
    }
  }
  updateDateRange(event: any) {
    const selectedDate = event.detail.value.split('T')[0]; // Extract YYYY-MM-DD

    if (!this.selectedFrom) {
      this.selectedFrom = selectedDate;
      this.dateError = false;
    } else if (!this.selectedTo) {
      if (selectedDate >= this.selectedFrom) {
        this.selectedTo = selectedDate;
        this.dateError = false;
      } else {
        this.dateError = true;
      }
    } else {
      // Reset if user selects again
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
    this.isUpdateMode = true; // Enable update mode
    // Pre-populate the end date as the current "to date"
    const toDate = this.selectedTo|| null
    // Open an alert to confirm if they want to update the date
    const alert = await this.alertController.create({
      header: 'Update Date',
      message: 'Do you want to update the expired date?',
      inputs: [
        {
          name: 'newToDate',
          type: 'date',
          placeholder: 'Select a new "To Date"',
          value: toDate // Pre-populate with the current 'toDate'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.isUpdateMode = false;  // Cancel update, reset the flag
            this.newExpiryDate = '';  // Reset new expiry date
            console.log("this.newExpiryDate", this.newExpiryDate);

          }
        },
        {
          text: 'Yes',
          handler: (data) => {
            // Capture the selected new "to date"
            this.newExpiryDate = data.newToDate;
            console.log("this.newExpiryDate", this.newExpiryDate);
        
            this.updateDate(this.newExpiryDate);  // Call update method
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
  updateDate(newExpireDate:any) {
    const fromDate =  this.selectedFrom
    const toDate = this.selectedTo

    const params = {
      fromDate: fromDate,
      toDate: toDate,
      expirationDate: newExpireDate,  // Send the new expiry date
    };

    console.log('Updating with params:', params);

    // Call the service to update the date
    this.claimService.updateDate(params).subscribe(
      (response: any) => {
        if (response.Success === true) {
          this.getData();
          this.selectedFrom = null;
          this.selectedTo = null;
          this.isUpdateMode = false;  // Refresh data based on updated dates
        } else {
          console.warn('Update was not successful:', response);
        }
      }
    );
  }

  // The rest of your methods...


  // Custom method to update the date logic and pass params to API
  // updateDate() {
  //   const fromDate = this.startDate ? this.formatDate(new Date(this.startDate)) : null;
  //   const toDate = this.endDate ? this.formatDate(new Date(this.endDate)) : null;

  //   const params = {
  //     fromDate: fromDate,
  //     toDate: toDate,
  //     expirationDate: this.newToDate,
  //   };

  //   console.log('Updating with params:', params);

  //   // Call the service to update the date
  //   this.claimService.updateDate(params).subscribe(
  //     (response: any) => {
  //       if (response.Success === true) {
  //         this.getData();  // Refresh data based on updated dates
  //       } else {
  //         console.warn('Update was not successful:', response);
  //       }
  //     }
  //   );
  // }


  getData(fromDate?: string, toDate?: string) {
    this.isLoading = true;
    // If no date range is selected, use the default URL for archived items
    let url = '';
    if (fromDate && toDate) {
      url = `${environment.getExpiredItems}?fromDate=${fromDate}&toDate=${toDate}`;
    } else {
      // Use the default URL if no date range is provided
      url = 'http://172.17.12.38:8081/claimit/items/archived';
    }

    console.log("API Request URL:", url); // Log the API request URL

    this.claimService.getExpiredItems(url).subscribe(
      (res: any) => {
        console.log(res.length);
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
        console.log("API Response:", this.expiredItems,this.isLoading);
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


  onModalDismiss() {
    setTimeout(() => {
      this.isModalOpen = false;
    }, 300);
  }
  closeCalendarDialog() {
    this.isModalOpen = false;
  }
}
