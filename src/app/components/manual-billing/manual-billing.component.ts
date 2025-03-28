import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { LoginService } from '../../services/login.service'; // Import LoginService

@Component({
  selector: 'manual-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './manual-billing.component.html',
  styleUrls: ['./manual-billing.component.css']
})
export class ManualBillingComponent implements OnInit {
  tenants: any[] = [];
  selectedTenantId: number | null = null;
  startDate: string = '';
  endDate: string = '';
  showErrors: boolean = false;
  private apiBaseUrl = environment.apiBaseUrl;
  loggedInUser: string = ''; // Store logged-in user

  constructor(private http: HttpClient, private loginService: LoginService) {}

  ngOnInit(): void {
    this.fetchAllTenants();
    this.setDefaultDates();
    this.loadLoggedInUser(); // Get logged-in user
  }

  loadLoggedInUser(): void {
    this.loggedInUser = this.loginService.getUsername() || 'UnknownUser';
  }

  fetchAllTenants(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/get-all-tenants`).subscribe({
      next: (data) =>         this.tenants = data.filter(tenant => tenant.isDeleted == false && tenant.id !== 1), // Only include active tenants

      error: (err) => console.error('Failed to fetch tenants:', err)
    });
  }

  setDefaultDates(): void {
    const today = new Date();
    const lastMonthSameDay = new Date(today);
    lastMonthSameDay.setMonth(today.getMonth() - 1);
    if (lastMonthSameDay.getMonth() === today.getMonth()) {
      lastMonthSameDay.setDate(0);
    }
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    this.startDate = formatDate(lastMonthSameDay);
    this.endDate = formatDate(today);
  }

  exportManualBill(): void {
    if (!this.formIsValid()) {
      this.showErrors = true;
      console.log('Form is invalid. Fix errors before exporting.');
      return;
    }

    const endpoint = `${this.apiBaseUrl}/export-manual-bill?tenantId=${this.selectedTenantId}&fromDate=${this.startDate}&toDate=${this.endDate}`;
    this.http.get(endpoint, { responseType: 'blob' }).subscribe({
      next: (data) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ManualBill_${this.startDate}_${this.endDate}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.storeManualBillingHistory(blob);
      },
      error: (err) => console.error('Failed to export manual bill:', err)
    });
  }
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-GB'); // 'en-GB' gives DD-MM-YYYY format
  }

  storeManualBillingHistory(pdfContent: Blob): void {
    if (!this.selectedTenantId || !this.startDate || !this.endDate) return;
  
    const formData = new FormData();

    const billingHistory = {
      bill_name: `ManualBill_${this.startDate}_${this.endDate}.pdf`,
      generated_date: new Date().toISOString(),
      tenant_id: this.selectedTenantId,
      periods:  `${this.formatDate(this.startDate)} to ${this.formatDate(this.endDate)}`
      ,
      type: 'Manual'
    };

    formData.append('billHistory', JSON.stringify(billingHistory));

    const pdfFile = new File([pdfContent], billingHistory.bill_name, { type: 'application/pdf' });
    formData.append('file', pdfFile);

    this.http.post(`${this.apiBaseUrl}/add-bill-history`, formData).subscribe({
      next: () => console.log('✅ Manual billing history recorded successfully'),
      error: (err) => console.error('❌ Failed to record manual billing history:', err)
    });
  }

  formIsValid(): boolean {
    return !!this.selectedTenantId && !!this.startDate && !!this.endDate && !this.isInvalidDateRange();
  }

  isInvalidDateRange(): boolean {
    return this.startDate > this.endDate;
  }
}
