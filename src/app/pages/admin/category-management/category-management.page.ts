import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActionSheetController, AlertController, IonicModule, ToastController } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoaderComponent } from '../loader/loader.component';
import { ErrorService } from '../../SharedServices/error.service';
@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.page.html',
  styleUrls: ['./category-management.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule,LoaderComponent]
})
export class CategoryManagementPage implements OnInit {
  categoryForm: FormGroup;
  categories: any[] = []; 
  isModalOpen = false;
  files: any[] = [];
  formData!: any;
  isLoading: boolean = false;
  noRecord: boolean = false;
  errorImage: string | null = null;
  errorMessage: string = '';
  isImageModalOpen = false;
  selectedImage: string = '';
  isSubmitting = false; // Add this flag
  isActionSheetOpen = false;
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
  constructor(private actionSheetCtrl: ActionSheetController,private toastController: ToastController, private http: HttpClient, private errorService: ErrorService, private claimService: ClaimitService, private alertController: AlertController, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      subcategories: ['']
    });
  }

  ngOnInit() {
    this.fetchCategories(); 
  }
  openImageModal(image: string) {
    this.selectedImage = `${image}`;
    this.isImageModalOpen = true;
  }
  closeImageModal() {
    this.isImageModalOpen = false;
  }
  // Fetch the categories from the API
  fetchCategories(): void {
    this.isLoading = true;
    this.claimService.getcategories().subscribe(
        (response) => {
          this.isLoading = false;
          this.categories = response;
          if (response.length !== 0) {
            this.noRecord = false;
          }
          else {
            this.noRecord = true;
          }
        },
        (error) => {
          this.isLoading = false;
          this.errorImage = this.errorService.getErrorImage(error.status);
          this.errorMessage = this.errorService.getErrorMessage(error.status);
          console.error('Error fetching categories:', error.status);
        }
      );
  }
  getImage(base64String: string): string {
    return `${base64String}`;
  }

  async updateCategory(item: any) {
    const categoryName = item.name;
    const alert = await this.alertController.create({
      header: 'Edit Category',
      inputs: [
        {
          name: 'categoryName',
          type: 'text',
          placeholder: 'Enter category name',
          value: categoryName
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log("Update cancelled");
          }
        },
        {
          text: 'Update',
          handler: async (data) => {
            if (data.categoryName.trim()) {
              this.isLoading = true;  
              await alert.dismiss(); 
              this.submitCategoryUpdate(item.id, data.categoryName);
            } else {
              console.warn("Category name cannot be empty.");
            }
          }
        }
      ]
    });
  
    await alert.present();
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
  closeModal() {
    this.isModalOpen = false;
  }
  addCategory() {
    this.isModalOpen = true;
  }
  onModalDismiss() {
    this.files = [];
  }
  removeFile(file: any) {
    this.files = this.files.filter(f => f !== file);
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
  postCategory() {
    if (!this.categoryForm) {
      console.error("Form is not initialized.");
      return;
    }
    this.isSubmitting = true;
    const categoryName = this.categoryForm.get('categoryName')?.value || '';
    const subcategoryInput = this.categoryForm.get('subcategories')?.value || '';
    const subcategoriesArray = subcategoryInput
      .split(',')
      .map((sub: string) => sub.trim())
      .filter((sub: string) => sub !== '')
      .map((sub: string) => ({ name: sub }));
    const categoryData = {
      categoryName: categoryName,
      subCategories: subcategoriesArray
    };
    const formData = new FormData();
    if (this.files.length > 0) {
      formData.append('image', this.files[0].file);
    }
    formData.append('category', JSON.stringify(categoryData));
    this.claimService.uploadCategory(formData).subscribe(
      (response) => {
        this.isModalOpen = false;
        this.presentToast('Category Posted Successfully!');
        this.fetchCategories();
        this.isSubmitting = false;
      },
      (error) => {
        console.error("Error Posting Category:", error);
        this.isSubmitting = false;
      }
    );
  }
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,  
      position: 'top',
    });
    await toast.present();
  }

  async submitCategoryUpdate(id: any, categoryName: string) {
    const reqBody = {
      categoryName: categoryName,
      status: "A"
    };
 this.isLoading = true
    const url = `http://172.17.12.101:8081/lookup/update-categories?id=${id}`;

    try {
      const response = await this.claimService.updateCategory(url, reqBody);
      if (response) {
        this.isLoading = false
        this.showToast("Category updated successfully!");
        console.log("Category updated successfully:", response);
        this.fetchCategories();
      } else {
        this.isLoading = false
        this.showToast("Failed to update category. Try again!");
        console.warn("Category update failed:", response);
      }
    } catch (error) {
      this.isLoading = false
      console.error("Error updating category:", error);
    }
  }
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
  async deleteCategory(id: any) {
  
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this category?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Delete action canceled');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            const reqBody = {
              id: id
            };
            this.isLoading = true
            this.claimService.deleteCategory(reqBody).subscribe(
              (response: any) => {
                this.isLoading = false
                this.fetchCategories();
              },
              (error) => {
                this.isLoading = false
                console.error('Error deleting category:', error);
              }
            );
          }
        }
      ]
    });
    await alert.present();
  }

}
