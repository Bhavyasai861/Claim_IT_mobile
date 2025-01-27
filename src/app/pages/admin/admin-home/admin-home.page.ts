import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';
import { ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import SwiperCore from 'swiper';
import { IonicSlides } from '@ionic/angular';



@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
  standalone:true,
  imports: [CommonModule, FormsModule, IonicModule,NgChartsModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Add this line if needed

})
export class AdminHomePage implements OnInit {
  isModalOpen = false;
  selectedDate: string = ''; 
  currentMonth: any = [];
  currentMonthData: any = {
    totalItems: 0,
    claimed: 0,
    unclaimed: 0,
    donated: 0,
  };
  displayedCharities: any[] = [];

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
  charities = [
    {
      name: 'Hope Shelter',
      description: 'Provides food and shelter to homeless families and individuals.',
      impact: 'Over 1,000 families have received help this year.',
      howWeHelp: 'By connecting lost and unclaimed items to the charity, we help them raise funds and support their initiatives.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNr7IpS66-t7vsuZD_MrWA07UD4YQr7BPjXw&s',
      donations: [
        { name: 'Clothing', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-YiZi38fv78m-6149In80vzN5MbteVvPmJg&s' },
        { name: 'Electronics', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRldZSpZcvWC1_aNy7ECZkrpCbzx0l1urWiUMwNLcB_Fbfom3k-J-Fiv6DLVylWW7y7pRk&usqp=CAU' },
      ],
      website: 'https://hopeshelter.org',
    },
    {
      name: 'Green Earth Foundation',
      description: 'Focuses on reforestation and environmental conservation efforts.',
      impact: 'Planted over 500,000 trees in the last decade.',
      howWeHelp: 'Our platform contributes by donating funds from unclaimed items and promoting awareness.',
      image: 'https://images.squarespace-cdn.com/content/v1/57e58a719de4bb2c92a0fe52/1679525217981-HSB5QYU4R48IXXLWSWDI/41-Ways-to-Save-the-Planet-in-5-Minutes-or-Less-19.jpg?format=500w',
      donations: [
        { name: 'Gardening Tools', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTz52ELjn6srieNAHqhtUyS4fI61HPAnX6BTQ&s' },
        { name: 'Tree Saplings', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4CNzZBrKZ1kHgwFZ7kIA9lDl0B4MNrwTO2Q&s' },
      ],
      website: 'https://greenearth.org',
    },
    {
      name: 'Smile Education Trust',
      description: 'Provides education and resources to underprivileged children.',
      impact: 'Educated over 10,000 children in rural areas.',
      howWeHelp: 'Our website donates unclaimed study materials and raises awareness about education needs.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeyTnpohgYhB12Djr9KOknZe52kXpuglXya4O-V_6QMgtMccFJ0G8qnFun-dj6b_bEzVE&usqp=CAU',
      donations: [
        { name: 'Books',  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4CNzZBrKZ1kHgwFZ7kIA9lDl0B4MNrwTO2Q&s' },
        { name: 'Stationery', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBYl17U8B0hih86tFF9Rg8fh4esv3nHNozF1U2thq6cDGhUALeWGIzj-jXVUON5qOIfmA&usqp=CAU' },
      ],
      website: 'https://smileeducation.org',
    },
  ];
  currentCharity: any;

  currentIndex = 0;
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
  onSlideChange(event: any) {
    console.log('Slide changed!', event);
  }
  
  constructor(private claimService: ClaimitService) {
    this.currentCharity = this.charities[0];

  }
  displayRandomCharity() {
    // Show a random charity from the list
    const randomIndex = Math.floor(Math.random() * this.charities.length);
    this.currentCharity = this.charities[randomIndex];
  }
  ngOnInit(): void {
    const month = this.selectedMonth.getMonth() + 1; 
    const year = this.selectedMonth.getFullYear();
    this.currentMonth = (this.selectedMonth.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = this.selectedMonth.getFullYear();
    
    this.statusCount(this.currentMonth, currentYear);
    this.monthName = this.selectedMonth.toLocaleString('default', { month: 'long' });

  }

 
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


  closeCalendarDialog() {
    this.isModalOpen = false; 
  }
  onModalDismiss() {
    console.log('Modal closed');
  }
  selectDate(event:any) {
    const { month, year } = event;
    this.selectedMonth = new Date(this.selectedDate); 
    this.isModalOpen = false; 
    this.monthName = this.selectedMonth
    this.selectedMonth = new Date(year, month - 1);    
    this.statusCount(month,year)
  }
  openCalendarDialog(): void {
    this.isModalOpen=true
  }
  statusCount(month: number, year: number): void {
    this.claimService.statusCount(month.toString(), year).subscribe({
      next: (res: any) => {
        const data = res.data || res.results;
        if (res && res.length > 0) {
          const data = res[0];          
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

}