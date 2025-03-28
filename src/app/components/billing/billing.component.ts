import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginService } from '../../services/login.service'; // Import LoginService


@Component({
  selector: 'billing',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgClass], // Add NgClass here
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  tenants: any[] = [];
  selectedTenantId: number | null = null;
  selectedMonth: string = '';
  showErrors: boolean = false;
  private apiBaseUrl = environment.apiBaseUrl;
  loggedInUser: string = ''; // Store logged-in user


  constructor(private http: HttpClient, private loginService: LoginService) {}
  ngOnInit(): void {
    this.fetchAllTenants();
    this.setDefaultMonth();
    this.loadLoggedInUser(); // Get logged-in user
  }


  fetchAllTenants(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/get-all-tenants`).subscribe({
      next: (data) =>this.tenants = data.filter(tenant => tenant.isDeleted == false && tenant.id !== 1)// Only include active tenants
      ,
      
      error: (err) => console.error('Failed to fetch tenants:', err)
    });
  }

  loadLoggedInUser(): void {
    this.loggedInUser = this.loginService.getUsername() || 'UnknownUser';
  }
  setDefaultMonth(): void {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
    const month = (lastMonth.getMonth() + 1).toString().padStart(2, '0');
    const year = lastMonth.getFullYear();
    this.selectedMonth = `${year}-${month}`;
  }
  exportBill(): void {
    this.showErrors = !this.formIsValid();
    if (this.showErrors) return;

    const [year, month] = this.selectedMonth.split('-');
    const endpoint = `${this.apiBaseUrl}/export-bill?tenantId=${this.selectedTenantId}&month=${month}&year=${year}`;

    this.http.get(endpoint, { responseType: 'blob' }).subscribe({
      next: (data) => {
        const fileName = `bill_${year}_${month}.pdf`;
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.storeBillingHistory(blob, fileName);
      },
      error: (err) => console.error('Failed to export bill:', err)
    });
  }
  getPeriodRange(selectedMonth: string): string {
    const [year, month] = selectedMonth.split('-').map(Number); // Extract year and month correctly
  
    // Ensure month is always two digits (e.g., "01" instead of "1")
    const formattedMonth = month.toString().padStart(2, '0');
  
    // Get the last day of the selected month
    const lastDayOfMonth = new Date(year, month, 0).getDate();
  
    // Format the first and last day
    const firstDay = `1/${formattedMonth}/${year}`;
    const lastDay = `${lastDayOfMonth}/${formattedMonth}/${year}`;
  
    return `${firstDay} to ${lastDay}`;
  }
  


  storeBillingHistory(file: Blob, fileName: string): void {
    if (!this.selectedTenantId || !this.selectedMonth) {
        console.error('Missing tenant ID or month!');
        return;
    }

    const formData = new FormData();
    formData.append('billHistory', JSON.stringify({
        bill_name: fileName,
        generated_date: new Date().toISOString(),
        tenant_id: this.selectedTenantId,
        type: 'Monthly',
        periods: this.getPeriodRange(this.selectedMonth)
    }));


   formData.append('file', file, fileName);

    this.http.post(`${this.apiBaseUrl}/add-bill-history`, formData).subscribe({
        next: () => console.log('✅ Billing history recorded successfully'),
        error: (err) => console.error('❌ Failed:', err)
    });
  }

  formIsValid(): boolean {
    return !!this.selectedTenantId && !!this.selectedMonth;
  }
}
