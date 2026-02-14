import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Seller_Service } from '../services/seller';
import { Seller } from '../models/seller_interface';
import { Product } from '../models/product_interface';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-seller-store-page',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './seller-store-page.html',
  styleUrl: './seller-store-page.css',
})
export class SellerStorePage {
  seller: Seller | null = null;
  products: Product[] = [];
  loading = true;

  experience = 0;

  // Ownership
  is_owner = false;
  currentUserId: string | null = null;

  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private sellerService: Seller_Service,
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthService,
  ) {}

  // ----------------------------------
  // INIT
  // ----------------------------------
  ngOnInit(): void {
    this.initForm();

    // Subscribe to current user
    this.auth.user$.subscribe((user: any) => {
      this.currentUserId = user?.id || null;
      this.checkOwnership();
    });

    const productId = this.route.snapshot.paramMap.get('productId');

    if (!productId) {
      this.loading = false;
      return;
    }

    this.loadSeller(productId);
  }

  // ----------------------------------
  // FORM
  // ----------------------------------
  private initForm() {
    this.form = this.fb.group({
      store_name: ['', Validators.required],
      store_description: ['', Validators.required],
      store_logo: ['', Validators.required],
      store_banner: [''],
      store_address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        postcode: [''],
        country: [''],
      }),
    });
  }

  // ----------------------------------
  // OWNERSHIP CHECK (KEY FIX)
  // ----------------------------------
  private checkOwnership() {
    if (!this.seller || !this.currentUserId) {
      this.is_owner = false;
      return;
    }

    this.is_owner = String(this.currentUserId) === String(this.seller.user_id);
  }

  // ----------------------------------
  // LOAD SELLER
  // ----------------------------------
  private loadSeller(productId: string) {
    this.sellerService.getSellerFromProduct(productId).subscribe({
      next: (res) => {
        if (!res?.seller) {
          this.seller = null;
        } else {
          this.seller = res.seller;

          // Fill form
          this.form.patchValue(this.seller);

          // Recheck owner AFTER seller loads
          this.checkOwnership();

          // Experience
          this.calculateExperience();

          // Products
          this.loadSellerProducts(this.seller.user_id);
        }

        this.loading = false;
      },

      error: () => {
        this.seller = null;
        this.loading = false;
      },
    });
  }

  // ----------------------------------
  // EXPERIENCE
  // ----------------------------------
  private calculateExperience() {
    if (!this.seller?.createdAt) return;

    this.experience =
      new Date().getFullYear() - new Date(this.seller.createdAt).getFullYear();
  }

  // ----------------------------------
  // PRODUCTS
  // ----------------------------------
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

  // ----------------------------------
  // SAVE EDIT
  // ----------------------------------
  // saveChanges() {
  //   if (this.form.invalid) return;

  //   const payload = this.form.value;

  //   this.sellerService.update_store_profile(payload).subscribe({
  //     next: (res: any) => {
  //       console.log('Store updated', res);

  //       // Update local state
  //       this.seller = res.data;
  //       this.form.patchValue(this.seller!);

  //       // Recheck ownership
  //       this.checkOwnership();
  //     },

  //     error: (err) => {
  //       console.error(err);
  //     },
  //   });
  // }

  // ----------------------------------
  // NAV
  // ----------------------------------
  to_seller_media(): void {
    if (!this.seller) return;

    this.router.navigate(['/seller-profile-page', this.seller._id]);
  }

  viewDetail(item: Product) {
    this.router.navigate(['/view-detail-page', item._id]);
  }
}
