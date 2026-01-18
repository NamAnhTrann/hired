import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product_Service } from '../services/product';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { Dashboard_Service } from '../services/dashboard';
import { SellerStats } from '../models/seller_stats';
import { User } from '../models/user_interface';
import { Seller } from '../models/seller_interface';
import { Seller_Service } from '../services/seller';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {
  products: any[] = [];
  top_products: any[] = [];
  isRefreshing = false;
  current_user: User | null = null;
  seller: Seller | null = null;

  seller_stats: SellerStats | null = null;

  constructor(
    private productService: Product_Service,
    private router: Router,
    private auth: AuthService,
    private dashboardService: Dashboard_Service,
    private sellerService: Seller_Service,
  ) {}
ngOnInit() {
  this.auth.load_user().subscribe({
    next: (res: any) => {
      this.current_user = res.user;
      this.refresh(); 
    },
    error: () => {
      this.current_user = null;
    },
  });

  this.sellerService.get_seller().subscribe({
    next: (res) => {
      this.seller = res.data as Seller;
    },
    error: (err) => {
      console.error(err);
      this.seller = null;
    },
  });

  this.dashboardService.get_seller_stats().subscribe({
    next: (stats) => {
      this.seller_stats = stats;
    },
    error: () => {
      this.seller_stats = null;
    },
  });
}

public refresh() {
  if (!this.current_user) {
    return;
  }

  this.isRefreshing = true;

  this.productService.list_my_products().subscribe({
    next: (res: any) => {
      this.products = res.data;

      this.top_products = [...this.products]
        .sort((a, b) => b.product_view_count - a.product_view_count)
        .slice(0, 5);

      this.isRefreshing = false;
    },
    error: () => {
      this.isRefreshing = false;
    },
  });
}



  public delete_product(item: any) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    this.productService.delete_product(item._id).subscribe({
      next: (res: any) => {
        alert('product remove');
        this.refresh();
      },
      error: (err: any) => {
        alert('failed to delete product');
      },
    });
  }

  public viewDetail(item: any) {
    this.router.navigate(['/view-detail-page', item._id]);
  }

  public logout() {
    if (!confirm('Are you sure you want to logout?')) {
      return;
    }

    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/login-page']);
      },
      error: () => {
        alert('Logout failed');
      },
    });
  }
}
