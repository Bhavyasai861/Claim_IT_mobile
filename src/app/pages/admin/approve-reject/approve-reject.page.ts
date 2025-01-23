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
  isPopoverOpen: boolean = false
  currentDate: any = new Date();
  searchResults: any = [];
  selectedDate: Date | null = null; 
  isModalOpen = false;
  modalOpen=false
  adminActions = true;
  alertButtons = ['Action'];
  @ViewChild('popover') popover!: HTMLIonPopoverElement;
  public statusDropDown: any = [
    { label: 'REJECTED', value: 'REJECTED' },
    { label: 'PENDING_APPROVAL', value: 'PENDING APPROVAL' },
    { label: 'PENDING_PICKUP', value: 'PENDING PICKUP' },
    { label: 'CLAIMED', value: 'CLAIMED' },
    { label: 'UNCLAIMED', value: 'UNCLAIMED' },
  ]
  constructor(private fb: FormBuilder, private claimService: ClaimitService, private modalController:ModalController) {}


  presentPopover(e: Event) {
    this.popover.event = e;
    this.isPopoverOpen = true;
  }
  ngOnInit() {
    this.approveRejectForm = this.fb.group({
      email: [''],
      from: [''],
      to: [''],
      status: [''],
      name: [''],
      selectedDate: [null]
    });
    this.search();
  }
  SearchAndClear(type: any) {
    if (type === 'clear') {
      this.searchResults = [];
      this.approveRejectForm.reset()
      this.search()

    } else {
      this.search()
    }

  }
  approveReject(e: Event){
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
  search() {
    const reqbody = {
      mail: this.approveRejectForm.value.email ? this.approveRejectForm.value.email : '',
      status: this.approveRejectForm.value.status,
      to: this.approveRejectForm.value.to
        ? new Date(this.approveRejectForm.value.to).toISOString().split('T')[0]
        : '',
      from: this.approveRejectForm.value.from
        ? new Date(this.approveRejectForm.value.from).toISOString().split('T')[0]
        : '',
    };

    this.claimService.adminSearch(reqbody).subscribe((res: any) => {
      this.searchResults = res.data;
      console.log(this.searchResults);
    });
  }
  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }

}