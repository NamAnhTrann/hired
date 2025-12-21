import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product_Service } from '../services/product';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { Dashboard_Service } from '../services/dashboard';
import { SellerStats } from '../models/seller_stats';

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
  current_user: any;
  seller_stats: SellerStats | null = null;

  constructor(
    private productService: Product_Service,
    private router: Router,
    private auth: AuthService,
    private dashboardService: Dashboard_Service,
  ) {}
  public ngOnInit() {
    this.auth.load_user().subscribe({
      next: (res: any) => {
        this.current_user = res.user;
      },
      error: () => {
        this.current_user = null;
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

    this.refresh();
  }

  public refresh() {
    this.isRefreshing = true;

    this.productService.list_products().subscribe({
      next: (res: any) => {
        this.products = res.data;

        //descending sort
        this.top_products = [...this.products]
          .sort((a, b) => b.product_view_count - a.product_view_count)
          .slice(0, 5);

        this.isRefreshing = false;
      },
      error: (err) => {
        console.error(err);
        this.isRefreshing = false;
      },
    });
  }

  public delete_product(item:any){
    if(!confirm('Are you sure you want to delete this product?')){
      return;
    }
    this.productService.delete_product(item._id).subscribe({
      next:(res:any)=>{
        alert("product remove");
        this.refresh();
      },
      error:(err:any)=>{
        alert("failed to delete product");
      }
    })
  }

  public viewDetail(item: any) {
    this.router.navigate(['/view-detail-page', item._id]);
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
}
