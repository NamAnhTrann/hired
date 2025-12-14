import { Component, OnInit } from '@angular/core';
import { Order_Service } from '../services/order';

@Component({
  selector: 'app-pre-checkout-page',
  imports: [],
  templateUrl: './pre-checkout-page.html',
  styleUrl: './pre-checkout-page.css',
})
export class PreCheckoutPage implements OnInit {
  pending_order: any;
  constructor(private orderService: Order_Service) {}

  ngOnInit(): void {
    this.list_pending();
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  list_pending() {
    this.orderService.get_pending_order().subscribe({
      next: (res: any) => {
        this.pending_order = res.data;
      },
    });
  }

  payNow() {
    this.orderService.create_checkout(this.pending_order._id).subscribe({
      next: (res) => {
        window.location.href = res.url;
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  //helper func
  convert_cent_dollar(cents: number): string {
    return (cents / 100).toFixed(2);
  }
}
