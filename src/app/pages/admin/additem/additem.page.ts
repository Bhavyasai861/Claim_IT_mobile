import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
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
  items: any[] = [];
  files: any[] = [];
  isModalOpen = false;
  swiperRef: any;
  currentStep = 1; 
  isQrModalOpen: boolean = false;
  qrData: string = '';
  qrItem: any = null;
  formattedData:any;
  isTruncated: boolean = true;
  addItemData:any
  selectedOrgId: string = '';
   searchQuery: string = '';
  constructor(private http: HttpClient, private modalController: ModalController, private router:Router, private menu:MenuController,private claimService: ClaimitService) {}

  ngOnInit() {
    this.fetchItems();
  }
 
  viewProfile(): void {
    this.router.navigateByUrl('/profile'); 
  }

  logout(): void {
    localStorage.clear(); 
    this.router.navigateByUrl('/login'); 
  }
  fetchItems() {
    const query = this.searchQuery.trim();
    this.claimService.listOfItems(query).subscribe(
      (res: any) => {
      this.items = res.data;
    });
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

  addItem() {
    this.isModalOpen = true;
    const url = 'http://172.17.12.101:8081/api/admin/listOfOrganisation';
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
  submitItem() {
    if (this.files.length > 0) {
      const formData = new FormData();
      console.log("this.files", this.files);
      
      formData.append('image', this.files[0].file);
      formData.append('orgId', this.selectedOrgId);
      this.http.post('http://172.17.12.101:8081/api/admin/upload', formData).subscribe(
        (response) => {
          this.formatResponse(response);          
          this.fetchItems();  
        },
        (error) => {
          console.error('Error uploading item:', error);
        }
      );
    }
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
  generateQRCode(item: any): void {
    this.qrItem = item;    
    this.qrData = JSON.stringify({
      name: item.name,
      receivedDate: item.receivedDate,
      status: item.status,
    });
    this.isQrModalOpen = true;
  }

  closeQrModal(): void {
    this.isQrModalOpen = false;
  }
}