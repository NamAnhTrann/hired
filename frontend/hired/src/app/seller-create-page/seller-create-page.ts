import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seller } from '../models/seller_interface';
import { Seller_Service } from '../services/seller';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-seller-create-page',
  templateUrl: './seller-create-page.html',
  styleUrl: './seller-create-page.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
})
export class SellerCreatePage implements AfterViewInit {
  @ViewChild('swiper', { static: true })
  swiperRef!: ElementRef<any>;
  loading = false;
  error_message = '';
  success_message = '';
  submitAttempted = false;
  constructor(private sellerService: Seller_Service) {}

  form = new FormGroup({
    store_name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(120),
    ]),

    store_description: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(3000),
    ]),

    street: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    postcode: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(10),
    ]),
    country: new FormControl('', [Validators.required]),
  });

  ngAfterViewInit() {}

  goNext() {
    this.swiperRef.nativeElement.swiper.slideNext();
  }

  goPrev() {
    this.swiperRef.nativeElement.swiper.slidePrev();
  }

  public create_profile() {
    this.submitAttempted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error_message = '';

    const payload = {
      user_id: '',

      store_name: this.form.value.store_name!,
      store_description: this.form.value.store_description!,

      store_address: {
        street: this.form.value.street!,
        city: this.form.value.city!,
        state: this.form.value.state!,
        postcode: this.form.value.postcode!,
        country: this.form.value.country!,
      },

      stripe_account_id: null,
      stripe_onboarded: false,
      stripe_charges_enabled: false,
      stripe_payouts_enabled: false,

      seller_status: 'pending',
      seller_badges: [],
    };

    this.sellerService.create_profile(payload).subscribe({
      next: () => {
        this.sellerService.create_stripe_account().subscribe({
          next: () => {
            this.sellerService.create_onboard_link().subscribe({
              next: (res) => {
                window.location.href = res.url;
              },
              error: (err) => {
                this.loading = false;
                this.error_message = 'Failed to create Stripe onboarding link';
                console.error(err);
              },
            });
          },
          error: (err) => {
            this.loading = false;
            this.error_message = 'Failed to create Stripe account';
            console.error(err);
          },
        });
      },
      error: (err) => {
        this.loading = false;
        this.error_message = 'Failed to create seller profile';
        console.error(err);
      },
    });
  }
}
