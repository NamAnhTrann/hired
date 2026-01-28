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

    product_image: new FormControl<File[]>([], {
      nonNullable: true,
      validators: [Validators.required],
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

    this.loading = true;

    const formData = new FormData();

    formData.append('product_title', this.form.get('product_title')!.value!);

    formData.append(
      'product_description',
      this.form.get('product_description')!.value!,
    );

    formData.append(
      'product_price',
      String(this.form.get('product_price')!.value),
    );

    formData.append(
      'product_quantity',
      String(this.form.get('product_quantity')!.value),
    );

    formData.append(
      'product_category',
      this.form.get('product_category')!.value!,
    );

    const images = this.form.get('product_image')!.value;

    for (const file of images) {
      formData.append('product_image', file);
    }

    this.productService.add_product(formData).subscribe({
      next: () => {
        this.loading = false;
        alert('Post Uploaded');
        this.form.reset();
      },
      error: () => {
        this.loading = false;
        alert('Error');
      },
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.form.patchValue({
      product_image: files,
    });

    this.form.get('product_image')?.updateValueAndValidity();
  }
}
