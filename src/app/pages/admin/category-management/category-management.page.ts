import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.page.html',
  styleUrls: ['./category-management.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CategoryManagementPage implements OnInit {
  categories: any[] = []; // Store the fetched categories

  constructor(private http: HttpClient) { }

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
}
