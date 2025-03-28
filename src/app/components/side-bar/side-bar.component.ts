import { Component, EventEmitter, Output  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';


@Component({
  selector: 'side-bar',
  standalone: true,
  imports: [CommonModule,FormsModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
  userName: string = '';
  role: string = '';
  showDropdown: boolean = false;
  showBillingDropdown: boolean = false; 
  showAdminDropdown: boolean = false;
  showReportDropdown:boolean = false; 

  @Output() logout = new EventEmitter<void>();

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.userName = this.loginService.getUsername() || 'Guest';
    this.role = this.loginService.getRole() || '';
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleAdminDropdown(): void {
    this.showAdminDropdown = !this.showAdminDropdown;
    if (this.showAdminDropdown) {
      this.showBillingDropdown = false; 
      this.showReportDropdown = false// Close Billing when Admin opens
    }
  }
  toggleReportDropdown(): void {
    this.showReportDropdown = !this.showReportDropdown;
    if (this.showReportDropdown) {
      this.showAdminDropdown = false;
      this.showBillingDropdown = false;
    }
  }
  
  toggleBillingDropdown(): void {
    this.showBillingDropdown = !this.showBillingDropdown;
    if (this.showBillingDropdown) {
      this.showAdminDropdown = false;
      this.showReportDropdown = false // Close Admin when Billing opens
    }
  }
  

  onSignOut(): void {
    this.loginService.clearUserData();
    this.logout.emit();
    this.router.navigate(['/login']);
  }
}


