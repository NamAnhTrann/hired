import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchResponse } from '../models/search_res';
const httpOptions = {
  withCredentials: true,
};
@Injectable({
  providedIn: 'root',
})
export class Product_Service {
  private local_url = 'http://localhost:2020/api';

  constructor(private http: HttpClient) {}

  add_product(product_data: any) {
    return this.http.post(
      `${this.local_url}/add/product`,
      product_data,
      httpOptions,
    );
  }

  list_products() {
    return this.http.get(`${this.local_url}/list/all/product`);
  }

  list_my_products() {
    return this.http.get(`${this.local_url}/products/my-products`);
  }

  list_single_product(product_id: string) {
    return this.http.get(`${this.local_url}/list/single/product/${product_id}`);
  }

  delete_product(product_id: string) {
    return this.http.delete(
      `${this.local_url}/delete/product/${product_id}`,
      httpOptions,
    );
  }

  edit_product(product_id: string, product_data: any) {
    return this.http.put(
      `${this.local_url}/edit/product/${product_id}`,
      product_data,
      httpOptions,
    );
  }

  search(params: any): Observable<SearchResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<SearchResponse>(`${this.local_url}/search/product`, {
      params: httpParams,
    });
  }

  filter_product(params: any) {
    return this.http.get<any>(`${this.local_url}/products/filter`, { params });
  }
}
