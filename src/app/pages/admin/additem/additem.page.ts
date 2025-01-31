import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
@Component({
  selector: 'app-additem',
  templateUrl: './additem.page.html',
  styleUrls: ['./additem.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule,QRCodeModule],
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
  formattedData:any;
  isTruncated: boolean = true;
  addItemData:any
  addItemSearchResults: any
  selectedOrgId: string = '';
   searchQuery: string = '';
   isImageModalOpen = false;
   selectedImage: string = '';
   isLoading: boolean = false;
   isEditingDescription = false;
   editableDescription = '';
  imageDataResponse: any;
  formData!: any;
  uploadMessage: string = '';
  constructor(private http: HttpClient, private modalController: ModalController, private router:Router, private menu:MenuController,private claimService: ClaimitService) {}

  ngOnInit() {
    this.getData();
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
  // fetchItems() {
  //   const query = this.searchQuery.trim();
  //   this.isLoading = true;
  //   this.claimService.listOfItems(query).subscribe(
  //     (res: any) => {
  //       this.isLoading = false;
  //     this.items = res.data;
  //   });
  // }

  getData() {
    const query = this.searchQuery.trim();
    this.isLoading = true;
    this.claimService.listOfItemsAddItem(query).subscribe(
      (res: any) => {
        this.isLoading = false;
        this.addItemSearchResults = Object.keys(res).map((key) => ({
          date: key.split(":")[1], 
          items: res[key]
        }));
        console.log(this.addItemSearchResults);
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );

  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CLAIMED':
        return '#e0ffe0'; // Light green
        case 'PENDING_APPROVAL':
          return 'rgb(254, 226, 226)';
      case 'PENDING_PICKUP':
        return 'rgb(254, 226, 226)'; // Light red/pink
      case 'UNCLAIMED':
        return 'rgb(248, 113, 113)'; // Red
      case 'REJECTED':
        return '#ec9d9d'; // Darker red
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
  onFileSelect(event: any) {
    const file = event.target.files[0]; 
    if (file) {
      this.files.push({file:file,
      preview:URL.createObjectURL(file)})
      
    }
  }
  removeFile(file: any) {
    this.files = this.files.filter(f => f !== file); 
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
    const url = 'https://100.28.242.219.nip.io/api/admin/listOfOrganisation';
    this.http.get<any>(url).subscribe((response) => {
      this.addItemData = response;
      console.log(this.addItemData); 
      if (Array.isArray(this.addItemData)) {
        this.addItemData.forEach(item => {
          console.log(item.orgId); 
          this.selectedOrgId= item.orgId
        });
      } else {
        console.log(this.addItemData.orgId); 
      }
    });
  }
  
  goToNextStep() {
    if (this.currentStep < 2) {
      this.currentStep++;
      // this.submitItem()
    }
  }

  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  submitItem1() {
    if (this.files.length > 0) {
      this.isLoading = true; // Start loading
      this.uploadMessage = 'Uploading... Please wait';
  
      this.formData = new FormData();
      this.formData.append('image', this.files[0].file);
      this.formData.append('orgId', this.selectedOrgId);
  
      this.http.post('https://100.28.242.219.nip.io/api/admin/image', this.formData).subscribe(
        (response) => {
          console.log("Upload Successful:", response);
          this.imageDataResponse = response;
          this.formatResponse(response);
  
          this.uploadMessage = 'Upload successful!';
          setTimeout(() => {
            this.isLoading = false; // Stop loading after success
            this.uploadMessage = '';
          }, 2000);
        },
        (error) => {
          console.error('Error uploading item:', error);
          this.uploadMessage = 'Upload failed. Please try again.';
          this.isLoading = false;
        }
      );
    } else {
      console.warn('No files selected for upload.');
      this.uploadMessage = 'Please select a file to upload.';
    }
  }
  

  editDescription(item: any) {
    this.editableDescription = item.value;
    this.isEditingDescription = true;
  }
  resetForm() {
    this.currentStep = 1;
    this.files = [];
    this.formattedData = [];
    this.isEditingDescription = false;
    this.editableDescription = '';
  }

  
  submitItem() {
    this.isLoading = true;
    this.uploadMessage = 'Uploading... Please wait';
  
    // Simulating API call
    setTimeout(() => {
      this.uploadMessage = 'Processing your data...';
  
      setTimeout(() => {
        // Simulating success response
        this.isLoading = false;
        this.uploadMessage = '';
        this.loadData(); // Function to reload data after successful upload
      }, 2000);
    }, 2000);
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
  

  formatResponse(response: any): void {
    const allowedKeys = ['description', 'title'];
    this.formattedData = Object.entries(response)
      .filter(([key]) => allowedKeys.includes(key))
      .map(([key, value]) => ({ key, value }));
  }
  toggleTruncate(): void {
    this.isTruncated = !this.isTruncated;
  }
  onModalDismiss() {
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
  // this.qrDataString = this.generateQrCodeData(item);
  this.isQrModalOpen = true;
}
// onSaveQrCode(): void {
//     const canvas = this.qrCode.qrcElement.nativeElement.querySelector('canvas') as HTMLCanvasElement;
//     if (canvas) {
//         const combinedCanvas = document.createElement('canvas');
//         const context = combinedCanvas.getContext('2d');
//         if (!context) {
//             console.error('Could not get 2D context for canvas.');
//             return;
//         }

//         const qrCodeSize = 200;
//         const padding = 20;
//         const idHeight = 30;

//         combinedCanvas.width = qrCodeSize + 2 * padding;
//         combinedCanvas.height = qrCodeSize + 2 * padding + idHeight;

//         context.fillStyle = '#ffffff';
//         context.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
//         context.fillStyle = '#000000';
//         context.font = '16px Arial';
//         context.textAlign = 'center';
//         context.fillText(`ID: ${this.qrData.uniqueId}`, combinedCanvas.width / 2, idHeight - 10);
//         context.drawImage(canvas, padding, idHeight + padding, qrCodeSize, qrCodeSize);

//         const combinedImage = combinedCanvas.toDataURL('image/png');
//         const link = document.createElement('a');
//         link.href = combinedImage;
//         link.download = `qr-code-with-id-${this.qrData.uniqueId}.png`;
//         link.click();
//     } else {
//         console.error('QR code canvas not found.');
//     }
// }
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

  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = combinedImage;
  link.download = `id-${this.qrData.uniqueId}.png`;

  // Try to trigger the download on desktop and mobile
  if (navigator.userAgent.match(/Android|iPhone|iPad|iPod/i)) {
      // For mobile devices, let's first try opening in a new tab and let the user download manually
      const imageWindow = window.open();
      if (imageWindow) {
          imageWindow.document.write('<img src="' + combinedImage + '" style="width:100%"/>');
          imageWindow.document.close();
          setTimeout(() => {
              imageWindow.location.href = combinedImage; // Force it to open and allow saving
          }, 500);
      }
  } else {
      // For desktop, trigger the download directly as before
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }
}


onPrintQrCode(): void {
    const canvas = this.qrCode.qrcElement.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
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
        combinedCanvas.height = qrCodeSize + 2 * padding + idHeight;

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
        context.fillStyle = '#000000';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText(`ID: ${this.qrData.uniqueId}`, combinedCanvas.width / 2, idHeight - 10);
        context.drawImage(canvas, padding, idHeight + padding, qrCodeSize, qrCodeSize);

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
    } else {
        console.error('QR code canvas not found.');
    }
}

  closeQrModal(): void {
    this.isQrModalOpen = false;
  }
}