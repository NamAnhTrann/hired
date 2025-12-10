import { Component } from '@angular/core';
import { Product } from '../models/product_interface';
import { Product_Service } from '../services/product';
import { ActivatedRoute } from '@angular/router';
import { Cart_Service } from '../services/cart';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Comment } from '../services/comment';
import { Like_Service } from '../services/like';
import { AuthService } from '../services/auth';
import { Optimistic } from '../helper/optimistic';

@Component({
  selector: 'app-view-detail-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './view-detail-page.html',
  styleUrl: './view-detail-page.css',
})
export class ViewDetailPage {
  product?: Product;
  quantity = 1;

  // social UI state
  comments: any = {};
  newComment: any = {};
  replyBox: any = {};
  replyText: any = {};
  activeProduct: string | null = null;
  current_user: any = null;

  constructor(
    private productService: Product_Service,
    private cartService: Cart_Service,
    private route: ActivatedRoute,
    private commentService: Comment,
    private likeService: Like_Service,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((u) => (this.current_user = u));
    this.list_product();
  }

  // LOAD PRODUCT
  list_product() {
    const product_id = this.route.snapshot.paramMap.get('id');
    if (!product_id) return;

    this.productService.list_single_product(product_id).subscribe({
      next: (res: any) => {
        this.product = res.data;
      },
      error: (err: any) => console.error(err),
    });
  }

  // ADD TO CART
  add_cart(product_id: string, quantity: number) {
    this.cartService.add_cart(product_id, quantity).subscribe({
      next: () => alert('Product added to cart'),
      error: (err: any) => alert(err),
    });
  }

  // QUANTITY VALIDATION
  setQuantity(event: any) {
    let v = Number(event.target.value);
    if (!v || v < 1) v = 1;
    this.quantity = Math.floor(v);
  }

  // SOCIAL FEATURES ---------------------------------------------------

  toggleComments(product_id: string) {
    if (this.activeProduct === product_id) {
      this.activeProduct = null;
      return;
    }
    this.activeProduct = product_id;
    this.loadComments(product_id);
  }

  loadComments(product_id: string) {
    this.commentService.list_comments(product_id).subscribe({
      next: (res: any) => {
        this.comments[product_id] = res.data;
      },
    });
  }

  postComment(product_id: string) {
    const text = this.newComment[product_id];
    if (!text?.trim()) return;

    this.newComment[product_id] = '';

    this.commentService.add_comment({ product_id, text }).subscribe({
      next: () => {
        if (this.product) this.product.comment_count++;
        this.loadComments(product_id);
      },
      error: () => alert('Failed to post comment'),
    });
  }

  toggleReply(product_id: string, comment_id: string) {
    if (!this.replyBox[product_id]) this.replyBox[product_id] = {};
    this.replyBox[product_id][comment_id] =
      !this.replyBox[product_id][comment_id];
  }

  postReply(product_id: string, parent_id: string) {
    const text = this.replyText[parent_id];
    if (!text?.trim()) return;

    this.replyText[parent_id] = '';

    this.commentService
      .add_reply({ product_id, parent_comment: parent_id, text })
      .subscribe({
        next: () => {
          if (this.product) this.product.comment_count++;

          this.loadComments(product_id);
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
      }
    );
  }

  deleteComment(comment: any, product: any, isTopLevel: boolean) {
    this.commentService.delete_comment(comment._id).subscribe({
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
    });
  }
}
