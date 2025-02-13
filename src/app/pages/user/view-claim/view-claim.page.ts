import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';

@Component({
  selector: 'app-view-claim',
  templateUrl: './view-claim.page.html',
  styleUrls: ['./view-claim.page.scss'],
  standalone:true,
  imports:[CommonModule,IonicModule,FormsModule]
})
export class ViewClaimPage implements OnInit {
  searchValue: any;
  searchQuery: string = '';
  items:any=[]
  selectedImage: string = '';
  isImageModalOpen = false;
  isLoading: boolean = false;
  noRecord:boolean =false
  constructor(private claimService:ClaimitService) { }

  ngOnInit() {
    this.fetchItems()
  }
  fetchItems() {
    const query = this.searchQuery.trim();
    let searchParams = {
      email: '',
      userName: ''
    };
  
    if (query.includes('@')) {
      searchParams.email = query;
    } else {
      searchParams.userName = query;
    }
    this.isLoading = true;
    this.claimService.getAllItems(searchParams).subscribe(
      (res: any) => {
        this.items = res.claimHistory;
        if (res.length !== 0) {
          this.noRecord = false;
        }
        else {
          this.noRecord = true;
        }
        this.isLoading = false;  
      },
      (error) => {
        this.isLoading = false;  
      }
      );
  }
  getImage(base64String: string): string {
    return `data:image/jpeg;base64,${base64String}`;
  }
  openImageModal(image: string) {
    this.selectedImage = `data:image/jpeg;base64,${image}`;
    this.isImageModalOpen = true;
  }
  closeImageModal() {
    this.isImageModalOpen = false;
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
  
  getTextColor(status: string): string {
    if (status === 'UNCLAIMED' || status === 'REJECTED') {
      return '#fff'; 
    }
    return '#333'; 
  }
}
