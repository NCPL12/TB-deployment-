import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { LoginService } from "../../services/login.service";

@Component({
  selector: "app-report-history",
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: "./report-history.component.html",
  styleUrls: ["./report-history.component.css"],
})
export class ReportHistoryComponent implements OnInit {

  reportHistory: any[] = [];
  filteredReportHistory: any[] = [];
  isAscending = false;
  searchText = "";
  errorMessage = "";
  showPdfPopup = false;
  sanitizedPdfUrl: SafeResourceUrl | null = null;
  role: string = "";
  userName: string = "";

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.userName = this.loginService.getUsername() || "Guest";
    this.role = this.loginService.getRole() || "";
    this.fetchReportHistory();
  }

  fetchReportHistory(): void {
    this.http.get<any[]>(`${environment.apiBaseUrl}/all-report-histories`).subscribe({
      next: (data) => {
        this.reportHistory = data;
        this.filterRecords(); // also sorts
      },
      error: () => this.errorMessage = "Failed to load report history. Please try again later."
    });
  }

  filterRecords(): void {
    const searchText = this.searchText.toLowerCase();
    this.filteredReportHistory = this.reportHistory.filter(
      (record) =>
        record.report_name?.toLowerCase().includes(searchText) ||
        record.type?.toLowerCase().includes(searchText)
    );
    this.sortFilteredRecords(); // Apply sort after filtering
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
    this.http.get(`${environment.apiBaseUrl}/report-history-pdf/${reportId}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (blob.size > 0) {
          const blobUrl = URL.createObjectURL(blob);
          this.sanitizedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          this.showPdfPopup = true;
        } else {
          this.errorMessage = "The PDF file is empty or could not be loaded.";
        }
      },
      error: () => this.errorMessage = "Failed to load PDF. Please check server logs."
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
