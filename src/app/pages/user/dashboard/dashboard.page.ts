import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ], // Add IonicSlidesModule here
})
export class DashboardPage implements OnInit {
  role = 'user'; // Static role for demonstration
  filteredSlides = [
    {
      title: 'Lost Wallet',
      foundDate: '2024-01-01',
      image: 'https://via.placeholder.com/150',
      remainingTime: '2 days',
      locationName: 'City Mall, Los Angeles',
    },
    {
      title: 'Black Umbrella',
      foundDate: '2024-01-10',
      image: 'https://via.placeholder.com/150',
      remainingTime: '5 days',
      locationName: '',
    },
    {
      title: 'Golden Watch',
      foundDate: '2024-01-15',
      image: 'https://via.placeholder.com/150',
      remainingTime: '3 days',
      locationName: 'Central Park',
    },
  ];

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1.5,
    spaceBetween: 10,
    centeredSlides: true,
  };

  showMore = false;

  constructor() {}

  ngOnInit() {}

  toggleShowMore() {
    this.showMore = !this.showMore;
  }

  getLocation(item: any) {
    item.locationName = 'Location not available'; // Static response for location
  }

  shareItem(item: any, platform: string) {
    console.log(`Shared ${item.title} on ${platform}`);
  }
}
