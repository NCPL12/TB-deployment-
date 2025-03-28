import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'floor-energy-management',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './floor-energy-management.component.html',
  styleUrls: ['./floor-energy-management.component.css']
})
export class FloorEnergyManagementComponent implements OnInit {
  floorEnergyMeters: any[] = [];
  currentFloorMeter: any = { floorId: null, energyMeterId: null, name: '' };
  showForm = false;
  isEdit = false;
  showErrors = false;
  availableFloors: any[] = [];
  availableEnergyMeters: any[] = [];
  allEnergyMeters: any[] = []; // Store all meters separately
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {  
    this.fetchFloorEnergyMappings();
  }

  fetchFloorEnergyMappings(): void {
    const floorEnergyAPI = `${this.apiBaseUrl}/floor-energy-meter/get-all`;
    const floorsAPI = `${this.apiBaseUrl}/get-all-floors`;
    const energyMetersAPI = `${this.apiBaseUrl}/all-active-energy-meters`;
    const availableEnergyMetersAPI = `http://localhost:8080/bms-reports/v1/available-energy-meter-names`;
  
    forkJoin({
      floorEnergyMappings: this.http.get<any[]>(floorEnergyAPI),
      floors: this.http.get<any[]>(floorsAPI),
      energyMeters: this.http.get<any[]>(energyMetersAPI),
      availableEnergyMeterNames: this.http.get<string[]>(availableEnergyMetersAPI) // Fetch only unmapped meters
    }).subscribe({
      next: ({ floorEnergyMappings, floors, energyMeters, availableEnergyMeterNames }) => {
        this.availableFloors = floors;
        this.floorEnergyMeters = floorEnergyMappings.map(mapping => ({
          ...mapping,
          floorName: this.getFloorName(mapping.floorId)
        }));
  
        // Store all meters and filter out the ones already mapped
        this.allEnergyMeters = energyMeters;
  
        // Set only available (unmapped) energy meters
        this.availableEnergyMeters = energyMeters.filter(meter => 
          availableEnergyMeterNames.includes(meter.name)
        );
  
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching data:', err)
    });
  }
  
  

  /** Get floor name from ID */
  getFloorName(floorId: number): string {
    const floor = this.availableFloors.find(f => f.id === floorId);
    return floor ? floor.floorName : 'Unknown';
  }

  /** Update available energy meters, filtering out already mapped ones */
/** Update available energy meters, filtering out already mapped ones */
updateAvailableEnergyMeters(selectedEnergyMeterId: number | null = null): void {
  const availableEnergyMetersAPI = `http://localhost:8080/bms-reports/v1/available-energy-meter-names`;

  this.http.get<string[]>(availableEnergyMetersAPI).subscribe({
    next: (availableEnergyMeterNames) => {
      this.availableEnergyMeters = this.allEnergyMeters.filter(meter => 
        availableEnergyMeterNames.includes(meter.name) || meter.id === selectedEnergyMeterId
      );

      console.log('Updated Available Energy Meters:', this.availableEnergyMeters.map(m => m.name));
    },
    error: (err) => console.error('Error fetching available energy meters:', err)
  });
}


onAddFloorEnergyMapping(): void {
  this.currentFloorMeter = { floorId: null, energyMeterId: null, name: '' };
  this.isEdit = false;
  this.showForm = true;
  this.showErrors = false;

  // Ensure only unassigned energy meters are available
  this.updateAvailableEnergyMeters(null);
}

onEditFloorEnergyMapping(id: number): void {
  const mapping = this.floorEnergyMeters.find((m) => m.id === id);
  if (mapping) {
    this.currentFloorMeter = { 
      id: mapping.id,
      floorId: mapping.floorId, 
      energyMeterId: mapping.energyMeterId
    };
    this.isEdit = true;
    this.showForm = true;
    this.showErrors = false;

    // Keep current energy meter available
    this.updateAvailableEnergyMeters(mapping.energyMeterId);
  }
}


  /** Validate form */
  validateForm(): boolean {
    if (!this.currentFloorMeter.floorId || !this.currentFloorMeter.energyMeterId) {
      console.error('Validation Failed: Missing floorId or energyMeterId', this.currentFloorMeter);
      return false;
    }

    const selectedEnergyMeter = this.allEnergyMeters.find(em => em.id == this.currentFloorMeter.energyMeterId);
    
    if (!selectedEnergyMeter) {
      console.error('Validation Failed: Energy meter not found for ID:', this.currentFloorMeter.energyMeterId);
      return false;
    }

    this.currentFloorMeter.name = selectedEnergyMeter.name;

    return true;
  }

  /** Save new or edited mapping */
  onSaveFloorEnergyMapping(): void {
    this.showErrors = true;
    if (!this.validateForm()) {
      return;
    }

    const payload = {
      floorId: this.currentFloorMeter.floorId,
      energyMeterId: this.currentFloorMeter.energyMeterId,
      name: this.currentFloorMeter.name,
      ...(this.isEdit && { id: this.currentFloorMeter.id })
    };

    const request = this.isEdit
      ? this.http.put(`${this.apiBaseUrl}/floor-energy-meter/update`, payload, { responseType: 'text' })
      : this.http.post(`${this.apiBaseUrl}/floor-energy-meter/add`, payload);

    request.subscribe({
      next: (response) => {
        console.log('Response:', response);
        this.showForm = false;
        this.fetchFloorEnergyMappings();
      },
      error: (err) => console.error(`Error ${this.isEdit ? 'updating' : 'adding'} mapping:`, err)
    });
  }

  /** Close form */
  onCancel(): void {
    this.showForm = false;
  }
}
