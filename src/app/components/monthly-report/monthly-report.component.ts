import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monthly-report.component.html',
  styleUrls: ['./monthly-report.component.css']
})
export class MonthlyReportComponent {
  selectedMonthYear: string = '';
  showErrors: boolean = false;
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {
    this.setDefaultMonthYear();
  }

  setDefaultMonthYear(): void {
    const today = new Date();
    today.setMonth(today.getMonth() - 1); // Set to the previous month
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Ensure two digits
    this.selectedMonthYear = `${year}-${month}`;
  }

  onInputChange(): void {
    this.showErrors = !this.selectedMonthYear;
  }

  exportPdfReport(): void {
    if (!this.selectedMonthYear) {
      this.showErrors = true;
      return;
    }

    const [year, month] = this.selectedMonthYear.split('-');
    const endpoint = `${this.apiBaseUrl}/floor-reports/export-monthly-report`;

    const queryParams = `?month=${month}&year=${year}`;
    window.open(endpoint + queryParams, '_blank');
  }
}
