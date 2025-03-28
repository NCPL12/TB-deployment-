import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'energy-meter-management',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './energy-meter-management.component.html',
  styleUrls: ['./energy-meter-management.component.css']
})
export class EnergyMeterManagementComponent implements OnInit {
  energyMeters: any[] = [];
  currentEnergyMeter: any = {};
  showForm = false;
  isEdit = false;
  showErrors = false;
  tenants: any[] = []; // Stores all tenants
  availableTenants: any[] = []; // Stores only available tenants
  availableEnergyMeterNames: string[] = [];
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchEnergyMeters();
    this.fetchAvailableTenants();
  }

  fetchAvailableEnergyMeterNames(): void {
    this.http.get<string[]>(`${this.apiBaseUrl}/available-energy-meter-names`).subscribe({
      next: (names) => {
        const assignedMeters = this.energyMeters.map((meter) => meter.name);
        this.availableEnergyMeterNames = names.filter((name) => !assignedMeters.includes(name));
      },
      error: (err) => console.error('Error fetching available energy meter names:', err)
    });
  }

  fetchAvailableTenants(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/get-all-tenants`).subscribe({
      next: (tenants) => {
        this.tenants = tenants;
        this.availableTenants = tenants.filter(t => !t.isDeleted && t.id !== 1);
      },
      error: (err) => console.error('Error fetching tenants:', err)
    });
  }

  fetchEnergyMeters(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/all-active-energy-meters`).subscribe({
      next: (data) => {
        this.energyMeters = data;

        const tenantRequests = data.map((meter) => 
          this.http.get<any>(`${this.apiBaseUrl}/tenant-detail-by-id?tenantId=${meter.tenantId}`)
        );

        forkJoin(tenantRequests).subscribe({
          next: (tenants) => {
            this.energyMeters.forEach((meter, index) => {
              meter.tenantName = tenants[index]?.name || 'Unknown';
            });
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error fetching tenant details:', err)
        });

        this.fetchAvailableEnergyMeterNames();
      },
      error: (err) => console.error('Error fetching energy meters:', err)
    });
  }

  onAddEnergyMeter(): void {
    this.fetchAvailableEnergyMeterNames();
    this.fetchAvailableTenants();

    this.currentEnergyMeter = {};
    this.isEdit = false;
    this.showForm = true;
    this.showErrors = false;
  }

  onEditEnergyMeter(id: number): void {
    const meter = this.energyMeters.find((m) => m.id === id);
    if (meter) {
      this.currentEnergyMeter = { ...meter };
      this.isEdit = true;
      this.showForm = true;
      this.showErrors = false;
      this.fetchAvailableTenants();
    }
  }

  validateForm(): boolean {
    return !!this.currentEnergyMeter.name && !!this.currentEnergyMeter.tenantId;
  }

  onSaveEnergyMeter(): void {
    this.showErrors = true;

    if (!this.validateForm()) {
      console.error('Form validation failed', this.currentEnergyMeter);
      return;
    }

    const request = this.isEdit
      ? this.http.put(`${this.apiBaseUrl}/update-energy-meter`, this.currentEnergyMeter, { responseType: 'text' })
      : this.http.post(`${this.apiBaseUrl}/add-energy-meter`, this.currentEnergyMeter, { responseType: 'text' });

    request.subscribe({
      next: () => {
        this.showForm = false;
        this.fetchEnergyMeters();
      },
      error: (err) => console.error(`Error ${this.isEdit ? 'updating' : 'adding'} energy meter:`, err)
    });
  }

  onCancel(): void {
    this.showForm = false;
  }
}
