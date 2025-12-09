import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Product_Service } from '../services/product';
import { Comment } from '../services/comment';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { Like_Service } from '../services/like';
import { Optimistic } from '../helper/optimistic';

@Component({
  selector: 'app-marketplace-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './marketplace-page.html',
  styleUrl: './marketplace-page.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MarketplacePage {
  products: any[] = [];

  // Comment states (for future UI usage)
  comments: any = {};
  newComment: any = {};
  replyBox: any = {};
  replyText: any = {};
  current_user: any = null;
  activeProduct: string | null = null;
  isDeleting: Record<string, boolean> = {};

  constructor(
    private auth: AuthService,
    private product_service: Product_Service,
    private commentService: Comment,
    private likeService: Like_Service
  ) {}

  public ngOnInit(): void {
    this.auth.user$.subscribe((u) => (this.current_user = u));
    this.loadProducts();
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
        this.products = [...res.data];
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

    const product = this.products.find((p) => p._id === product_id);
    this.newComment[product_id] = '';

    this.commentService.add_comment({ product_id, text }).subscribe({
      next: (res: any) => {
        const saved = res.data;

        // Immediately append only the new comment
        if (!this.comments[product_id]) this.comments[product_id] = [];
        this.comments[product_id].unshift(saved);
        this.comments[product_id] = [...this.comments[product_id]];

        // Update count
        if (product) {
          product.comment_count++;
          this.products = [...this.products];
        }
      },

      error: (err) => {
        console.error(err);
        this.newComment[product_id] = text; // restore
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

    const before = [...this.comments[product_id]];

    Optimistic.apply(
      () => {
        const parent = this.comments[product_id].find(
          (c: any) => c._id === parent_id
        );
        parent.replies.push({
          _id: 'temp_' + crypto.randomUUID(),
          text,
          user: {
            _id: this.current_user?._id,
            user_username: this.current_user?.user_username,
          },
          like_count: 0,
        });

        this.replyText[parent_id] = '';
      },

      () =>
        this.commentService.add_reply({
          product_id,
          parent_comment: parent_id,
          text,
        }),

      () => {
        this.comments[product_id] = before;
      }
    );
  }

  deleteComment(id: string, product_id: string) {
    this.isDeleting[id] = true;

    this.commentService.delete_comment(id).subscribe({
      next: () => {
        this.isDeleting[id] = false;
        this.loadComments(product_id);
      },
      error: () => {
        this.isDeleting[id] = false;
      },
    });
  }

  toggleLikeProduct(product: any) {
    if (!this.current_user) return alert('Please login first');

    const before = product.liked_by_user;
    const beforeCount = product.like_count;

    Optimistic.apply(
      // UI update instantly
      () => {
        product.liked_by_user = !before;
        product.like_count += before ? -1 : 1;
      },

      // backend call
      () =>
        before
          ? this.likeService.unlike(product._id, 'product')
          : this.likeService.like_product({ product_id: product._id }),

      // rollback safely
      () => {
        product.liked_by_user = before;
        product.like_count = beforeCount;
      }
    );
  }

  toggleLikeComment(comment: any) {
    if (!this.current_user) return alert('Please login first');

    const before = comment.liked_by_user;
    const beforeCount = comment.like_count;

    Optimistic.apply(
      () => {
        comment.liked_by_user = !before;
        comment.like_count += before ? -1 : 1;
      },

      () =>
        before
          ? this.likeService.unlike(comment._id, 'comment')
          : this.likeService.like_comment({ comment_id: comment._id }),

      () => {
        comment.liked_by_user = before;
        comment.like_count = beforeCount;
      }
    );
  }
}
