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
        { name: 'Books', image: 'data:image/jpeg;base64,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' },
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
  selectDate() {
    this.selectedMonth = new Date(this.selectedDate); 
    this.isModalOpen = false; 
    this.monthName = this.selectedMonth
  }
  openCalendarDialog(): void {
    this.isModalOpen=true
  }

}