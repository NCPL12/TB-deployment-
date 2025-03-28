import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'user-management',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent {
  users: any[] = []; // Stores all users
  displayedUsers: any[] = []; // Stores filtered tenants based on isDeleted
  showForm: boolean = false;
  isEdit: boolean = false;
  showPasswordModal: boolean = false;
  showErrors: boolean = false;
  currentUser: any = { id: null, username: '', role: '', password: '', fullName: '', phoneNumber: '' };
  passwordInput: string = '';
  showArchive: boolean = false;
  private apiBaseUrl = environment.apiBaseUrl;
  usernameError: string = ''; 

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/get-users`).subscribe(
      (data) => {
        this.users = data;
        this.updateDisplayedUsers();
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  updateDisplayedUsers(): void {
    if (this.showArchive) {
      this.displayedUsers = [...this.users]; // Show all tenants
    } else {
      this.displayedUsers = this.users.filter(user => !user.isDeleted); // Show only active tenants
    }
  }

  toggleArchive(): void {
    this.showArchive = !this.showArchive;
    this.updateDisplayedUsers();
}

  onAddUser(): void {
    this.isEdit = false;
    this.currentUser = { id: null, username: '', role: '', password: '', fullName: '', phoneNumber: '' };
    this.showForm = true;
    this.showErrors = false;
  }

  onCancel(): void {
    this.showForm = false;
    this.showErrors = false;
  }

  // onSaveUser(): void {
  //   this.showErrors = true;

  //   if (!this.currentUser.username || !this.currentUser.role || !this.currentUser.fullName || !this.currentUser.phoneNumber || (!this.isEdit && !this.currentUser.password)) {
  //     console.log('Form validation failed');
  //     return;
  //   }

  //   this.showErrors = false;

  //   this.http.post<any>(`${this.apiBaseUrl}/add-user`, this.currentUser).subscribe(
  //     () => {
  //       console.log('User added successfully');
  //       this.loadUsers();
  //       this.showForm = false;
  //     },
  //     (error) => console.error('Error adding user:', error)
  //   );
  // }

  onEditUser(userId: number): void {
    this.isEdit = true;
    this.currentUser = { ...this.users.find((user) => user.id === userId) };
    this.showForm = true;
  }
  
  onSaveUser(): void {
    this.showErrors = true;
    this.usernameError = "";

    // Validate required fields
    if (!this.currentUser.username || !this.currentUser.role || !this.currentUser.fullName || !this.currentUser.phoneNumber) {
        return;
    }

    // Validate phone number (only 10 digits)
    if (!/^\d{10}$/.test(this.currentUser.phoneNumber)) {
        return;
    }

    this.showErrors = false;

    // Fetch all users and check if the username already exists
    this.http.get<any[]>(`${this.apiBaseUrl}/get-users`).subscribe(
        (users) => {
            const usernameExists = users.some(user => 
                user.username.toLowerCase() === this.currentUser.username.toLowerCase() && user.id !== this.currentUser.id
            );

            if (usernameExists) {
                this.showErrors = true;
                this.usernameError = "Username already exists. Please choose a different username.";
                return;
            }

            // Determine API call based on whether it's an edit or a new user
            const apiUrl = this.isEdit
                ? `${this.apiBaseUrl}/update-user/${this.currentUser.id}`
                : `${this.apiBaseUrl}/add-user`;

            const httpMethod = this.isEdit
                ? this.http.put(apiUrl, this.currentUser)
                : this.http.post(apiUrl, this.currentUser);

            // Save user
            httpMethod.subscribe(
                () => {
                    this.loadUsers();
                    this.showForm = false;
                },
                (error) => console.error(`Error ${this.isEdit ? 'updating' : 'adding'} user:`, error)
            );
        },
        (error) => console.error("Error fetching users:", error)
    );
}

  
  
  onDeleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`${this.apiBaseUrl}/delete-user/${userId}`).subscribe(
        (response) => {
         // console.log(response);
          this.loadUsers();
        },
        (error) => console.error('Error deleting user:', error)
      );
    }
  }
  

  resetForm(): void {
    this.currentUser = { id: null, username: '', role: '', password: '', fullName: '', phoneNumber: '' };
    this.showErrors = false;
  }

  // ✅ Open password update modal
  onUpdatePassword(userId: number): void {
    this.currentUser = { ...this.users.find((user) => user.id === userId) };
    this.passwordInput = ''; // Reset input
    this.showPasswordModal = true;
  }

  // ✅ Save new password
  // onSavePassword(): void {
  //   if (!this.passwordInput || this.passwordInput.length < 6) {
  //     alert("Password must be at least 6 characters long.");
  //     return;
  //   }

  //   this.http.put(`${this.apiBaseUrl}/update-password/${this.currentUser.id}`, { password: this.passwordInput }).subscribe(
  //     (response) => {
  //       console.log(response);
  //       alert("Password updated successfully!");
  //       this.showPasswordModal = false; // Close modal
  //     },
  //     (error) => console.error('Error updating password:', error)
  //   );
  // }

  onSavePassword(): void {
    this.showErrors = true;
  
    if (!this.passwordInput || this.passwordInput.length < 6 || this.passwordInput.length > 15) {
    //  console.log("Validation failed: Password must be between 6 and 15 characters.");
      return;
    }
  
    this.showErrors = false;
  
    this.http.put(`${this.apiBaseUrl}/update-password/${this.currentUser.id}`, { password: this.passwordInput }).subscribe(
      (response) => {
       // console.log(response);
        alert("Password updated successfully!");
        this.showPasswordModal = false; // ✅ Close modal
        this.passwordInput = ''; // ✅ Reset input
      },
      (error) => console.error('Error updating password:', error)
    );
  }
  

  // ✅ Close password modal
  onCancelPasswordUpdate(): void {
    this.showPasswordModal = false;
  }
  
}


