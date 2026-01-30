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
  imgPreviews: string[] = [];

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
      validators: [Validators.required],
    }),

    product_category: new FormControl<
      'clothing' | 'digital' | 'electronic' | 'food' | 'other'
    >('other', [Validators.required]),

    product_features: new FormControl<string[]>([]),
    shipping_info: new FormControl<string[]>([]),
  product_policies: new FormControl<string[]>([]),
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
    formData.append(
      'product_features',
      JSON.stringify(this.form.get('product_features')!.value ?? []),
    );

    formData.append(
      'shipping_info',
      JSON.stringify(this.form.get('shipping_info')!.value ?? []),
    );

    formData.append(
      'product_policies',
      JSON.stringify(this.form.get('product_policies')!.value ?? []),
    );

    const images = this.form.controls.product_image.value;

    if (!images || images.length === 0) {
      this.loading = false;
      alert('Please add at least one image');
      return;
    }

    for (const file of images) {
      formData.append('product_image', file);
    }

    this.productService.add_product(formData).subscribe({
      next: () => {
        this.loading = false;
        alert('Post Uploaded');

        this.form.reset({
          product_price: 0,
          product_quantity: 0,
          product_category: 'other',
          product_image: [],
        });

        this.imgPreviews = [];
      },

      error: () => {
        this.loading = false;
        alert('Error');
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newFiles = Array.from(input.files);

    // existing previews
    const existing = this.imgPreviews;

    // convert new files to previews
    const readers = newFiles.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers).then((newPreviews) => {
      if (existing.length === 0) {
        // first image becomes MAIN
        this.imgPreviews = [...newPreviews].slice(0, 6);
      } else {
        // keep main image at index 0
        const main = existing[0];
        const subs = existing.slice(1);

        this.imgPreviews = [main, ...subs, ...newPreviews].slice(0, 6);
      }
    });

    // also update form control
    const existingFiles = this.form.controls.product_image.value ?? [];
    const combinedFiles = [...existingFiles, ...newFiles].slice(0, 6);

    this.form.controls.product_image.setValue(combinedFiles);
    this.form.controls.product_image.markAsTouched();

    input.value = '';
  }

  addItem(controlName: 'product_features' | 'shipping_info' | 'product_policies') {
  const control = this.form.controls[controlName];
  const current = control.value ?? [];
  control.setValue([...current, '']);
}

updateItem(
  controlName: 'product_features' | 'shipping_info' | 'product_policies',
  index: number,
  value: string
) {
  const control = this.form.controls[controlName];
  const current = [...(control.value ?? [])];
  current[index] = value;
  control.setValue(current);
}

removeItem(
  controlName: 'product_features' | 'shipping_info' | 'product_policies',
  index: number
) {
  const control = this.form.controls[controlName];
  const current = [...(control.value ?? [])];
  current.splice(index, 1);
  control.setValue(current);
}

}
