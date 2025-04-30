import { CommonModule, formatDate } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { LoaderComponent } from '../loader/loader.component';
import { ErrorService } from '../../SharedServices/error.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-expired-items',
  templateUrl: './expired-items.page.html',
  styleUrls: ['./expired-items.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatInputModule,LoaderComponent],
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
  selectedFrom: any | null = null;
  selectedTo: any | null = null;
  dateError: boolean = false;
  today = new Date();
  minDate: string = '2000-01-01'; 
  maxDate: string = this.today.toISOString().split('T')[0];
  showCalendar: boolean = false;
  displayDateRange: string = 'Select Date Range';
  noRecord: boolean = false;
  popoverEvent: any;
  popoverOpen = false;
  showToast = false;
  orgData:any
  errorImage: string | null = null;
  errorMessage: string = '';
  selectedOrgId:any
  highlightedDates: { date: string, textColor: string, backgroundColor: string }[] = [];
  selectedOrg: any = null;
  orgId:any
  orgName:any
  userRole: string | null = '';
  organizations: any[] = [];

  constructor(private http: HttpClient,private datePipe: DatePipe,private changeDetectorRef: ChangeDetectorRef, private claimService: ClaimitService,private errorService: ErrorService, private alertController: AlertController,private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadSelectedOrganization()
    this.getData()
    this.getorgId()
  }
  fetchOrganizations() {
    this.http.get<any[]>('http://172.17.12.101:8081/api/users/organisation').subscribe(
      (response) => {
        this.organizations = response;
  
        // Ensure selectedOrgId is set after organizations are loaded
        const storedOrgId = localStorage.getItem('organizationId');
        if (storedOrgId) {
          const matchedOrg = this.organizations.find(org => org.orgId == storedOrgId);
          if (matchedOrg) {
            this.selectedOrgId = matchedOrg.orgId;
          }
        }
      },
      (error: any) => {
        console.error('Error fetching organizations:', error);
      }
    );
  }
  
  loadSelectedOrganization() {
    this.orgId = localStorage.getItem('organizationId');
    this.orgName = localStorage.getItem('organizationName');
    this.userRole = localStorage.getItem('role');
    
    this.selectedOrgId = this.orgId ? this.orgId : ''; // Set initially selected orgId
    this.fetchOrganizations();
  }
  
  onOrganizationChange(event: any) {
    const selectedOrg = this.organizations.find(org => org.orgId == event.detail.value);
    if (selectedOrg) {
      localStorage.setItem('organizationId', selectedOrg.orgId);
      localStorage.setItem('organizationName', selectedOrg.orgName);
    }
     this.orgId = localStorage.getItem('organizationId');
     console.log(this.orgId);
     this.getData()
  }

  getImage(base64String: string): string {
    return `${base64String}`;
  }

  getData(fromDate?: string, toDate?: string, orgId?: string) {
     
    this.orgId = orgId || localStorage.getItem('organizationId');
    this.isLoading = true;
    let url = 'http://172.17.12.101:8081/api/admin/archived';
    const params = [];  
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    if (this.orgId) params.push(`orgId=${this.orgId}`); 

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    this.claimService.getExpiredItems(url).subscribe(      
      (res: any) => {
        if (res && Array.isArray(res)) {
          this.expiredItems = res;
          this.noRecord = res.length === 0;
          this.isLoading = false;

          this.expiredItems.forEach(item => {
            item.receivedDate = new Date(item.receivedDate).toISOString().split('T')[0];
            item.expirationDate = new Date(item.expirationDate).toISOString().split('T')[0];
          });

          this.cdr.detectChanges();
        } else {
          console.warn('Unexpected response format:', res);
        }
      },
      (error) => {
        this.changeDetectorRef.detectChanges();
        this.errorImage = this.errorService.getErrorImage(error.status);
        this.errorMessage = this.errorService.getErrorMessage(error.status);
        this.isLoading = false;
        console.error('Error fetching data:', error);
      },
      () => {
        this.isLoading = false; 
      }
    );
}

  async onDateChange(event: any): Promise<void> {
    const selectedDate = event.detail.value.split('T')[0];
    const fromDate = this.selectedFrom ;
    const toDate = this.selectedTo ;    
    const selectedOrgId = this.selectedOrgId || localStorage.getItem('organizationId');  
    if (fromDate && toDate) {
      this.getData(fromDate, toDate, selectedOrgId);
    }
  }
  // selectOrg(orgId: string) {
  //   this.selectedOrgId = orgId;
  //   this.popoverOpen = false;
  //   this.getData(this.selectedFrom, this.selectedTo, this.selectedOrgId);
  // }
  
  changeDate(dateString: string | null): string {
    if (!dateString) return '';
    return formatDate(dateString, 'MMM-dd-yyyy', 'en-US'); // "Feb 21 2025"
  }
  updateDateRange(event: any) {
    const selectedDate = event.detail.value.split('T')[0];
    const selectedOrgId = this.selectedOrgId || localStorage.getItem('organizationId'); 
    if (!this.selectedFrom) {
      this.selectedFrom = selectedDate;
      this.selectedTo = null;
      this.dateError = false;
    } else if (!this.selectedTo) {
      if (selectedDate >= this.selectedFrom) {
        this.selectedTo = selectedDate;
        this.dateError = false;
      } else {
        this.dateError = true;
      }
    } else {
      this.selectedFrom = selectedDate;
      this.selectedTo = null;
      this.dateError = false;
    }
    this.getData(this.selectedFrom,this.selectedTo,selectedOrgId)
    this.updateHighlightedDates();
  }

  updateHighlightedDates() {
    this.highlightedDates = [];
    if (this.selectedFrom) {
      this.highlightedDates.push({ date: this.selectedFrom, textColor: 'white', backgroundColor: '#3b82f6' });
    }
    if (this.selectedTo) {
      this.highlightedDates.push({ date: this.selectedTo, textColor: 'white', backgroundColor: '#3b82f6' });
    }
  }
  getorgId(){
    this.claimService.getOrgId().subscribe(
      (response) => {
        this.orgData = response;
      },
      (error) => {
        this.changeDetectorRef.detectChanges();
        this.errorImage = this.errorService.getErrorImage(error.status);
        this.errorMessage = this.errorService.getErrorMessage(error.status);
      }
    );
  }
  openPopover(event: any): void {
    this.popoverEvent = event; 
    this.popoverOpen = true;
  }
  openCalendar() {
    this.showCalendar = true;
  }
  closeModal() {
    this.showCalendar = false;
  }
  formatDate(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  goBack() {
    this.errorImage = null;
    this.getData()
    this.getorgId()
  }
  clearSelectedDates() {
    this.selectedFrom = null;
    this.selectedTo = null;
    this.noRecord = false;
    this.errorImage = null
    this.getData();
  }
  async onUpdate(): Promise<any> {
    if (!this.selectedFrom || !this.selectedTo) {
      this.showToast = true;
      return;
    }
    this.isUpdateMode = true;
    this.isLoading = false;

    const toDate = this.selectedTo || null;
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
            this.isLoading = false;
          }
        },
        {
          text: 'Yes',
          handler: (data) => {
            this.newExpiryDate = data.newToDate;
            this.updateDate(this.newExpiryDate);
          }
        }
      ]
    });

    await alert.present();
    alert.onDidDismiss().then(() => {
        if (!this.isUpdateMode) {
            this.isLoading = false;
        }
    });
}

updateDate(newExpireDate: any) {
  this.orgId = localStorage.getItem('organizationId');
    const fromDate = this.selectedFrom;
    const toDate = this.selectedTo;
    const params = {
      fromDate: fromDate,
      toDate: toDate,
      expirationDate: newExpireDate,  
      orgId: this.orgId
    };
    this.isLoading = false;
    this.claimService.updateDate(params).subscribe({
      next: (response: any) => {
        if (response.Success === true) {
          this.isLoading = false; 
          this.getData();
          this.selectedFrom = null;
          this.selectedTo = null;
          this.isUpdateMode = false;
        } else {
        }
        this.isLoading = false; 
      },
      error: (error) => {
        this.errorImage = this.errorService.getErrorImage(error.status);
        this.errorMessage = this.errorService.getErrorMessage(error.status);
        console.error("API Error:", error);
        this.changeDetectorRef.detectChanges();
        this.isLoading = false; 
      },
      complete: () => {
        this.isLoading = false; 
      }
    });
}
 
  openImageModal(image: string) {
    this.selectedImage = `${image}`;
    this.isImageModalOpen = true;
  }
  closeImageModal() {
    this.isLoading = false
    this.isImageModalOpen = false;
  }

  onModalDismiss() {
    this.isLoading = false
    setTimeout(() => {
      this.isModalOpen = false;
    }, 300);
  }
  closeCalendarDialog() {
    this.isModalOpen = false;
  }
}
