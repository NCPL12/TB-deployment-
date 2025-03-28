import { Component } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  
import { CommonModule } from '@angular/common'; 
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-building-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building-details.component.html',
  styleUrls: ['./building-details.component.css']
})
export class BuildingDetailsComponent {
  building: any = null;
  editableBuilding: any = {};
  isEditModalOpen: boolean = false;
  confirmAccountNumber: string = '';
  accountNumberMismatch: boolean = false;
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getBuildingDetails();
  }

  getBuildingDetails(): void {
    this.http.get(`${this.apiBaseUrl}/get-building-details/1`).subscribe({
      next: (response: any) => {
        this.building = response;
      },
      error: (err) => {
        console.error('Error fetching building details:', err);
      }
    });
  }

  openEditModal(): void {
    this.editableBuilding = { ...this.building };
    this.confirmAccountNumber = this.editableBuilding.accountNumber; // Set confirmAccountNumber initially
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.accountNumberMismatch = false;
  }

  saveChanges(): void {
    // Validate account number and confirm account number
    if (this.editableBuilding.accountNumber !== this.confirmAccountNumber) {
      this.accountNumberMismatch = true;
      return;
    }
    this.accountNumberMismatch = false;

    this.http.put(`${this.apiBaseUrl}/edit-building/${this.editableBuilding.id}`, this.editableBuilding, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response) => {
        console.log('Updated:', response);
        this.isEditModalOpen = false; // Close the modal
        this.getBuildingDetails(); // Refresh data
      },
      error: (err) => console.error('Error:', err)
    });
  }
}
