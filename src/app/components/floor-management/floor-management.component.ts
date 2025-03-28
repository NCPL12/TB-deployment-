import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'floor-management',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './floor-management.component.html',
  styleUrl: './floor-management.component.css'
})
export class FloorManagementComponent {

  floors: any[] = []; // Stores all floors
  displayedFloors: any[] = []; // Stores filtered floors
  showForm: boolean = false;
  isEdit: boolean = false;
  currentFloor: any = { id: null, floorName: '' };
  showErrors: boolean = false;
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadFloors();
  }

  loadFloors(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/get-all-floors`).subscribe(
      (data) => {
        this.floors = data;
        this.displayedFloors = [...this.floors];
      },
      (error) => {
        console.error('Error fetching floors:', error);
      }
    );
  }

  onAddFloor(): void {
    this.isEdit = false;
    this.currentFloor = { id: null, floorName: '' };
    this.showForm = true;
    this.showErrors = false;
  }

  onCancel(): void {
    this.showForm = false;
    this.showErrors = false;
  }

  onEditFloor(floorId: number): void {
    this.isEdit = true;
    this.currentFloor = { ...this.floors.find((floor) => floor.id === floorId) };
    this.showForm = true;
  }

  onSaveFloor(): void {  
    this.showErrors = true;

    if (!this.currentFloor.floorName) {
      return;
    }

    this.showErrors = false;

    if (this.isEdit) {
      this.http.put<any>(`${this.apiBaseUrl}/update-floor/${this.currentFloor.id}`, this.currentFloor).subscribe(
        (updatedFloor) => {
          const index = this.floors.findIndex((f) => f.id === this.currentFloor.id);
          if (index > -1) {
            this.floors[index] = { ...this.currentFloor };
          }
          this.showForm = false;
          this.displayedFloors = [...this.floors];
        },
        (error) => console.error('Error updating floor:', error)
      );
    } else {
      this.http.post<any>(`${this.apiBaseUrl}/add-floor`, this.currentFloor).subscribe(
        (newFloor) => {
          this.loadFloors();
          this.showForm = false;
          this.displayedFloors = [...this.floors];
        },
        (error) => console.error('Error adding floor:', error)
      );
    }
  }

  onDeleteFloor(floorId: number): void {
    if (confirm('Are you sure you want to delete this floor?')) {
      this.http
        .delete(`${this.apiBaseUrl}/delete-floor/${floorId}`, { responseType: 'text' }) 
        .subscribe(
          (response) => {
            this.floors = this.floors.filter((floor) => floor.id !== floorId);
            this.displayedFloors = [...this.floors];
          },
          (error) => {
            console.error('Error deleting floor:', error);
          }
        );
    }
  }
}
