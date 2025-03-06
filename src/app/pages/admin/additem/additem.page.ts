import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
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
@Component({
  selector: 'app-additem',
  templateUrl: './additem.page.html',
  styleUrls: ['./additem.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule, QRCodeModule,LoaderComponent],
})
export class AdditemPage implements OnInit {
  @ViewChild('qrCode') qrCode!: QRCodeComponent;
  items: any[] = [];
  files: any[] = [];
  isModalOpen = false;
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
  orgId:any
  orgName:any
  userRole: string | null = '';
  organizations: any[] = [];
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
  constructor( private actionSheetCtrl: ActionSheetController,private cdRef: ChangeDetectorRef,  private http: HttpClient, private modalController: ModalController,private errorService: ErrorService, private router: Router, private menu: MenuController, private claimService: ClaimitService) { }

  ngOnInit() {
    this.getData();
    this.fetchCategories()
    this.loadSelectedOrganization()
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
  }
  
// Fetch updated organization details
fetchOrganizationData(orgId: string) {
  this.http.get(`http://52.45.222.211:8081/api/users/organisation?orgId=${orgId}`).subscribe(
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
    this.isModalOpen = false;
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
  
  getData() {
    const query = this.searchQuery.trim();
    this.isLoading = true;  // Show loading indicator at the start
    this.noRecord = false;
    this.errorImage = null;
    this.errorMessage = '';
  
    this.claimService.listOfItemsAddItem(query).subscribe(
      (res: any) => {
        this.isLoading = false;  // Hide loading after API call finishes
  
        if (res && Object.keys(res).length > 0) {
          this.addItemSearchResults = Object.keys(res).map((key) => ({
            date: key.split(":")[1],
            items: res[key],
          }));
          this.noRecord = false;
        } else {
          this.noRecord = true;
        }
        this.cdRef.detectChanges()
      },
      (error) => {
        this.isLoading = false; // Hide loading even if an error occurs
        this.errorImage = this.errorService.getErrorImage(error.status);
        this.errorMessage = this.errorService.getErrorMessage(error.status);
        console.error('Error fetching data:', error);
        this.cdRef.detectChanges();
      }
    );
  }
  
  

  getStatusColor(status: string): string {
    switch (status) {
      case 'CLAIMED':
        return '#e0ffe0';
      case 'PENDING_APPROVAL':
        return 'rgb(254, 226, 226)';
      case 'PENDING_PICKUP':
        return 'rgb(254, 226, 226)';
      case 'UNCLAIMED':
        return 'rgb(248, 113, 113)';
      case 'REJECTED':
        return '#ec9d9d';
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
    return `data:image/jpeg;base64,${base64String}`;
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
  addItem() {
    this.resetForm();
    this.isModalOpen = true;
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
    console.log( this.selectedCategory );
    
  }
  fetchCategories(): void {
    this.isLoading = true
    this.claimService.getcategories().subscribe(
        (response) => {
          this.isLoading = false
          this.categories = response;
          this.categoryNames = this.categories.map(category => category.name);
        },
        (error) => {
          this.isLoading = false
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
      this.formData.append('providedCategoryName', this.selectedCategory|| 'default')
      console.log(this.formData);
      
      this.http.post('http://52.45.222.211:8081/api/admin/image', this.formData).subscribe(
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
    this.http.post('http://52.45.222.211:8081/api/admin/upload', updatedFormData)
      .subscribe(
        response => {
          this.isEditingDescription = false;
          this.isModalOpen = false;
          this.isLoading = false;
          this.isCategoryInvalid = false; 
          this.isDescriptionInvalid = false; 
          this.getData();
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
    this.isModalOpen = false;
    this.files = [];
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