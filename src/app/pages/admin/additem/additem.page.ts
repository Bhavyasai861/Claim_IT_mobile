import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoaderComponent } from '../loader/loader.component';
import { ErrorService } from '../../SharedServices/error.service';
import { ActionSheetController } from '@ionic/angular';
import { catchError, of } from 'rxjs';
@Component({
  selector: 'app-additem',
  templateUrl: './additem.page.html',
  styleUrls: ['./additem.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule, QRCodeModule, LoaderComponent, ReactiveFormsModule],
})
export class AdditemPage implements OnInit {
  @ViewChild('qrCode') qrCode!: QRCodeComponent;
  items: any[] = [];
  files: any[] = [];
  isModalOpen = false;
  isItemModalOpen = false
  swiperRef: any;
  currentStep = 1;
  isQrModalOpen: boolean = false;
  qrData: any;
  qrItem: any = null;
  categories: { id: number; name: string }[] = [];
  categerorydata: any = [];
  categoryNames: any[] = [];
  formattedData: any;
  isTruncated: boolean = true;
  addItemData: any
  addItemSearchResults: any
  selectedOrgId: string = 'Miracle';
  searchQuery: string = '';
  isImageModalOpen = false;
  selectedCategory: any;
  selectedImage: string = '';
  isLoading: boolean = false;
  isEditingDescription = false;
  editableDescription = '';
  imageDataResponse: any;
  formData!: any;
  uploadMessage: string = '';
  categoryName: string = ''
  noRecord: boolean = false;
  isCategoryInvalid: boolean = false;
  isDescriptionInvalid: boolean = false;
  errorImage: string | null = null;
  errorMessage: string = '';
  isActionSheetOpen = false;
  selectedOrg: any = null;
  orgId: any
  orgName: any
  userRole: string | null = '';
  organizations: any[] = [];
  currentFilter: string = 'name';
  searchResults: any = [];
  searchValue: string = '';
  claimForm!: FormGroup;
  approveRejectForm!: FormGroup;
  PopoverOpen = false;
  popoverOpen = false;
  popoverEvent: any;
  isPopoverOpen: boolean = false;
  selectedItemIndex: number | null = null;
  selectedItemId: any;
  isFilterPopoverOpen = false;
  currentFilterPlaceholder: string = 'Search by name';
  isSubmitted: boolean = false;
  actionSheetButtons = [
    {
      text: 'Upload File',
      icon: 'folder',
      handler: () => {
        document.getElementById('fileInput')?.click();
      }
    },
    {
      text: 'Open Camera',
      icon: 'camera',
      handler: () => {
        this.openCamera();
      }
    },
    {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel'
    }
  ];
  constructor(private toastController: ToastController, private fb: FormBuilder, private actionSheetCtrl: ActionSheetController, private cdRef: ChangeDetectorRef, private http: HttpClient, private modalController: ModalController, private errorService: ErrorService, private router: Router, private menu: MenuController, private claimService: ClaimitService) { }

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
    this.claimForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
    });
    this.approveRejectForm = this.fb.group({
      email: [''],
      date: [''],
      status: [''],
      name: [''],
    });
    this.loadSelectedOrganization()
    this.search(this.orgId);
    this.fetchCategories()
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
    this.search(this.orgId)
  }

  // Fetch updated organization details
  fetchOrganizationData(orgId: string) {
    this.http.get(`http://172.17.12.101:8081/api/users/organisation?orgId=${orgId}`).subscribe(
      (data: any) => {
        localStorage.setItem('organizationData', JSON.stringify(data));
        console.log('Updated Organization Data:', data);
      },
      (error) => {
        console.error('Error fetching organization data:', error);
      }
    );
  }
  closeModal() {
    this.isModalOpen = false
    this.isItemModalOpen = false;
    this.isPopoverOpen = false;
  }
  viewProfile(): void {
    this.router.navigateByUrl('/profile');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
  validateDescription() {
    this.isDescriptionInvalid = this.editableDescription.length > 200;
  }


  // Main search function
  search(orgId: any) {
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
  toggleFilterPopover(event: Event) {
    this.isFilterPopoverOpen = true;
    this.popoverEvent = event;
  }

  toggleFilterPopoverApprove(event: Event) {
    this.PopoverOpen = true;
    this.popoverEvent = event
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
  filterSearch(event: any) {
    const searchValue = event.target?.value.trim().toLowerCase();
    const reqbody: any = {
      mail: '',
      status: '',
      name: '',
      date: '',
      organizationId: this.orgId
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
  getImage(base64String: string): string {
    return `${base64String}`;
  }
  goToStep(stepNumber: number) {
    this.currentStep = stepNumber;
  }
  dataURLtoBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  }

  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        const blob = this.dataURLtoBlob(image.dataUrl);
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });

        this.files.push({
          file: file, // Store file for upload
          preview: image.dataUrl // Store preview
        });

        console.log("Captured image file:", file);
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.files.push({
        file: file,
        preview: URL.createObjectURL(file)
      })

    }
  }
  removeFile(file: any) {
    this.files = this.files.filter(f => f !== file);
  }
  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons: [
        {
          text: 'Upload File',
          icon: 'folder',
          handler: () => {
            document.getElementById('fileInput')?.click();
          }
        },
        {
          text: 'Open Camera',
          icon: 'camera',
          handler: () => {
            this.openCamera();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  nextSlide() {
    const swiper = this.swiperRef.swiper;
    if (swiper) {
      swiper.slideNext();
    }
  }
  openImageModal(image: string) {
    this.selectedImage = `data:image/jpeg;base64,${image}`;
    this.isImageModalOpen = true;
  }
  closeImageModal() {
    this.isImageModalOpen = false;
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
  getStatus(receivedDate: string, currentStatus: string): string {
    const received = new Date(receivedDate);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - received.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays > 30 ? 'EXPIRED' : currentStatus;
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
  onButtonClick(itemId: number) {
    this.selectedItemId = itemId;
    this.isModalOpen = true;
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

  addItem() {
    this.resetForm();
    this.isItemModalOpen = true;
    this.addItemData = [];
    if (Array.isArray(this.addItemData)) {
      this.addItemData.forEach(item => {
        this.selectedOrgId = item.orgId;
      });
    }
  }


  goToNextStep() {
    if (this.currentStep < 2) {
      this.currentStep++;
    }
  }

  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onCategoryChange(event: any): void {
    this.selectedCategory = event.detail.value;
    console.log(this.selectedCategory);

  }
  fetchCategories(): void {
    this.orgId = localStorage.getItem('organizationId') || ''; // Ensure orgId is not null
    this.isLoading = true;

    if (!this.orgId) {
      console.error('Organization ID not found in localStorage.');
      this.isLoading = false;
      return;
    }

    this.http.get<any[]>(`http://172.17.12.101:8081/lookup/categories?orgId=${this.orgId}`)
      .subscribe(
        (response: any[]) => {
          this.isLoading = false;
          if (Array.isArray(response)) {
            this.categories = response;
            this.categoryNames = this.categories.map(category => category.name);
          } else {
            console.error('Unexpected response format:', response);
            this.categories = [];
            this.categoryNames = [];
          }
        },
        (error) => {
          this.isLoading = false;
          console.error('Error fetching categories:', error);
        }
      );
  }

  submitImageReponse() {
    if (this.files.length > 0) {
      this.isLoading = true; // Start loading
      this.uploadMessage = 'Uploading... Please wait';
      this.formData = new FormData();
      this.formData.append('image', this.files[0].file);
      this.formData.append('orgId', this.selectedOrgId);
      this.formData.append('providedCategoryName', this.selectedCategory || 'default')
      console.log(this.formData);

      this.http.post('http://172.17.12.101:8081/api/admin/image', this.formData).subscribe(
        (response) => {
          this.imageDataResponse = response;
          this.formatResponse(response);
          this.uploadMessage = 'Upload successful!';
          setTimeout(() => {
            this.isLoading = false;
            this.uploadMessage = '';
          }, 2000);
        },
        (error) => {
          this.uploadMessage = 'Upload failed. Please try again.';
          this.isLoading = false;
        }
      );
    } else {
      this.uploadMessage = 'Please select a file to upload.';
    }
  }


  editDescription(item: any) {
    console.log(item);
    this.editableDescription = item.value;
    this.isEditingDescription = true;
  }
  validateCategory() {
    this.isCategoryInvalid = !this.selectedCategory;
  }
  submitItem() {
    this.validateCategory();
    if (!this.selectedCategory) {
      this.isCategoryInvalid = true;
      return;
    }
    if (this.editableDescription.length > 200) {
      this.isDescriptionInvalid = true;
      return;
    }
    const updatedData = this.imageDataResponse;

    if (this.isEditingDescription) {
      updatedData.description = this.editableDescription;
    }
    const updatedFormData = new FormData();
    updatedFormData.append('image', this.files[0].file);
    updatedFormData.append('orgId', this.selectedOrgId);
    updatedFormData.append('categoryName', this.selectedCategory);
    updatedFormData.append('editedLabels', updatedData.description);
    this.isLoading = true;
    this.http.post('http://172.17.12.101:8081/api/admin/upload', updatedFormData)
      .subscribe(
        response => {
          this.isEditingDescription = false;
          this.isItemModalOpen = false;
          this.isLoading = false;
          this.isCategoryInvalid = false;
          this.isDescriptionInvalid = false;
          this.search(this.orgId);
        },
        error => {
          this.isLoading = false;
          console.error('Upload failed:', error);
        }
      );
  }


  loadData() {
    // Simulate new data loading
    setTimeout(() => {
      this.formattedData = [
        { key: 'title', value: 'New Data Loaded' },
        { key: 'description', value: 'This is the updated description after upload.' }
      ];
    }, 1000);
  }
  resetForm() {
    this.currentStep = 1;
    this.files = [];
    this.formattedData = [];
    this.isEditingDescription = false;
    this.editableDescription = '';
  }
  formatResponse(response: any): void {
    this.categoryName = response.categoryName; // Set the initial category
    const allowedKeys = ['description', 'title'];
    this.formattedData = Object.entries(response)
      .filter(([key]) => allowedKeys.includes(key))
      .map(([key, value]) => ({ key, value }));
  }
  toggleTruncate(): void {
    this.isTruncated = !this.isTruncated;
  }
  onModalDismiss() {
    this.isItemModalOpen = false;
    this.files = [];
  }
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });
    await toast.present();
  }
  async submitClaimForm() {
    const storedOrgId = localStorage.getItem('organizationId');
    const role = localStorage.getItem('role');
    if (this.claimForm.valid) {
      this.isSubmitted = true;
      const formValues = this.claimForm.value;
      const REQBODY = {
        name: formValues.name,
        email: formValues.email,
        itemId: this.selectedItemId,
        orgId: storedOrgId
      };
      const isAdmin = role === 'admin';
      this.isLoading = true
      this.claimService.createClaimRequest(REQBODY, isAdmin).subscribe(
        (res: any) => {
          if (res && res.success) {
            this.isModalOpen = false;
            this.isLoading = false// Ensure success flag exists
            this.isPopoverOpen = false;
            this.showToast('Claim request successful');
            this.search(this.orgId);
          } else {
            this.isLoading = false
            this.isModalOpen = false;
            this.isPopoverOpen = false;
            console.warn('Claim request failed:', res);
            this.showToast('Claim request failed. Please try again.');
          }
        },
        (error) => {
          this.isLoading = false
          console.error('Error creating claim request:', error);
          this.showToast('Error processing claim request. Please check your connection and try again.');
        }
      );
    }
  }
  generateQrCodeData(element: any): string {
    return JSON.stringify({
      id: element.uniqueId,
      name: element.name,
      status: element.status,
      verificationLink: element.status === 'UNCLAIMED'
        ? `http://localhost:4200/assets/verification.html?itemId=${element.itemId}`
        : 'Item is Claimed'
    });
  }


  openQrModal(item: any): void {
    this.qrData = item;
    this.isQrModalOpen = true;
  }

  onSaveQrCode(): void {
    const combinedCanvas = document.createElement('canvas');
    const context = combinedCanvas.getContext('2d');
    if (!context) {
      console.error('Could not get 2D context for canvas.');
      return;
    }
    const qrCodeSize = 200;
    const padding = 20;
    const idHeight = 30;
    combinedCanvas.width = qrCodeSize + 2 * padding;
    combinedCanvas.height = idHeight + 2 * padding;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
    context.fillStyle = '#000000';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText(`ID: ${this.qrData.uniqueId}`, combinedCanvas.width / 2, combinedCanvas.height / 2);
    const combinedImage = combinedCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = combinedImage;
    link.download = `id-${this.qrData.uniqueId}.png`;
    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod/i)) {
      const imageWindow = window.open();
      if (imageWindow) {
        imageWindow.document.write('<img src="' + combinedImage + '" style="width:100%"/>');
        imageWindow.document.close();
        setTimeout(() => {
          imageWindow.location.href = combinedImage;
        }, 500);
      }
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }


  async onShareQrCode(): Promise<void> {
    const combinedCanvas = document.createElement('canvas');
    const context = combinedCanvas.getContext('2d');
    if (!context) {
      console.error('Could not get 2D context for canvas.');
      return;
    }

    const qrCodeSize = 200;
    const padding = 20;
    const idHeight = 30;

    // Set canvas size to fit only the ID text
    combinedCanvas.width = qrCodeSize + 2 * padding;
    combinedCanvas.height = idHeight + 2 * padding;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
    context.fillStyle = '#000000';
    context.font = '16px Arial';
    context.textAlign = 'center';

    // Draw only the ID text
    context.fillText(`ID: ${this.qrData.uniqueId}`, combinedCanvas.width / 2, combinedCanvas.height / 2);

    const combinedImage = combinedCanvas.toDataURL('image/png');
    const platform = Capacitor.getPlatform();
    if (platform === 'ios' || platform === 'android') {
      await Share.share({
        title: 'Share QR Code',
        text: `Check out this QR code with ID: ${this.qrData.uniqueId}`,
        url: combinedImage,
        dialogTitle: 'Share QR Code'
      });
    } else {
      console.log('Share functionality is not available on this platform.');
    }
  }

  onPrintQrCode(): void {
    const combinedCanvas = document.createElement('canvas');
    const context = combinedCanvas.getContext('2d');
    if (!context) {
      return;
    }
    const qrCodeSize = 200;
    const padding = 20;
    const idHeight = 30;
    combinedCanvas.width = qrCodeSize + 2 * padding;
    combinedCanvas.height = idHeight + 2 * padding;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
    context.fillStyle = '#000000';
    context.font = '16px Arial';
    context.textAlign = 'center'
    context.fillText(`ID: ${this.qrData.uniqueId}`, combinedCanvas.width / 2, combinedCanvas.height / 2);

    const combinedImage = combinedCanvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
            <html>
            <head>
                <title>Print QR Code</title>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    img {
                        max-width: 100%;
                        max-height: 100%;
                    }
                </style>
            </head>
            <body>
                <img src="${combinedImage}" alt="QR Code with ID">
            </body>
            </html>
        `);
    printWindow?.document.close();
    printWindow?.print();
    printWindow?.close();
  }


  closeQrModal(): void {
    this.isQrModalOpen = false;
  }
}