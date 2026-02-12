import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth';
import { Cart_Service } from '../services/cart';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
  export class Header implements OnInit {
  isShrunk = false;
  private lastScrollTop = 0;
  cartCount = 0;
  isMenuOpen = false;
  openMenu: string | null = null;
  isProfileOpen = false;
  constructor(
    public auth: AuthService,
    private router: Router,
    private cart: Cart_Service,
  ) {}
  ngOnInit(): void {
  this.cart.list_cart().subscribe();
  this.cart.cartCount$.subscribe((count) => {
    this.cartCount = count;
  });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
    this.isProfileOpen = false;
  }
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfile() {
    this.isProfileOpen = false;
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
  this.isShrunk = window.scrollY > 20;
}

}
