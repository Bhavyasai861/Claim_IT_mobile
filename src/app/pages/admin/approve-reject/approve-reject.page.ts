import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';

@Component({
  selector: 'app-approve-reject',
  templateUrl: './approve-reject.page.html',
  styleUrls: ['./approve-reject.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
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
  selectedImage: string = '';
  isLoading: boolean = false;
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
    private modalController: ModalController
  ) {}

  presentPopover(e: Event) {
    this.popover.event = e;
    this.isPopoverOpen = true;
  }

  ngOnInit() {
    this.approveRejectForm = this.fb.group({
      email: [''],
      date: [''],
      status: [''],
      name: [''],
    });
    this.search();
  }

  toggleFilterPopover(event: Event) {
    this.isFilterPopoverOpen = true;
  }

  toggleFilterPopoverApprove(event: Event) {
    this.PopoverOpen = true;
  }

  openImageModal(image: string) {
    this.selectedImage = `data:image/jpeg;base64,${image}`;
    this.isImageModalOpen = true;
  }

  closeImageModal() {
    this.isImageModalOpen = false;
  }

  
  clear(event: any) {
    if (event.target.value == '') {
      this.clearSearchData();
      this.filterSearch();  
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
        this.currentFilterPlaceholder = 'Search by date';
        break;

        case 'status':
          this.currentFilterPlaceholder = 'Search by status';
          break;
    }
    this.filterSearch();  
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

  // Filter search results based on the selected filter
  filterSearch() {
    if (this.searchValue.trim() === '') {
      // Reset to show all results if the search value is empty
      this.searchResults = [...this.normalResponse];
      return;
    }
  
    const searchValue = this.searchValue.toLowerCase();
  
    this.searchResults = this.normalResponse.filter((item: any) => {
      switch (this.currentFilter) {
        case 'name':
          return item.name?.toLowerCase().includes(searchValue);
        case 'email':
          return item.email?.toLowerCase().includes(searchValue);
        case 'date':
          const formattedDate = new Date(item.receivedDate).toLocaleDateString();
          return formattedDate.includes(searchValue);
        case 'status':
          return item.status?.toLowerCase().includes(searchValue);
        default:
          return false;
      }
    });
  }
  

  // Main search function
  search() {
    const reqbody = {
      filterBy: this.currentFilter,
      filterValue: this.searchValue.toLowerCase(),
      mail: this.approveRejectForm.value.email || '',
      status: this.approveRejectForm.value.status,
      name: this.approveRejectForm.value.name,
      date: this.approveRejectForm.value.date
        ? new Date(this.approveRejectForm.value.date).toISOString().split('T')[0]
        : '',
    };

    this.isLoading = true;
    this.claimService.adminSearch(reqbody).subscribe((res: any) => {
      this.isLoading = false;
      this.searchResults = res.data;
      this.normalResponse = res.data;
      this.filterSearch();  // Ensure filtering happens after the search
    });
  }

  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }
}