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
  searchQuery: string = '';
  itemId: any
  receivedDate: any = '';
  highlightedDates: any = [];
  newSelectedDate: string = '';
  isLoading: boolean = false;
  isImageModalOpen = false;
  selectedImage: string = '';
  selectedItems: boolean[] = [];
  selectedItemIds: any[] = [];
  isEditing: boolean = false;
  isAllChecked: boolean = false;
  selectedDate: any
  isAnyItemSelected: boolean = false;
  toDate: Date | null = null;
  startDate: any;
  endDate: any;
  fromDate: any;  // To store the selected fromDate
  toDatestore:any
  newExpiryDate: string = '';
  isUpdateMode: boolean = false; 
  @ViewChild('startDateInput') startDateInput!: ElementRef;
  @ViewChild('endDateInput') endDateInput!: ElementRef;
  isDateDisabled(date: Date | null): boolean {
    if (!date) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to 00:00:00 to compare dates only
    return date < today;
  }
  constructor(private datePipe: DatePipe,private claimService: ClaimitService, private alertController: AlertController,) { 

  }

  ngOnInit() {
    this.getData()
  }
  
  async onDateChange() : Promise<void>{
    const fromDate = this.startDateInput.nativeElement.value
      ? this.formatDate(new Date(this.startDateInput.nativeElement.value))
      : null;
    const toDate = this.endDateInput.nativeElement.value
      ? this.formatDate(new Date(this.endDateInput.nativeElement.value))
      : null;

    console.log("Selected Date Range:", fromDate, toDate);

    if (fromDate && toDate) {
      this.fromDate = fromDate;
      this.toDatestore = toDate;
      // const alert = await this.alertController.create({
      //   header: 'Change Date',
      //   message: 'Do you want to change the expired date to a new date?',
      //   inputs: [
      //     {
      //       name: 'newToDate',
      //       type: 'date',
      //       placeholder: 'Select a new "To Date"',
      //       value: this.selectedDate // Pre-populate with the current 'toDate'
      //     }
      //   ],
      //   buttons: [
      //     {
      //       text: 'Cancel',
      //       role: 'cancel',
      //       handler: () => {
      //         this.newToDate = '';  
      //       }
      //     },
      //     {
      //       text: 'Yes',
      //       handler: (data) => {
      //         this.updateDate();  
      //       }
      //     }
      //   ]
      // });
      this.getData(fromDate, toDate);
    }
  } 
  async onUpdate(): Promise<void> {
    this.isUpdateMode = true; // Enable update mode

    // Pre-populate the end date as the current "to date"
    const toDate = this.endDateInput.nativeElement.value
      ? this.formatDate(new Date(this.endDateInput.nativeElement.value))
      : null;

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
  updateDate(newExpireDate:any) {
    const fromDate = this.startDate ? this.formatDate(new Date(this.startDate)) : null;
    const toDate = this.endDate ? this.formatDate(new Date(this.endDate)) : null;

    const params = {
      fromDate: fromDate,
      toDate: toDate,
      expirationDate: newExpireDate,  // Send the new expiry date
    };

    console.log('Updating with params:', params);

    // Call the service to update the date
    // this.claimService.updateDate(params).subscribe(
    //   (response: any) => {
    //     if (response.Success === true) {
    //       this.getData();  // Refresh data based on updated dates
    //     } else {
    //       console.warn('Update was not successful:', response);
    //     }
    //   }
    // );
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
        this.isLoading = false;
        this.expiredItems = res;
        this.expiredItems.forEach(item => {
          item.receivedDate = new Date(item.receivedDate).toISOString().split('T')[0];
          item.expirationDate = new Date(item.expirationDate).toISOString().split('T')[0];
        });
       
        console.log("API Response:", this.expiredItems);
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
