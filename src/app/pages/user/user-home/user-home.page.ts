import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { LoadingController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';
import { LoaderComponent } from '../../admin/loader/loader.component';
import { ErrorService } from '../../SharedServices/error.service';
@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, IonicModule, NgxDropzoneModule, ReactiveFormsModule, QRCodeModule, LoaderComponent]
})
export class UserHomePage implements OnInit {
  @ViewChild('qrCode') qrCode!: QRCodeComponent;
  items: any[] = [];
  searchQuery: any = '';
  isImageModalOpen = false;
  selectedImage: string = '';
  files: any[] = [];
  matchedItems: any[] = [];
  pictureSearchCompleted: boolean = false;
  selectedCategory: any;
  popoverOpen = false;
  hasMoreItems = true;
  currentPage = 1;
  popoverEvent: any;
  categories: { id: number; name: string }[] = [];
  categerorydata: any = [];
  categoryNames: any[] = [];
  searchResults: any = [];
  dropdownVisible: boolean = false;
  isLoading: boolean = false
  itemsFound: boolean = true;
  isModalOpen = false;
  claimForm!: FormGroup;
  selectedItemId: any;
  isQrModalOpen: boolean = false;
  isSubmitted: boolean = false;
  isPopoverOpen: boolean = false;
  qrData: any;
  qrItem: any = null;
  claimedItems = new Set();
  noRecord: boolean = false;
  errorImage: string | null = null;
  errorMessage: string = '';
  orgName:any
  orgId:any
  constructor(private cdr: ChangeDetectorRef,private fb: FormBuilder, private popoverController: PopoverController, private cdRef: ChangeDetectorRef, private errorService: ErrorService, private toastController: ToastController, private modalController: ModalController, private http: HttpClient, private loadingCtrl: LoadingController, private sanitizer: DomSanitizer, private claimService: ClaimitService) {
    this.claimForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
    });
    this.claimForm.valueChanges.subscribe(() => {
      this.isSubmitted = false;
    });
  }

  ngOnInit() {
    this.orgName = localStorage.getItem('organizationName');   
    this.fetchItems()
    this.triggerFileInput()
    this.fetchCategories()
    this.claimForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
    });
  }


  onButtonClick(itemId: number) {
    this.selectedItemId = itemId;
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
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
          await this.presentToast('Item Claimed Successfully', 'success');
          this.cdRef.detectChanges(); // Success dialog with only "OK" button
          this.fetchItems();
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
  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000, // Auto-dismiss after 3 seconds
      position: 'top',
      color: color, // 'success', 'danger', 'warning', etc.
    });
    await toast.present();
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

  async submitClaimForm() {
    const storedOrgId = localStorage.getItem('organizationId');
    const role = localStorage.getItem('role') || '';
    if (this.claimForm.valid) {
      this.isSubmitted = true;
      const formValues = this.claimForm.value;
      const REQBODY = {
        name: formValues.name,
        email: formValues.email,
        itemId: this.selectedItemId,
        orgId:storedOrgId,
        role:role
      };
      this.isLoading = true
      this.claimService.createClaimRequest(REQBODY,role).subscribe(
        (res: any) => {
          if (res && res.success) {
            this.isModalOpen = false;
            this.isLoading = false// Ensure success flag exists
            this.claimedItems.add(this.selectedItemId);
            this.showToast('Claim request successful');
            this.fetchItems();
          } else {
            this.isLoading = false
            this.isModalOpen = false;
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
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
    });
    await toast.present(); 
  }

  fetchItems(event?: any) {
    this.orgId = localStorage.getItem('organizationId');
    this.isLoading = true;
    this.claimService?.listOfItems(this?.currentPage, this.orgId).subscribe(
      (res: any) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        if (res && res.data && res.data.length > 0) {
          this.hasMoreItems = false;
          this.items = [...this.items, ...res.data];
          this.currentPage++; 
        } else {
          console.warn('No more items available.');
        }

        if (event) event.target.complete(); // Complete infinite scroll event
      },
      (error) => {
        this.errorImage = this.errorService.getErrorImage(error.status);
        this.errorMessage = this.errorService.getErrorMessage(error.status);
        this.isLoading = false;
        console.error('Error fetching items:', error);

        if (event) event.target.complete(); // Ensure event completes even on error
      }
    );
  }

  getImage(base64String: string): string {
    return `${base64String}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CLAIMED':
        return '#e0ffe0'; // Light green
      case 'PENDING_PICKUP':
        return 'rgb(254, 226, 226)';
      case 'PENDING_APPROVAL':
        return 'rgb(254, 226, 226)';
      case 'UNCLAIMED':
        return 'rgb(248, 113, 113)'; // Red
      case 'REJECTED':
        return '#red';
      case 'ARCHIVED':
        return '#ec9d9d';
      case 'EXPIRED':
        return '#ec9d9d';
      default:
        return '#ffffff';
    }
  }
  openPopover(event: any): void {
    this.popoverEvent = event;
    this.popoverOpen = true;
  }
  openQrModal(item: any): void {
    this.qrData = item;
    this.isQrModalOpen = true;
  }
  generateQRCode(item: any): void {
    this.qrItem = item;

    this.qrData = JSON.stringify({
      name: item.name,
      receivedDate: item.receivedDate,
      status: item.status,
    });
    this.isQrModalOpen = true;
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
  closeQrModal(): void {
    this.isQrModalOpen = false;
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


  // selectCategory(categoryName: string): void {
  //   this.selectedCategory = categoryName;
  //   const value = this.selectedCategory
  //   this.popoverOpen = false;
  //   this.search(value)
  //   this.hasMoreItems = false; 
  // }

  getTextColor(status: string): string {
    if (status === 'UNCLAIMED' || status === 'REJECTED') {
      return '#fff';
    }
    return '#333';
  }
  openImageModal(image: string) {
    this.selectedImage = `data:image/jpeg;base64,${image}`;
    this.isImageModalOpen = true;
  }
  closeImageModal() {
    this.isImageModalOpen = false;
  }
  triggerFileInput(): void {
    const fileInput = document.querySelector<HTMLInputElement>('#fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.files.push({
        file: file,
        preview: URL.createObjectURL(file),
      });
    }

    // Call the upload API
    this.uploadImage(file).subscribe(
      (response) => {
        this.isLoading = false
        if (response.success) {

          this.matchedItems = response.matchedItems
          this.items = this.matchedItems;
        } else {
          this.noRecord = true
          this.pictureSearchCompleted = true;
        }
      },
      (error) => {
        console.error("Error uploading image:", error);
      }
    );
  }
  clearAll() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.files = [];
    this.pictureSearchCompleted = false;
    this.noRecord = false
    this.fetchItems(); // Fetch the original list of items again
  }
  public uploadImage(file: File): Observable<any> {
    this.isLoading = true
    const formData: FormData = new FormData();
    formData.append('image', file, file.name);
    const picUrl = 'http://172.17.12.101:8081/api/users/search-by-image';

    return this.http.post(picUrl, formData, {
      headers: new HttpHeaders(),
    });
  }
  clearSearch() {
    this.searchQuery = '';
    this.matchedItems = [];
    this.files = [];
    this.items = [];
    this.itemsFound = true;
    this.currentPage = 1;
    this.hasMoreItems = true;
    this.pictureSearchCompleted = false;
    this.fetchItems();
  }
  fetchCategories(): void {
    this.isLoading = true;
    this.claimService.getcategories().subscribe(
      (response) => {
        this.isLoading = false;
        this.categories = response;
        this.categoryNames = this.categories.map(category => category.name);
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching categories:', error);
      }
    );
  }

  showSuccessMessage(message: string): void {
    this.toastController
      .create({
        message,
        duration: 2000,
        position: 'bottom',
      })
      .then((toast: { present: () => any; }) => toast.present());
  }
  search(search: any): void {
    const apiUrl = `http://172.17.12.101:8081/api/users/search?query=${encodeURIComponent(search)}`;

    this.http.get<any[]>(apiUrl).subscribe(
      (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.categerorydata = data;
          this.items = this.categerorydata;
          this.noRecord = false; // Hide "No records found" message
        } else {
          this.items = [];
          this.noRecord = true; // Show "No records found" message
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.items = [];
        this.noRecord = true; // Show "No records found" on error
      }
    );
  }

  searchItems() {
    this.isLoading = true
    if (this.searchQuery.trim() !== '') {
      this.claimService.searchItems(this.searchQuery).subscribe(
        (response) => {
          this.isLoading = false
          if (Array.isArray(response) && response.length > 0) {
            this.items = response;
            this.itemsFound = true;
          } else {
            this.isLoading = false
            this.noRecord = false
            this.itemsFound = false;
            this.items = [];
          }
        },
        (error) => {
          this.isLoading = false
          console.error(error);
          this.itemsFound = false;
          this.items = [];
        }
      );
    } else {
      this.isLoading = false
      this.itemsFound = true;
      this.items = [];
    }
  }

}
