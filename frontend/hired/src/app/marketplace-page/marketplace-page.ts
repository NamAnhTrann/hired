import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Product_Service } from '../services/product';
import { Comment } from '../services/comment';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { Like_Service } from '../services/like';

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
        this.comments[product_id] = res.data;
      },
      error: (err) => console.error(err),
    });
  }

  postComment(product_id: string) {
    const text = this.newComment[product_id];

    if (!text || !text.trim()) return;

    this.commentService
      .add_comment({
        product_id: product_id,
        text: text,
      })
      .subscribe({
        next: () => {
          this.newComment[product_id] = '';
          this.loadComments(product_id);
        },
        error: (err) => console.error(err),
      });
  }

  toggleReply(product_id: string, comment_id: string) {
    if (!this.replyBox[product_id]) this.replyBox[product_id] = {};
    this.replyBox[product_id][comment_id] =
      !this.replyBox[product_id][comment_id];
  }

  postReply(product_id: string, parent_comment_id: string) {
    const text = this.replyText[parent_comment_id];

    if (!text || !text.trim()) return;

    this.commentService
      .add_reply({
        product_id,
        parent_comment: parent_comment_id,
        text: text,
      })
      .subscribe({
        next: () => {
          this.replyText[parent_comment_id] = '';
          this.loadComments(product_id);
        },
        error: (err) => console.error(err),
      });
  }

  deleteComment(comment_id: string, product_id: string) {
    this.commentService.delete_comment(comment_id).subscribe({
      next: () => {
        this.loadComments(product_id);
      },
      error: (err) => console.error(err),
    });
  }

  toggleLikeProduct(product: any) {
  if (!this.current_user) {
    alert("Please login first");
    return;
  }

  // If already liked → UNLIKE
  if (product.liked_by_user) {
    this.likeService.unlike(product._id, "product").subscribe({
      next: () => {
        product.liked_by_user = false;
        product.like_count--;
      },
      error: (err) => console.error(err),
    });
  }

  // If not liked → LIKE
  else {
    this.likeService.like_product({ product_id: product._id }).subscribe({
      next: () => {
        product.liked_by_user = true;
        product.like_count++;
      },
      error: (err) => console.error(err),
    });
  }
}

toggleLikeComment(comment: any) {
  if (!this.current_user) {
    alert("Please login first");
    return;
  }

  // Already liked → UNLIKE
  if (comment.liked_by_user) {
    this.likeService.unlike(comment._id, "comment").subscribe({
      next: () => {
        comment.liked_by_user = false;
        comment.like_count--;
      },
      error: (err) => console.error(err),
    });
  }

  // Not liked → LIKE
  else {
    this.likeService.like_comment({ comment_id: comment._id }).subscribe({
      next: () => {
        comment.liked_by_user = true;
        comment.like_count++;
      },
      error: (err) => console.error(err),
    });
  }
}


}
