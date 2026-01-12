import {
  AfterContentInit,
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import AOS from 'aos';
import { Trending_Service } from '../services/trending';
import { CommonModule } from '@angular/common';
import { Trending } from '../models/trending_interface';
import { Seller } from '../services/seller';

@Component({
  selector: 'app-homepage',
  imports: [RouterLink, CommonModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Homepage implements AfterViewInit {
  constructor(private trending: Trending_Service, private seller: Seller) {}

  trending_model: Trending[] = [];
  ngOnInit(): void {
    this.load_trending();
  }

  ngAfterViewInit(): void {
    AOS.init({
      duration: 1200,
      once: true,
    });

    setTimeout(() => {
      AOS.refresh();
    }, 200);
  }

load_trending() {
  this.trending.list_trending().subscribe({
    next: (res) => {
      this.trending_model = res.data;   
    },
    error: (err) => {
      console.error('Failed to load trending products', err);
    },
  });
}

start_onboard() {
  this.seller.create_stripe_account().subscribe({
    next: () => {
      this.seller.create_onboard_link().subscribe({
        next: (res) => {
          window.location.href = res.url;
        },
        error: (err) => {
          console.error('Failed to create onboarding link', err);
        },
      });
    },
    error: (err) => {
      console.error('Failed to create Stripe account', err);
    },
  });
}



}

