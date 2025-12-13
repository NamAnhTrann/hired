import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Cart } from '../models/cart_interface';
import { Cart_Service } from '../services/cart';
import { Router, RouterLink } from '@angular/router';
import { Order_Service } from '../services/order';

@Component({
  selector: 'app-cart-page',
  imports: [CommonModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage implements OnInit {
  cart: Cart | null = null;
  cartItems: any[] = [];

  
   constructor(private cartService: Cart_Service, private orderService: Order_Service, private router:Router){}

   ngOnInit(): void {
    this.list_cart();
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
   }

   list_cart(){
    this.cartService.list_cart().subscribe((res:any)=>{
      this.cart= res.data;
      this.cartItems = res.data.item;
    })
   }

   delete_cart(product_id: string){
      if (!confirm('Are you sure you want to remove this item from your cart?')) return;

    this.cartService.delete_cart(product_id).subscribe((res:any)=>{
      this.cart = res.data;
      this.cartItems = res.data.item;
    })
   }

   proceed_to_checkout() {
    this.orderService.create_order().subscribe({
      next: (data:any)=>{
        console.log(data)
        this.router.navigate(["/pre-checkout-page"])
      }
    })
   }


  

}
