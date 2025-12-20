import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Product_Service } from '../services/product';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-product',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  loading = false;

  constructor(private productService: Product_Service) {}

  form = new FormGroup({
    product_title: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(120),
    ]),

    product_description: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(3000),
    ]),

    product_price: new FormControl(0, [Validators.required, Validators.min(1)]),

    product_quantity: new FormControl(0, [
      Validators.required,
      Validators.min(1),
    ]),

    product_image: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [Validators.minLength(1)],
    }),

    product_category: new FormControl<
      'clothing' | 'digital' | 'electronic' | 'food' | 'other'
    >('other', [Validators.required]),
  });

  add_product() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      product_title: this.form.value.product_title,
      product_description: this.form.value.product_description,
      product_price: this.form.value.product_price,
      product_quantity: this.form.value.product_quantity,
      product_image: this.form.value.product_image,
      product_category: this.form.value.product_category,
    };

    this.productService.add_product(payload).subscribe({
      next: () => {
        this.loading = false;
        alert('Post Uploaded');
        this.form.reset;
      },
      error: (err: any) => {
        this.loading = false;
        alert('Error');
      },
    });
  }
}
