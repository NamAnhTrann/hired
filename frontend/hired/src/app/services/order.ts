import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/order_interface';
const httpOptions = {
  withCredentials: true,
};
@Injectable({
  providedIn: 'root',
})
export class Order_Service {

  private local_url = 'http://localhost:2020/api';

  constructor(private http:HttpClient){}

  create_order() { 
    return this.http.post(`${this.local_url}/order/create`, {}, httpOptions)
  }

  get_pending_order(): Observable<{ data: Order }> {
    return this.http.get<{ data: Order }>(
      `${this.local_url}/order/get/pending`,
      httpOptions
    );
  }

  create_checkout(order_id: string) { 
    return this.http.post<any>(`${this.local_url}order/checkout`, {order_id:order_id}, httpOptions)
  }
  

}
