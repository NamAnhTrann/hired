import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Seller_Service } from '../services/seller';
import { Seller } from '../models/seller_interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product } from '../models/product_interface';
import { Product_Service } from '../services/product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-store-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './seller-store-page.html',
  styleUrl: './seller-store-page.css',
})
export class SellerStorePage {
  product: Product | null = null;
  seller: Seller | null = null;
  loading = true;
  products: Product[] = [];
  experience = 0;

  constructor(
    private route: ActivatedRoute,
    private sellerService: Seller_Service,
    private router: Router,
    private productService: Product_Service,
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');

    if (!productId) {
      this.loading = false;
      return;
    }

    //move this backend later
    if (this.seller?.createdAt) {
      this.experience =
        new Date().getFullYear() -
        new Date(this.seller.createdAt).getFullYear();
    }

    this.loadSeller(productId);
  }

  private loadSellerProducts(userId: string) {
    this.sellerService.listBySeller(userId).subscribe({
      next: (res: any) => {
        this.products = res.data || [];
      },
      error: () => {
        this.products = [];
      },
    });
  }

  private loadSeller(productId: string) {
    this.sellerService.getSellerFromProduct(productId).subscribe({
      next: (res) => {
        if (!res || !res.seller) {
          this.seller = null;
        } else {
          this.seller = res.seller;
          this.loadSellerProducts(this.seller.user_id);
        }
        this.loading = false;
      },
      error: (err) => {
        this.seller = null;
        this.loading = false;
      },
    });
  }

  to_seller_media(): void {
    this.router.navigate(['/seller-profile-page', this.seller!._id]);
  }

  viewDetail(item: any) {
    this.router.navigate(['/view-detail-page', item._id]);
  }
}
