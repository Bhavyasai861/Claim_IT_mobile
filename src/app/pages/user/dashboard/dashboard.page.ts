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
  data = [
    { title: 'Box 1', content: 'This is the content for box 1' },
    { title: 'Box 2', content: 'This is the content for box 2' },
    { title: 'Box 3', content: 'This is the content for box 3' },
    { title: 'Box 4', content: 'This is the content for box 4' },
    { title: 'Box 5', content: 'This is the content for box 5' },
    { title: 'Box 6', content: 'This is the content for box 6' },
    { title: 'Box 7', content: 'This is the content for box 7' },
    { title: 'Box 8', content: 'This is the content for box 8' },
    { title: 'Box 9', content: 'This is the content for box 9' },
    { title: 'Box 10', content: 'This is the content for box 10' },
  ];
  currentIndex=0
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
  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  next() {
    if (this.currentIndex < this.data.length - 1) {
      this.currentIndex++;
    }
  }
}
