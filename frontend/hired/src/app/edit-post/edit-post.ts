import { Component, OnInit } from '@angular/core';
import { Product_Service } from '../services/product';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.css',
})
export class EditPost implements OnInit {
  product_id!: string;
  product: any = {};

  constructor(
    private productService: Product_Service,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.product_id = this.route.snapshot.paramMap.get('id')!;
    this.productService.list_single_product(this.product_id).subscribe({
      next: (res: any) => {
        this.product = res.data;
      }
    });
  }

  edit_product(product_data: any) {
    if (confirm('Are you sure you want to edit this product?')) {
      this.productService.edit_product(this.product_id, product_data).subscribe({
        next: (res: any) => {
          console.log('Product edited', res.data);
          alert('Product edited successfully');
          this.router.navigate(['/dashboard-page']);
      },
      error: (err: any) => {
        alert('Failed to edit product');
        console.error(err);
      }
    });
  }
  }
}
