import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private username: string = '';
  private role: string = '';

  constructor() {
    this.username = localStorage.getItem('username') || '';
    this.role = localStorage.getItem('role') || '';
  }

  setUserData(username: string, role: string): void {
    this.username = username;
    this.role = role;

    // Persist data in localStorage for session continuity
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
  }

  getUsername(): string {
    return this.username;
  }

  getRole(): string {
    return this.role;
  }

  clearUserData(): void {
    this.username = '';
    this.role = '';

    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }
}

