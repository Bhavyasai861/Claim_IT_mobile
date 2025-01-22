import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { LoadingController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
  standalone:true,
  
  imports:[CommonModule, FormsModule, IonicModule,NgxDropzoneModule]
})
export class UserHomePage implements OnInit {
  searchQuery: string = '';
  searchResults: any = [];
  files: any[] = [];
  uplodedfilesdata: any[] = []
  matchedItems: any = [];
  categerorydata: any = [];
  searchCompleted!: boolean;
  categories: any[] = [];
  imagesearchResponse: any[] = []
  isCategeoryLoading :boolean =  false;
  isItemsLoading :boolean =  false;
  noItems :boolean =  false;
  selectedCategory: string = '';
  pictureSearchCompleted!: boolean;
  categeorySearchCompleted!: boolean;
  noImagedata:boolean =  false;
  imageUrl: string | null = null;
  categeoryerror: boolean = false
  noCategeroydata: boolean = false;
  constructor(private http: HttpClient,private loadingCtrl: LoadingController,private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.fetchCategories()
  }
  searchItems() {
    if (this.searchQuery.trim() !== '') {
      this.searchResults = []; // Clear previous results
      this.searchCompleted = false; // Reset search completion status  
      const apiUrl = `http://172.17.12.101:8081/api/users/search?query=${encodeURIComponent(this.searchQuery)}`;
      this.isItemsLoading = true
      this.http.get<any[]>(apiUrl).subscribe(
        (response) => {
          if (Array.isArray(response)) {
            // Filter results for items with status "UNCLAIMED"
            this.searchResults = response.filter(item => item.status === "UNCLAIMED");
            this.isItemsLoading = false
          } else {
            this.isItemsLoading = false
            this.noItems = true 
            console.error('API response is not an array', response);
          }
          this.searchCompleted = true; // Mark search as completed
        },
        (error) => {
          this.noItems = true 
          this.isItemsLoading = false
          console.error('Error fetching search results:', error);
          this.searchCompleted = true; // Mark search as completed even on error
        }
      );
    }
    
  }
  getImage(base64String: string | null): string {
    return base64String ? `data:image/jpeg;base64,${base64String}` : '';
  }
  clearDropdown(){
    this.categerorydata = []
    this.fetchCategories();
    this.isCategeoryLoading = false
    this.noCategeroydata = false
  }
  public onSelect(event: any): void {
  }
  async triggerCamera() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera, // Use CameraSource.Photos for gallery
      });

      if (image && image.base64String) {
        console.log('Captured image:', image.base64String);
        this.imageUrl = `data:image/jpeg;base64,${image.base64String}`;
        const file = this.base64ToFile(image.base64String, 'captured_image.jpg');
        this.uploadImage(file).subscribe(
          (response) =>  
          {
            if (response.success) {
              this.imagesearchResponse = response.matchedItems.filter((item: { status: string; }) => item.status === "UNCLAIMED");
            } else {
              this.noImagedata = true
            }
  
          },
          (error) => {
            console.error('Upload failed', error)
            this.noImagedata = true
          } ,
        );
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }
  clearImageResponse(){
    this.imagesearchResponse = []
    this.noImagedata = false
  }
  base64ToFile(base64: string, fileName: string): File {
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new File([uint8Array], fileName, { type: 'image/jpeg' });
  }

  uploadImage(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('image', file, file.name);
    const picUrl = 'http://172.17.12.101:8081/api/users/search-by-image';
    return this.http.post(picUrl, formData, {
      headers: new HttpHeaders(),
    });
  }
  async showLoader() {
    const loader = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent', // You can use 'bubbles', 'circles', 'crescent', 'dots', or 'lines'
      cssClass: 'custom-loader', // Optional, if you want to style it
    });
    await loader.present();

    // Dismiss the loader programmatically when the task is done
    setTimeout(() => {
      loader.dismiss();
    }, 3000); // Adjust the timeout as needed
  }

  toggleLoader(show: boolean) {
    this.isCategeoryLoading = show;
    if (show) {
      this.showLoader();
    }
  }



  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.matchedItems = [];
    this.categerorydata = [];
    this.files = [];
    this.searchCompleted = false;
    this.pictureSearchCompleted = false;
    this.noItems = false
  }
  search(): void {
    this.searchResults = [];
       this.isCategeoryLoading = true;

    const apiUrl = `http://172.17.12.101:8081/api/users/search?query=${this.selectedCategory}`;
    this.http.get<any[]>(apiUrl).subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.categerorydata = data.filter(item => item.status === "UNCLAIMED");
             this.isCategeoryLoading = false;

          if (this.categerorydata.length === 0) {
            this.categeoryerror = true;
          } else {
            this.categeoryerror = false;
          }
        } else {
             this.isCategeoryLoading = false;
          this.categeoryerror = true;
          this.noCategeroydata = true
        }
      },
      (error: any) => {
        console.error('API Error:', error);
           this.isCategeoryLoading = false;
      }
    );
  }
  fetchCategories(): void {
    this.http.get<{ id: number; name: string }[]>('http://172.17.12.101:8081/api/admin/getcategories')
      .subscribe(
        (response) => {
          this.categories = response;
        },
        (error) => {
          console.error('Error fetching categories:', error);
        }
      );
  }
  onCategorySelect(categoryName: string): void {
    this.selectedCategory = categoryName
    this.categerorydata = this.categories.filter(category => category.name === categoryName);
    this.search()
  }

}
