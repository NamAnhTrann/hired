import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product_interface';
const httpOptions = {
  withCredentials: true,
};
@Injectable({
  providedIn: 'root',
})
export class Cart_Service {
  private local_url = "http://localhost:2020/api";
  constructor(private http:HttpClient){}

  add_cart(product_id: string, quantity:number){
    return this.http.post(`${this.local_url}/cart/add`, {product_id, quantity}, httpOptions)
  }

  list_cart(){
    return this.http.get(`${this.local_url}/list/cart`)
  }

  delete_cart(product_id: string){
    return this.http.delete(`${this.local_url}/delete/cart/item/${product_id}`)
  }

  
  
}
