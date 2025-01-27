import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { LoadingController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { ClaimModalComponent } from '../claim-modal/claim-modal.component';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
  standalone:true,
  
  imports:[CommonModule, FormsModule, IonicModule,NgxDropzoneModule,ClaimModalComponent]
})
export class UserHomePage implements OnInit {
  items: any[] = [];
  searchQuery: string = '';
  isImageModalOpen = false;
  selectedImage: string = '';
  files: any[] = [];
  matchedItems: any[] = [];
  pictureSearchCompleted: boolean = false;

  selectedCategory: any;
  popoverOpen = false;
  popoverEvent: any;
  categories: { id: number; name: string }[] = [];
  categerorydata: any = [];
  categoryNames: any[] = [];
  searchResults: any = [];
  dropdownVisible: boolean = false; 
  isLoading:boolean=false
    constructor(private popoverController: PopoverController,private toastController: ToastController,private modalController: ModalController, private http: HttpClient,private loadingCtrl: LoadingController,private sanitizer: DomSanitizer, private claimService:ClaimitService) { }

  ngOnInit() {
   this.fetchItems()
   this.triggerFileInput()
   this.fetchCategories()
  }
  fetchItems() {
    const query = this.searchQuery.trim();
    this.isLoading= true
    this.claimService.listOfItems(query).subscribe(
      (res: any) => {
        this.isLoading= false
      this.items = res.data;
    });
  }
  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'CLAIMED':
        return '#e0ffe0'; // Light green
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
  openPopover(event: any): void {
    this.popoverEvent = event; // Store the event for positioning the popover
    this.popoverOpen = true; // Open the popover
  }

  // Select the category and log it
  selectCategory(categoryName: string): void {
    this.selectedCategory = categoryName;  // Set the selected category name
    console.log('Selected Category:', this.selectedCategory);  // Log the selected category
    const value = this.selectedCategory
    this.popoverOpen = false;  // Close the popover after selecting a category
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
    this.clearSearch(); // Reset the list and fetch original items
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
  
          // Update the items list to display matchedItems
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
    this.isLoading= true
    const formData: FormData = new FormData();
    formData.append('image', file, file.name);
    const picUrl = 'http://100.28.242.219:8081/api/users/search-by-image';
    this.isLoading= false

    return this.http.post(picUrl, formData, {
      headers: new HttpHeaders(),
    });
  }
  clearSearch() {
    this.searchQuery = '';
    this.matchedItems = [];
    this.files = [];
    this.pictureSearchCompleted = false;
    // Fetch the original list of items
    this.fetchItems();
  }
  fetchCategories(): void {
    this.http.get<{ id: number; name: string }[]>('http://100.28.242.219:8081/api/admin/getcategories')
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
  async onButtonClick(item: any): Promise<void> {
    const modal = await this.modalController.create({
      component: ClaimModalComponent,
      componentProps: { item },
      // cssClass: 'dialog-modal',  // Custom class for dialog-style modal
    });
  
    modal.onDidDismiss().then(({ data }) => {
      if (data) {
        const REQBODY = {
          userName: data.name,
          userEmail: data.email,
          itemId: item.itemId,
        };
        this.isLoading = true;
        this.claimService.createClaimRequest(REQBODY).subscribe((res: any) => {
          if (res) {
            this.isLoading = false;
            this.showSuccessMessage("Claimed successfully!");
          }
        });
      }
    });
  
    await modal.present();
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
  search(search:any): void {
    const apiUrl = `http://100.28.242.219:8081/api/users/search?query=${search}`;
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
      const apiUrl = `http://100.28.242.219:8081/api/users/search?query=${encodeURIComponent(this.searchQuery)}`;
      this.http.get<any[]>(apiUrl).subscribe(
        (response) => {
          if (Array.isArray(response)) {
            console.log(response);         
            this.items = response    
          } 
        }
      );
    }

  }
}
