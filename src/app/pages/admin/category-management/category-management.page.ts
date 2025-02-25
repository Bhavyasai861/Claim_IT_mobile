import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoaderComponent } from '../loader/loader.component';
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
  constructor(private toastController: ToastController, private http: HttpClient, private claimService: ClaimitService, private alertController: AlertController, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      subcategories: ['']
    });
  }

  ngOnInit() {
    this.fetchCategories(); 
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
          console.error('Error fetching categories:', error);
        }
      );
  }
  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }

  async updateCategory(item: any) {
    const categoryName = item.name ;    
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
              await this.submitCategoryUpdate(item.id, data.categoryName);
            } else {
              console.warn("Category name cannot be empty.");
            }
          }
        }
      ]
    });

    await alert.present();
  }
  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera // Opens Camera
      });

      const file = {
        preview: image.dataUrl,
        name: `photo_${Date.now()}.jpg`
      };
      this.files.push(file);
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
      },
      (error) => {
        console.error("Error Posting Category:", error);
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
    const url = `https://qpatefm329.us-east-1.awsapprunner.com/api/admin/categories?id=${id}`;

    try {
      const response = await this.claimService.updateCategory(url, reqBody);
      if (response) {
        this.isLoading = false
        console.log("Category updated successfully:", response);
        this.fetchCategories();
      } else {
        this.isLoading = false
        console.warn("Category update failed:", response);
      }
    } catch (error) {
      this.isLoading = false
      console.error("Error updating category:", error);
    }
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
