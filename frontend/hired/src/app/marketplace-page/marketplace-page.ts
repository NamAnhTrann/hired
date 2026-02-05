import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Product_Service } from '../services/product';
import { Comment } from '../services/comment';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { Like_Service } from '../services/like';
import { Optimistic } from '../helper/optimistic';
import { Cart_Service } from '../services/cart';
import { Cart } from '../models/cart_interface';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-marketplace-page',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './marketplace-page.html',
  styleUrl: './marketplace-page.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MarketplacePage {
  products: any[] = [];
  quantity = 1;
  cart: Cart | null = null;

  // Comment states (for future UI usage)
  comments: any = {};
  newComment: any = {};
  replyBox: any = {};
  replyText: any = {};
  current_user: any = null;
  activeProduct: string | null = null;
  isDeleting: Record<string, boolean> = {};

  //searches
  page = 0;
  loading = false;

  qCtrl = new FormControl('', { nonNullable: true });
  categoryCtrl = new FormControl('', { nonNullable: true });
  minPriceCtrl = new FormControl<number | null>(null);
  maxPriceCtrl = new FormControl<number | null>(null);
  inStockCtrl = new FormControl(false, { nonNullable: true });

  constructor(
    private auth: AuthService,
    private product_service: Product_Service,
    private commentService: Comment,
    private likeService: Like_Service,
    private cartService: Cart_Service,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.auth.user$.subscribe((u) => (this.current_user = u));
    this.loadProducts();
    this.initSearch();
  }
  private initSearch(): void {
    this.qCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q: string | null) => {
          this.loading = true;
          this.page = 0;

          const query = q?.trim();

          return this.product_service.search({
            q: query || undefined,
            page: this.page,
          });
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.products = res.results;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  toggleComments(product_id: string) {
    if (this.activeProduct === product_id) {
      this.activeProduct = null;
      return;
    }

    this.activeProduct = product_id;
    this.loadComments(product_id);
  }

  private loadProducts() {
    this.product_service.list_products().subscribe({
      next: (res: any) => {
        this.products = res.data;
      },
      error: (err) => {
        console.error('Failed to load products', err);
      },
    });
  }

  loadComments(product_id: string) {
    this.commentService.list_comments(product_id).subscribe({
      next: (res: any) => {
        this.comments[product_id] = [...res.data];
      },
      error: (err) => console.error(err),
    });
  }

  postComment(product_id: string) {
    const text = this.newComment[product_id];
    if (!text?.trim()) return;

    this.newComment[product_id] = '';

    this.commentService.add_comment({ product_id, text }).subscribe({
      next: () => {
        const product = this.products.find((p) => p._id === product_id);
        if (product) product.comment_count++;

        this.loadComments(product_id);
      },

      error: () => {
        alert('Failed to post comment');
      },
    });
  }

  toggleReply(product_id: string, comment_id: string) {
    if (!this.replyBox[product_id]) {
      this.replyBox[product_id] = {};
    }

    const isOpen = this.replyBox[product_id][comment_id] === true;

    // Toggle
    this.replyBox[product_id][comment_id] = !isOpen;
  }

  postReply(product_id: string, parent_id: string) {
    const text = this.replyText[parent_id];
    if (!text?.trim()) return;

    this.replyText[parent_id] = '';

    this.commentService
      .add_reply({
        product_id,
        parent_comment: parent_id,
        text,
      })
      .subscribe({
        next: () => {
          const product = this.products.find((p) => p._id === product_id);
          if (product) product.comment_count++;

          this.loadComments(product_id);
        },
      });
  }

  deleteComment(comment: any, product: any, isTopLevel: boolean) {
    this.commentService.delete_comment(comment._id).subscribe({
      next: () => {
        if (isTopLevel) {
          // number to deduct = 1 parent + number of replies
          const replyCount = Array.isArray(comment.replies)
            ? comment.replies.length
            : 0;

          const totalToRemove = 1 + replyCount;

          product.comment_count -= totalToRemove;

          if (product.comment_count < 0) {
            product.comment_count = 0;
          }
        }

        this.loadComments(product._id);
      },
    });
  }

  toggleLikeProduct(product: any) {
    if (!this.current_user) return alert('Please login first');

    const before = product.liked_by_user;
    const beforeCount = product.like_count;

    Optimistic.apply(
      () => {
        product.liked_by_user = !before;
        product.like_count += before ? -1 : 1;
      },

      () =>
        before
          ? this.likeService.unlike(product._id, 'product')
          : this.likeService.like_product({ product_id: product._id }),

      () => {
        product.liked_by_user = before;
        product.like_count = beforeCount;
      },
    );
  }

  buyNow(product_id: string) {
    this.cartService.add_cart(product_id, this.quantity).subscribe({
      next: (res: any) => {
        alert('Added to Cart');
        console.log(res);
      },
    });
  }

  viewDetail(item: any) {
    this.router.navigate(['/view-detail-page', item._id]);
  }
}
