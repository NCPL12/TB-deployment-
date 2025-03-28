import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-automated-report',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './automated-report.component.html',
  styleUrls: ['./automated-report.component.css']
})
export class AutomatedReportComponent implements OnInit {

  reportHistory: any[] = [];
  filteredReportHistory: any[] = [];
  isAscending = false;
  searchText = '';
  errorMessage = '';
  showPdfPopup = false;
  sanitizedPdfUrl: SafeResourceUrl | null = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchReportHistory();
  }

  fetchReportHistory(): void {
    this.http.get<any[]>(`${environment.apiBaseUrl}/scheduled-floor-reports/report-all`).subscribe({
      next: (data) => {
        this.reportHistory = data;
        this.filterRecords(); // also sorts
      },
      error: () => {
        this.errorMessage = "Failed to load automated reports. Please try again later.";
      }
    });
  }

  filterRecords(): void {
    const searchText = this.searchText.toLowerCase();
    this.filteredReportHistory = this.reportHistory.filter(
      (record) =>
        record.report_name?.toLowerCase().includes(searchText) ||
        record.periods?.toLowerCase().includes(searchText)
    );
    this.sortFilteredRecords();
  }

  highlightSearch(record: any): boolean {
    return this.searchText && record.report_name?.toLowerCase().includes(this.searchText.toLowerCase());
  }

  toggleSortOrder(): void {
    this.isAscending = !this.isAscending;
    this.sortFilteredRecords();
  }

  sortFilteredRecords(): void {
    this.filteredReportHistory.sort((a, b) => {
      const dateA = new Date(a.generated_date).getTime();
      const dateB = new Date(b.generated_date).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
  }

  openPdfPopup(reportId: number): void {
    this.http.get(`${environment.apiBaseUrl}/scheduled-floor-reports/${reportId}/pdf-view`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (blob && blob.size > 0) {
          const blobUrl = URL.createObjectURL(blob);
          this.sanitizedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          this.showPdfPopup = true;
        } else {
          this.errorMessage = "The PDF file is empty or could not be loaded.";
        }
      },
      error: () => {
        this.errorMessage = "Failed to load PDF. Please check server logs.";
      }
    });
  }

  closePdfPopup(): void {
    this.showPdfPopup = false;
    if (this.sanitizedPdfUrl) {
      URL.revokeObjectURL(this.sanitizedPdfUrl as any);
      this.sanitizedPdfUrl = null;
    }
  }
}
