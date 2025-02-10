import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.page.html',
  styleUrls: ['./category-management.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule]
})
export class CategoryManagementPage implements OnInit {
  categoryForm: FormGroup;
  categories: any[] = []; 
  isModalOpen = false;
  files: any[] = [];
  formData!: any;
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
  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }

  async updateCategory(item: any) {
    const categoryName = item.categoryName;

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
      color: 'success'
    });
    await toast.present();
  }

  async submitCategoryUpdate(id: any, categoryName: string) {
    const reqBody = {
      categoryName: categoryName,
      status: "A"
    };

    const url = `http://172.17.12.101:8081/api/admin/categories/${id}`;

    try {
      const response = await this.claimService.updateCategory(url, reqBody);
      if (response) {
        console.log("Category updated successfully:", response);
        this.fetchCategories();
      } else {
        console.warn("Category update failed:", response);
      }
    } catch (error) {
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
            this.claimService.deleteCategory(reqBody).subscribe(
              (response: any) => {
                this.fetchCategories();
              },
              (error) => {
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
