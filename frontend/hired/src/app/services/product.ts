import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const httpOptions = {
  withCredentials: true,
};
@Injectable({
  providedIn: 'root',
})
export class Product_Service {
  private local_url = 'http://localhost:2020/api';

  constructor(private http:HttpClient){}

  add_product(product_data:any){
    return this.http.post(`${this.local_url}/add/product`, product_data, httpOptions)
  }

  list_products(){
    return this.http.get(`${this.local_url}/list/all/product`)
  }

  list_single_product(product_id:string){
    return this.http.get(`${this.local_url}/list/single/product/${product_id}`)
  }
  
}
