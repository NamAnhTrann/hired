import { Component, DestroyRef, inject, Input } from '@angular/core';
import { Product } from '../models/product_interface';
import { Product_Service } from '../services/product';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Cart_Service } from '../services/cart';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Comment } from '../services/comment';
import { Like_Service } from '../services/like';
import { AuthService } from '../services/auth';
import { Optimistic } from '../helper/optimistic';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Seller_Service } from '../services/seller';
import { Seller } from '../models/seller_interface';

@Component({
  selector: 'app-view-detail-page',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './view-detail-page.html',
  styleUrl: './view-detail-page.css',
})
export class ViewDetailPage {
  private readonly destroyRef = inject(DestroyRef);
  @Input() productId!: string;
  product: Product | null = null;
  loading = false;
  quantity = 1;
  message = '';
  // social UI state
  comments: Record<string, any[]> = {};
  newComment: Record<string, string> = {};
  replyBox: Record<string, Record<string, boolean>> = {};
  replyText: Record<string, string> = {};
  activeProduct: string | null = null;
  current_user: any = null;

  showCommentsModal = false;
  activeCommentsProductId: string | null = null;

  selectedImage: string | null = null; // main image
  subImages: string[] = []; // exactly 5 max
  selectedIC: Record<string, number> = {};
  avgIC: Record<string, number> = {};
  icCount: Record<string, number> = {};
  hoverIC: Record<string, number> = {};
  seller: Seller | null = null;

  constructor(
    private productService: Product_Service,
    private cartService: Cart_Service,
    private route: ActivatedRoute,
    private commentService: Comment,
    private likeService: Like_Service,
    private auth: AuthService,
    private sellerService: Seller_Service,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => (this.current_user = u));

    this.list_product();
  }

  // MAIN <-> SUB swap (keeps 1 main + 5 sub images)
  swapImage(clickedImg: string): void {
    const index = this.subImages.indexOf(clickedImg);
    if (index === -1) return;

    const oldMain = this.selectedImage;
    if (!oldMain) return;

    this.selectedImage = clickedImg;
    this.subImages[index] = oldMain;
  }

  // LOAD PRODUCT
  list_product(): void {
    const product_id = this.route.snapshot.paramMap.get('id');
    if (!product_id) return;

    this.productService
      .list_single_product(product_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const product: Product = res.data;

          this.product = product;
          const images: string[] = Array.isArray(product.product_image)
            ? product.product_image
            : [];

          if (images.length > 0) {
            this.selectedImage = images[0];
            this.subImages = images.slice(1, 6);
          } else {
            this.selectedImage = null;
            this.subImages = [];
          }

          this.loadComments(product._id);
          this.loadIC(product._id);
        },
        error: (err: any) => console.error(err),
      });
  }

  goToSellerStore(): void {
    this.router.navigate(['/seller-store-page', this.product!._id]);
  }

  // ADD TO CART
  add_cart(product_id: string, quantity: number): void {
    this.cartService
      .add_cart(product_id, quantity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => alert('Product added to cart'),
        error: (err: any) => alert(err),
      });
  }

  // QUANTITY VALIDATION
  setQuantity(event: any): void {
    let v = Number(event.target.value);
    if (!v || v < 1) v = 1;
    this.quantity = Math.floor(v);
  }

  toggleComments(product_id: string): void {
    if (this.activeProduct === product_id) {
      this.activeProduct = null;
      return;
    }
    this.activeProduct = product_id;
    this.loadComments(product_id);
  }

  loadComments(product_id: string): void {
    this.commentService
      .list_comments(product_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.comments[product_id] = res.data ?? [];
        },
        error: (err: any) => console.error(err),
      });
  }

  postComment(product_id: string): void {
    const text = this.newComment[product_id];
    if (!text?.trim()) return;

    this.newComment[product_id] = '';

    this.commentService
      .add_comment({ product_id, text })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.product) this.product.comment_count++;
          this.loadComments(product_id);
        },
        error: () => alert('Failed to post comment'),
      });
  }

  toggleReply(product_id: string, comment_id: string): void {
    if (!this.replyBox[product_id]) this.replyBox[product_id] = {};
    this.replyBox[product_id][comment_id] =
      !this.replyBox[product_id][comment_id];
  }

  postReply(product_id: string, parent_id: string): void {
    const text = this.replyText[parent_id];
    if (!text?.trim()) return;

    this.replyText[parent_id] = '';

    this.commentService
      .add_reply({ product_id, parent_comment: parent_id, text })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.product) this.product.comment_count++;
          this.loadComments(product_id);
        },
        error: (err: any) => console.error(err),
      });
  }

  toggleLikeProduct(product: any): void {
    if (!this.current_user) {
      alert('Please login first');
      return;
    }

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

  deleteComment(comment: any, product: any, isTopLevel: boolean): void {
    this.commentService
      .delete_comment(comment._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (isTopLevel) {
            const replyCount = Array.isArray(comment.replies)
              ? comment.replies.length
              : 0;
            product.comment_count -= 1 + replyCount;
            if (product.comment_count < 0) product.comment_count = 0;
          }
          this.loadComments(product._id);
        },
        error: (err: any) => console.error(err),
      });
  }

  openCommentsModal(productId: string): void {
    this.activeCommentsProductId = productId;
    this.showCommentsModal = true;
  }

  closeCommentsModal(): void {
    this.showCommentsModal = false;
    this.activeCommentsProductId = null;
  }

  loadIC(productId: string) {
    this.productService.getIC(productId).subscribe({
      next: (res) => {
        this.selectedIC[productId] = res.userIC ?? 0;
        this.avgIC[productId] = res.avgIC;
        this.icCount[productId] = res.count;
      },

      error: (err) => {
        console.error('IC load failed', err);
      },
    });
  }

  submit_ic(productId: string) {
    if (!productId) return;

    const ic = this.selectedIC[productId];

    if (ic == null || ic < 0 || ic > 10) return;

    this.loading = true;

    this.productService.rateIC(productId, ic).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res.message || 'rating saved';
      },
      error: (err: any) => {
        this.loading = false;
        this.message = err?.error?.message || 'failed to submit rate';
      },
    });
  }
}
