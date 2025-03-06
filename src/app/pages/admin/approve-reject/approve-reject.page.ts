import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonLoading, ModalController } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { LoaderComponent } from '../loader/loader.component';
import { catchError, of } from 'rxjs';
import { ErrorService } from '../../SharedServices/error.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-approve-reject',
  templateUrl: './approve-reject.page.html',
  styleUrls: ['./approve-reject.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule,LoaderComponent],
})
export class ApproveRejectPage implements OnInit {
  approveRejectForm!: FormGroup;
  isPopoverOpen: boolean = false;
  currentDate: any = new Date();
  searchResults: any = [];
  normalResponse: any = [];
  selectedDate: Date | null = null;
  isModalOpen = false;
  modalOpen = false;
  adminActions = true;
  alertButtons = ['Action'];
  @ViewChild('popover') popover!: HTMLIonPopoverElement;
  currentFilter: string = 'name';
  currentFilterPlaceholder: string = 'Search by name';
  searchValue: string = '';
  isFilterPopoverOpen = false;
  PopoverOpen = false;
  popoverOpen = false;
  popoverEvent: any;
  isImageModalOpen = false;
  selectedItemIndex: number | null = null;
  selectedImage: string = '';
  isLoading: boolean = false;
  noRecord: boolean = false;
  errorImage: string | null = null;
  errorMessage: string = '';
  selectedOrgId:any
  selectedOrg: any = null;
  orgId:any
  orgName:any
  userRole: string | null = '';
  organizations: any[] = [];
  public statusDropDown: any = [
    { label: 'REJECTED', value: 'REJECTED' },
    { label: 'PENDING_APPROVAL', value: 'PENDING APPROVAL' },
    { label: 'PENDING_PICKUP', value: 'PENDING PICKUP' },
    { label: 'CLAIMED', value: 'CLAIMED' },
    { label: 'UNCLAIMED', value: 'UNCLAIMED' },
  ];
  allData: any;

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimitService,
    private modalController: ModalController,
    private errorService: ErrorService,
    private http:HttpClient
  ) { }

  presentPopover(event: Event, item: any, index: number) {
    this.popoverEvent = event;
    if (this.selectedItemIndex === index) {
      this.isPopoverOpen = false;
      this.selectedItemIndex = null;
    } else {
      this.isPopoverOpen = true;
      this.selectedItemIndex = index;
    }
  }
  ngOnInit() {
    this.approveRejectForm = this.fb.group({
      email: [''],
      date: [''],
      status: [''],
      name: [''],
    });
    this.loadSelectedOrganization()
    this.search(this.orgId);
  }
  fetchOrganizations() {
    this.http.get<any[]>('http://52.45.222.211:8081/api/users/organisation').subscribe(
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
      (error) => {
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
     this.search(this.orgId);
  }
  
  toggleFilterPopover(event: Event) {
    this.isFilterPopoverOpen = true;
    this.popoverEvent = event;
  }

  toggleFilterPopoverApprove(event: Event) {
    this.PopoverOpen = true;
    this.popoverEvent = event
  }

  openImageModal(image: string) {
    this.selectedImage = `data:image/jpeg;base64,${image}`;
    this.isImageModalOpen = true;
  }

  closeImageModal() {
    this.isImageModalOpen = false;
  }
  getStatus(receivedDate: string, currentStatus: string): string {
    const received = new Date(receivedDate);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - received.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays > 30 ? 'EXPIRED' : currentStatus;
  }
  async confirmRemove(event: any) {
    const confirmed = await this.presentConfirmationDialog('Item Expired', 'Do you want to expire the item?');
    if (confirmed === 'yes') {
      const itemId = event.itemId;
      this.isLoading = true;
      this.claimService.adminRemoveItem(itemId).subscribe(
        async (res: any) => {
          this.isLoading = false;
          this.isPopoverOpen = false;
          await this.presentConfirmationDialog('Expired Successful', 'The item has been expired.', true);
          this.search(this.orgId);
        },
        (error) => {
          this.isPopoverOpen = false;
          this.isLoading = false;
          console.error('Error removing item:', error);
        }
      );
    } else {
      this.isLoading = false;
      this.isPopoverOpen = false;
    }
  }
  async approveClaim(event: any) {
    const confirmed = await this.presentConfirmationDialog('Approve Claim', 'Are you sure you want to approve this claim?');
    if (confirmed === 'yes') {
      const params = {
        itemId: event.itemId,
        status: 'PENDING_PICKUP',
      };
      this.isPopoverOpen = false;
      this.isLoading = true;

      this.claimService.approveOrRejectClaim(params).subscribe(
        async (res: any) => {
          this.isLoading = false;
          
          // Close the popover immediately after approval
          this.isPopoverOpen = false;
  
          await this.presentConfirmationDialog('Success!!', 'Claim Request Approved Successfully', true);
          this.search(this.orgId);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error approving claim:', error);
          
          // Close popover even if there's an error
          this.isPopoverOpen = false;
        }
      );
    } else {
      // Ensure popover is closed when the user cancels
      this.isPopoverOpen = false;
    }
  }
  


  async rejectClaim(event: any) {
    this.isPopoverOpen = false;
    const reason = await this.presentRejectClaimDialog('Reject Claim', 'Are you sure you want to reject this claim?');
    if (reason) {
      const params = {
        itemId: event.itemId,
        status: 'REJECTED',
        reasonForReject: reason,
      };

      this.isLoading = true;
      this.claimService.approveOrRejectClaim(params).subscribe(
        async (res: any) => {
          await this.presentConfirmationDialog('Success!!', 'Claim Request Rejected Successfully');
          this.search(this.orgId);
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          console.error('Error rejecting claim:', error);
        }
      );
    }
    setTimeout(() => {
      this.isPopoverOpen = false;
    }, 200);
  }

  async markClaimed(event: any) {
    this.isPopoverOpen = false;
    await new Promise(resolve => setTimeout(resolve, 200));
    const confirmed = await this.presentConfirmationDialog(
      'Mark as Claimed',
      'Are you sure you want to mark this item as Claimed?'
    );

    if (confirmed === 'yes') {
      const params = {
        itemId: event.itemId,
        claimStatus: 'CLAIMED',
        userId: event.userId,
      };

      this.isLoading = true;
      this.claimService.markASClaimed(params).subscribe(
        async (res: any) => {
          this.isLoading = false;
          await this.presentConfirmationDialog('Success!!', 'Item Claimed Successfully', true);  // Success dialog with only "OK" button
          this.search(this.orgId);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error marking item as claimed:', error);
        }
      );
    }

    setTimeout(() => {
      this.isPopoverOpen = false;
    }, 200);
  }


  async presentConfirmationDialog(title: string, message: string, isSuccess: boolean = false): Promise<string> {
    return new Promise<string>((resolve) => {
      const dialog = document.createElement('ion-alert');
      dialog.header = title;
      dialog.message = message;
      if (isSuccess) {
        dialog.buttons = [{ text: 'OK', role: 'confirm', handler: () => resolve('ok') }];
      } else {
        dialog.buttons = [
          { text: 'Cancel', role: 'cancel', handler: () => resolve('no') },
          { text: 'Yes', role: 'confirm', handler: () => resolve('yes') },
        ];
      }
      document.body.appendChild(dialog);
      dialog.present();
    });
  }


  async presentRejectClaimDialog(title: string, message: string): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      const dialog = document.createElement('ion-alert');
      dialog.header = title;
      dialog.message = message;
      dialog.inputs = [
        {
          name: 'reason',
          type: 'text',
          placeholder: 'Reason for rejection',
        },
      ];
      dialog.buttons = [
        { text: 'Cancel', role: 'cancel', handler: () => resolve(null) },
        { text: 'Submit', role: 'confirm', handler: (data) => resolve(data.reason) },
      ];
      document.body.appendChild(dialog);
      dialog.present();
    });
  }
  getStatusColor(status: string): string {
    switch (status) {
      case 'CLAIMED':
        return 'rgb(182, 235, 180)'; // Light green
      case 'PENDING_PICKUP':
        return 'rgb(254, 226, 226)';
      case 'PENDING_APPROVAL':
        return 'rgb(181, 231, 231)';
      case 'UNCLAIMED':
        return 'rgb(248, 113, 113)'; // Red
      case 'REJECTED':
        return '#ec9d9d'; // Darker red
      case 'EXPIRED':
        return 'rgb(243, 177, 124)'
      default:
        return '#ffffff';
    }
  }
  getTextColor(status: string): string {
    if (status === 'UNCLAIMED' || status === 'REJECTED') {
      return '#fff';
    }
    return '#333';
  }
  clear(event: any) {
    this.searchValue = '';
    this.search(this.orgId)
    if (event.target.value == '') {
      this.clearSearchData();
    }
  }

  clearSearch() {
    this.searchValue = '';
    this.clearSearchData();
  }
  clearSearchData() {
    this.searchValue = '';
    this.clearSearchData();

  }
  selectFilter(filter: string) {
    this.currentFilter = filter;
    this.isFilterPopoverOpen = false;
    switch (filter) {
      case 'name':
        this.currentFilterPlaceholder = 'Search by name';
        break;
      case 'email':
        this.currentFilterPlaceholder = 'Search by email';
        break;
      case 'date':
        this.currentFilterPlaceholder = 'Search by YYYY/MM/DD';
        break;

      case 'status':
        this.currentFilterPlaceholder = 'Search by status';
        break;
    }
  }

  approveReject(e: Event) {
    this.popover.event = e;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalController.dismiss();
  }

  openDatepicker() {
    this.isModalOpen = true;
  }

  onModalClosed() {
    this.isModalOpen = false;
  }
  filterSearch(event: any) {
    const searchValue = event.target?.value.trim().toLowerCase();
    const reqbody: any = {
      mail: '',
      status: '',
      name: '',
      date: ''
    };

    switch (this.currentFilter) {
      case 'name':
        reqbody.name = searchValue;
        break;
      case 'email':
        reqbody.mail = searchValue;
        break;
      case 'date':
        const dateObj = new Date(searchValue);
        if (!isNaN(dateObj.getTime())) { 
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
          const day = String(dateObj.getDate()).padStart(2, '0');
          reqbody.date = `${year}-${month}-${day}`; // Use hyphens to avoid encoding
        } else {
          console.error("Invalid date format:", searchValue);
        }
        break;
      case 'status':
        reqbody.status = searchValue;
        break;
      default:
        return;
    }
    this.isLoading = true;
    this.claimService.adminSearch(reqbody).subscribe((res: any) => {
      this.isLoading = false;
      this.searchResults = res.data;
      if (res.data.length == 0) {
        this.noRecord = true;
      }
      else {
        this.noRecord = false;
      }
      console.log("API Search Results:", this.searchResults);
    });
  }



  // Main search function
  search(orgId:any) {
    const reqbody = {
      mail: this.approveRejectForm.value.email || '',
      status: this.approveRejectForm.value.status,
      name: this.approveRejectForm.value.name,
      date: this.approveRejectForm.value.date
        ? new Date(this.approveRejectForm.value.date).toISOString().split('T')[0]
        : '',
        organizationId: orgId
    };
      this.isLoading = true;
  
    this.claimService.adminSearch(reqbody).pipe(
      catchError((error) => {
        this.isLoading = false;      
        this.errorImage = this.errorService.getErrorImage(error.status);      
        this.errorMessage = this.errorService.getErrorMessage(error.status);
        console.error('Error fetching search results:', error);
        this.noRecord = true; 
        return of({ data: [] }); 
      })
    ).subscribe((res: any) => {
      this.isLoading = false;
      this.searchResults = res.data;  
      this.noRecord = res.data.length === 0;
    });
  }
  

  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }
}