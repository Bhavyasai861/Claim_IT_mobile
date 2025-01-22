import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { Router } from '@angular/router';
@Component({
  selector: 'app-additem',
  templateUrl: './additem.page.html',
  styleUrls: ['./additem.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule,QRCodeModule],
})
export class AdditemPage implements OnInit {
  items: any[] = [];
  files: any[] = [];
  isModalOpen = false;
  swiperRef: any;
  currentStep = 1; 
  isQrModalOpen: boolean = false;
  qrData: string = '';
  qrItem: any = null;
  constructor(private http: HttpClient, private modalController: ModalController, private router:Router) {}

  ngOnInit() {
    this.fetchItems();
  }
  viewProfile(): void {
    this.router.navigateByUrl('/profile'); // Replace '/profile' with the correct profile route
  }

  // Logout and navigate to the Login page
  logout(): void {
    // Perform any necessary cleanup, such as clearing storage or resetting states
    localStorage.clear(); // Example: Clear local storage
    this.router.navigateByUrl('/login'); // Replace '/login' with the correct login route
  }
  fetchItems() {
    const url = 'http://172.17.12.101:8081/api/admin/listOfItems';
    this.http.get<any>(url).subscribe((response) => {
      this.items = response.data;
    });
  }

  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }

  // Method to handle file selection
  onFileSelect(event: any) {
    const file = event.target.files[0]; 
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.files.push({
          name: file.name,
          dataURL: e.target.result, 
        });
      };
      reader.readAsDataURL(file); 
    }
  }

  nextSlide() {
    const swiper = this.swiperRef.swiper;
    if (swiper) {
      swiper.slideNext();
    }
  }

  addItem() {
    this.isModalOpen = true;
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
  submitItem() {
    if (this.files.length > 0) {
      const formData = new FormData();
      formData.append('image', this.files[0].dataURL);  
      this.http.post('http://172.17.12.101:8081/api/admin/upload', formData).subscribe(
        (response) => {
          console.log('Item submitted:', response);
          this.isModalOpen = false;
          this.files = [];
          this.fetchItems();  
        },
        (error) => {
          console.error('Error uploading item:', error);
        }
      );
    }
  }

  onModalDismiss() {
    this.files = []; // Clear the files on modal dismiss
  }
  generateQRCode(item: any): void {
    // Store item details for later display in the modal
    this.qrItem = item;
    
    // Prepare the data for the QR code
    this.qrData = JSON.stringify({
      name: item.name,
      receivedDate: item.receivedDate,
      status: item.status,
    });

    // Open the modal
    this.isQrModalOpen = true;
  }

  closeQrModal(): void {
    this.isQrModalOpen = false;
  }
}