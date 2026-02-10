import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isShrunk = false;
  private lastScrollTop = 0;
  cartCount = 0;
  isMenuOpen = false;
  openMenu: string | null = null;
  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  toggleSubMenu(name: string) {
  this.openMenu = this.openMenu === name ? null : name;
}
  public logout() {
    if (!confirm('Are you sure you want to logout?')) return;

    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/login-page']);
      },
      error: () => {
        alert('Logout failed');
      },
    });
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const current = window.scrollY;

    if (current > this.lastScrollTop && current > 20) {
      this.isShrunk = true;
    } else {
      this.isShrunk = false;
    }

    this.lastScrollTop = current <= 0 ? 0 : current;
  }
}