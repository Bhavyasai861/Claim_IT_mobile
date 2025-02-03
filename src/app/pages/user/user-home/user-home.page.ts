import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { LoadingController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';
@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, IonicModule, NgxDropzoneModule, ReactiveFormsModule, QRCodeModule]
})
export class UserHomePage implements OnInit {
  @ViewChild('qrCode') qrCode!: QRCodeComponent;
  items: any[] = [];
  searchQuery: string = '';
  isImageModalOpen = false;
  selectedImage: string = '';
  files: any[] = [];
  matchedItems: any[] = [];
  pictureSearchCompleted: boolean = false;
  selectedCategory: any;
  popoverOpen = false;
  hasMoreItems = true;
  currentPage = 0;
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
  qrData: any;
  qrItem: any = null;
  claimedItems = new Set();
  constructor(private fb: FormBuilder, private popoverController: PopoverController, private toastController: ToastController, private modalController: ModalController, private http: HttpClient, private loadingCtrl: LoadingController, private sanitizer: DomSanitizer, private claimService: ClaimitService) { }

  ngOnInit() {
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

 async submitClaimForm() {
    if (this.claimForm.valid) {
      const formValues = this.claimForm.value;
      const REQBODY = {
        name: formValues.name,
        email: formValues.email,
        itemId: this.selectedItemId,
      };

      this.claimService.createClaimRequest(REQBODY).subscribe((res: any) => {
        if (res && res.success) { // Ensure success flag exists
          this.claimedItems.add(this.selectedItemId);
          this.showToast('Claim request successful');
          this.fetchItems();
          this.closeModal();
        } else {
          this.showToast('Claim request failed. Please try again.');
        }
      });
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
    if (!this.hasMoreItems) {
      if (event) event.target.complete();
      return;
    }
  
    this.isLoading = true;
  
    this.claimService.listOfItems(this.currentPage).subscribe(
      (res: any) => {
        this.isLoading = false;
  
        if (res.data.length > 0) {
          this.items = [...this.items, ...res.data];
          this.currentPage++; // Increase page count for next load
        } else {
          this.hasMoreItems = false; // Stop further requests when no data left
        }
  
        if (event) event.target.complete(); // Complete infinite scroll event
      },
    
    );
  }
  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
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
        return '#ec9d9d'; // Darker red
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


  selectCategory(categoryName: string): void {
    this.selectedCategory = categoryName;
    const value = this.selectedCategory
    this.popoverOpen = false;
    this.search(value)
  }

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
        if (response.success) {
          this.matchedItems = response.matchedItems
          this.items = this.matchedItems;
        } else {
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
    this.fetchItems(); // Fetch the original list of items again
  }
  public uploadImage(file: File): Observable<any> {
    this.isLoading = true
    const formData: FormData = new FormData();
    formData.append('image', file, file.name);
    const picUrl = 'https://100.28.242.219.nip.io/api/users/search-by-image';
    this.isLoading = false

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
    this.currentPage = 0;  
    this.hasMoreItems = true; 
    this.pictureSearchCompleted = false;
    this.fetchItems();
  }
  fetchCategories(): void {
    this.http.get<{ id: number; name: string }[]>('https://100.28.242.219.nip.io/api/admin/getcategories')
      .subscribe(
        (response) => {
          this.categories = response;
          this.categoryNames = this.categories.map(category => category.name);
          console.log(this.categoryNames);
        },
        (error) => {
          console.error('Error fetching categories:', error);
        }
      );
  }

  showSuccessMessage(message: string): void {
    // You can use a toast, alert, or other notification method
    this.toastController
      .create({
        message,
        duration: 2000,
        position: 'bottom',
      })
      .then((toast: { present: () => any; }) => toast.present());
  }
  search(search: any): void {
    const apiUrl = `https://100.28.242.219.nip.io/api/users/search?query=${search}`;
    this.http.get<any[]>(apiUrl).subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.categerorydata = data;
          this.items = this.categerorydata;
        }
      },
    );
  }
  searchItems() {
    if (this.searchQuery.trim() !== '') {
      this.claimService.searchItems(this.searchQuery).subscribe(
        (response) => {
          if (Array.isArray(response) && response.length > 0) {
            this.items = response;
            this.itemsFound = true;
          } else {
            this.itemsFound = false;
            this.items = []; 
          }
        },
        (error) => {
          console.error(error);
          this.itemsFound = false;
          this.items = [];
        }
      );
    } else {
      this.itemsFound = true;
      this.items = [];
    }
  }

}
