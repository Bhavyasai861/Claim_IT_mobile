import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.page.html',
  styleUrls: ['./category-management.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CategoryManagementPage implements OnInit {
  categories: any[] = []; // Store the fetched categories

  constructor(private http: HttpClient, private claimService:ClaimitService,private alertController: AlertController) { }

  ngOnInit() {
    this.fetchCategories(); // Fetch categories when the component initializes
  }

  // Fetch the categories from the API
  fetchCategories(): void {
    this.http.get<{ id: number; name: string }[]>('https://100.28.242.219.nip.io/api/admin/getcategories')
      .subscribe(
        (response) => {
          this.categories = response;
        },
        (error) => {
          console.error('Error fetching categories:', error);
        }
      );
  }

  // Dynamically assign category icons based on category name
  getCategoryIcon(value: string): string {
    switch (value) {
      case 'Fashion&Apparel':
        return 'assets/categories/fashion.jpg';
      case 'Electronics':
        return 'assets/categories/electronics.jpg';
      case 'Footwear':
        return 'assets/categories/footwear.jpg';
      case 'PersonalAccessories':
        return 'assets/categories/personal.jpg';
      case 'Clothes':
        return 'assets/categories/clothes.jpg';
      case 'JewellerySets':
        return 'assets/categories/jewallary.jpg';
      case 'OfficeTools&Stationary':
        return 'assets/categories/officeTools.png';
      case 'MusicalInstruments':
        return 'assets/categories/musical.png';
      case 'Watches':
        return 'assets/categories/watches.jpg';
        case 'Toys&Baby Products':
          return 'assets/categories/toys.png';
          case 'Food & BeverageCarriers':
            return 'assets/categories/carriers.png';
      default:
        return 'assets/categories/default.jpg';
    }
  }
  async updateCategory(item: any) {
    const categoryName = item.categoryName ; 
  
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
  
  async submitCategoryUpdate(id: any, categoryName: string) {
    const reqBody = {
      categoryName: categoryName,
      status: "A"
    };
  
    const url = `http://172.17.12.38:8081/claimit/lookup/categories/${id}`;
  
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
