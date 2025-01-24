import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import Swiper from 'swiper';
// import { SwiperOptions } from 'swiper';

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
  standalone:true,
  imports: [CommonModule, FormsModule, IonicModule,NgChartsModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line if needed

})
export class AdminHomePage implements OnInit {

  currentMonthData: any = {
    totalItems: 0,
    claimed: 0,
    unclaimed: 0,
    donated: 0,
  };
  startIndex = 0;
  endIndex = 3;
  monthName: any = [];
  selectedMonth: Date = new Date();
  public pieChartType: ChartType = 'pie';
  public barChartType: ChartType = 'bar';
  lineChartType: ChartType = 'line';
  doughnutChartType: ChartType = 'doughnut';
  doughnutChartData = {
    labels: ['Claimed', 'Unclaimed', 'Donated'],
    datasets: [
      {
        data: [30, 50, 20],
        backgroundColor: ['green', 'yellow', 'red'],
      },
    ],
  };
  doughnutChartLabels = this.doughnutChartData.labels;
  lineChartData: ChartData = {
    labels: this.monthName == '' ? "dec" : this.monthName,
    datasets: [
      {
        label: 'Claimed Items',
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(0, 128, 0, 0.5)', // Green with transparency
        borderColor: 'green', // Line color
        fill: false, // Fills the area under the line
      },
      {
        label: 'Unclaimed Items',
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
        borderColor: 'yellow',
        fill: false,
      },
    ],
  };
 
  lineChartLabels = this.lineChartData.labels;
  public PieChartData: any = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'], // Labels for the slices
    datasets: [
      {
        data: [120, 150, 90, 180, 70], // Values for each slice
        backgroundColor: [ // Background colors for each slice
          'rgba(255, 99, 132, 0.6)',  // Red
          'rgba(54, 162, 235, 0.6)',  // Blue
          'rgba(255, 206, 86, 0.6)',  // Yellow
          'rgba(75, 192, 192, 0.6)',  // Green
          'rgba(153, 102, 255, 0.6)', // Purple
        ],
        borderColor: [ // Optional border colors for each slice
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1, // Border width for the slices
      },
    ],
  };

  barChartData: any = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'], // X-axis labels
    datasets: [
      {
        label: 'Sales', // Label for the dataset
        data: [50, 75, 100, 125, 90, 110], // Static data for each label
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', // Colors for each bar
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)', // Border colors for each bar
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1, // Border width for each bar
      },
    ],
  
  };
i: any;
  isTimeisUp(item: any): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(item.foundDate) <= thirtyDaysAgo;
  }

  getLocation(item: any) {
    if (!item.locationName) {
      item.locationName = 'Retrieved Location'; // Simulate location retrieval
    }
  }

  constructor(private claimService: ClaimitService) {}

  ngOnInit(): void {
    const month = this.selectedMonth.getMonth() + 1; // JavaScript months are zero-indexed
    const year = this.selectedMonth.getFullYear();
    this.statusCount(month, year);
    this.monthName = this.selectedMonth.toLocaleString('default', { month: 'long' });

  }

  statusCount(month: number, year: number): void {
    this.claimService.statusCount(month.toString(), year).subscribe({
      next: (res: any) => {
        console.log(res);
        const data = res.data || res.results;
        console.log(data);
        
        if (res && res.length > 0) {
          const data = res[0];
          console.log(data);
          
          this.currentMonthData.totalItems = data.totalItems;
          this.currentMonthData.claimed = data.claimed;
          this.currentMonthData.unclaimed = data.unclaimed;
          this.currentMonthData.donated = data.rejected + data.archived;
          this.updateDoughnutChartData();
        } else{
          this.currentMonthData.totalItems = data.totalItems;
          this.currentMonthData.claimed = data.claimed;
          this.currentMonthData.unclaimed = data.unclaimed;
          this.currentMonthData.donated = data.rejected + data.archived;
        }
      },
    });
  }
  @ViewChild('swiper', { static: false })
  swiper!: ElementRef;
//  slideOpts: SwiperOptions = {
//     initialSlide: 0,
//     speed: 400,
//     spaceBetween: 20,
//     loop: true,
//     slidesPerView: 'auto',
//     centeredSlides: true,
//   };

  // Example records
  records = [
    {
      name: 'Beautiful Sunset',
      description: 'A breathtaking view of the sunset over the ocean. The sky turns vibrant colors as the sun sets on the horizon.',
      image: 'https://via.placeholder.com/400x200.png?text=Sunset+Image',
      date: 'January 24, 2025',
      additionalImages: [
        'https://via.placeholder.com/200x100.png?text=Image+1',
        'https://via.placeholder.com/200x100.png?text=Image+2',
        'https://via.placeholder.com/200x100.png?text=Image+3'
      ],
      tags: ['Nature', 'Sunset', 'Ocean', 'Travel']
    },
    {
      name: 'Mountain Adventure',
      description: 'Explore the stunning mountains and valleys with breathtaking views.',
      image: 'https://via.placeholder.com/400x200.png?text=Mountain+Image',
      date: 'February 10, 2025',
      additionalImages: [
        'https://via.placeholder.com/200x100.png?text=Image+1',
        'https://via.placeholder.com/200x100.png?text=Image+2',
        'https://via.placeholder.com/200x100.png?text=Image+3'
      ],
      tags: ['Adventure', 'Mountains', 'Nature', 'Travel']
    },
    {
      name: 'City Life',
      description: 'Experience the hustle and bustle of city streets and urban culture.',
      image: 'https://via.placeholder.com/400x200.png?text=City+Image',
      date: 'March 5, 2025',
      additionalImages: [
        'https://via.placeholder.com/200x100.png?text=Image+1',
        'https://via.placeholder.com/200x100.png?text=Image+2',
        'https://via.placeholder.com/200x100.png?text=Image+3'
      ],
      tags: ['City', 'Urban', 'Culture', 'Life']
    }
  ];

  // Mouse hover logic
  isHovering = false;
  startX: number = 0;
  currentX: number = 0;

  onMouseEnter() {
    this.isHovering = true;
  }

  onMouseLeave() {
    this.isHovering = false;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isHovering) {
      this.currentX = event.clientX;
      const delta = this.startX - this.currentX;

      // Adjust swiper based on mouse movement
      if (Math.abs(delta) > 50) {
        const swiperInstance = this.swiper.nativeElement.swiper;
        if (delta > 0) {
          swiperInstance.slideNext();
        } else {
          swiperInstance.slidePrev();
        }
        this.startX = this.currentX;
      }
    }
  }
 
  updatedPieChartData(labels: string[], dataPoints: number[]): void {
    this.PieChartData.labels = [...labels];
    this.PieChartData.datasets[0].data = [...dataPoints];
    this.PieChartData.datasets[0].backgroundColor = this.generateChartColors(labels.length);

    this.PieChartData = { ...this.PieChartData };
  }

  updatedBarChartData(labels: string[], dataPoints: number[]): void {
    this.barChartData.labels = [...labels];
    this.barChartData.datasets[0].data = [...dataPoints];
    this.barChartData.datasets[0].backgroundColor = this.generateChartColors(labels.length);

    this.barChartData = { ...this.barChartData };
  }

  updateDoughnutChartData(): void {
    const colors = this.generateChartColors(3);
    this.doughnutChartData = {
      labels: ['Claimed', 'Unclaimed', 'Donated'],
      datasets: [
        {
          data: [
            this.currentMonthData.claimed,
            this.currentMonthData.unclaimed,
            this.currentMonthData.donated,
          ],
          backgroundColor: colors,
        },
      ],
    };

    const lineChartColors = this.generateChartColors(2);

    this.lineChartData = {
      labels: [this.selectedMonth.toLocaleString('default', { month: 'long' })],
      datasets: [
        {
          label: 'Claimed Items',
          data: [this.currentMonthData.claimed],
          backgroundColor: lineChartColors[0],
          borderColor: lineChartColors[0],
          fill: false,
        },
        {
          label: 'Unclaimed Items',
          data: [this.currentMonthData.unclaimed],
          backgroundColor: lineChartColors[1],
          borderColor: lineChartColors[1],
          fill: false,
        },
      ],
    };
  }

  generateChartColors(count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(
        `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`
      );
    }
    return colors;
  }

  openCalendarDialog(): void {
    console.log('Calendar dialog opened');
  }
}