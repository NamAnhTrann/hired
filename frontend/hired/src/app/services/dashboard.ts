import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SellerStats } from '../models/seller_stats';
const httpOptions = {
  withCredentials: true,
};
@Injectable({
  providedIn: 'root',
})
export class Dashboard_Service {
  private local_url = 'http://54.252.159.167:2020/api';

  constructor(private http:HttpClient){
  }

  get_seller_stats(){
    return this.http.get<SellerStats>(`${this.local_url}/get/seller/stats`, httpOptions);
  }
  
}
