import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClaimitService } from '../../SharedServices/claimit.service';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
  standalone:true,
  imports: [CommonModule, FormsModule, IonicModule,]
})
export class AdminHomePage implements OnInit {
  doughnutChartType: string = 'doughnut';
  currentMonthData: any = {
    totalItems: 0,
    claimed: 0,
    unclaimed: 0,
    donated: 0,
  };

  selectedMonth: Date = new Date();
  PieChartData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  };

  barChartData: any = {
    labels: [],
    datasets: [
      {
        label: [],
        data: [],
        backgroundColor: [],
      },
    ],
  };

  doughnutChartData: any = {};
  lineChartData: any = {};

  constructor(private claimService: ClaimitService) {}

  ngOnInit(): void {
    const month = this.selectedMonth.getMonth() + 1; // JavaScript months are zero-indexed
    const year = this.selectedMonth.getFullYear();
    this.statusCount(month, year);
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

  // categoryItems(month: number, year: number): void {
  //   this.claimService.categoryItems(month.toString(), year).subscribe((res: any) => {
  //     const labels = res.map((item: any) => item.categoryName);
  //     const dataPoints = res.map((item: any) => item.itemCount);
  //     this.updatedPieChartData(labels, dataPoints);
  //     this.updatedBarChartData(labels, dataPoints);
  //   });
  // }

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