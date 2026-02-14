import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

const httpOptions = {
  withCredentials: true,
};

@Injectable({
  providedIn: 'root',
})
export class Cart_Service {
  private local_url = 'http://54.252.159.167:2020/api';

  // Cart count stream
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  add_cart(product_id: string, quantity: number) {
    return this.http
      .post<any>(
        `${this.local_url}/cart/add`,
        { product_id, quantity },
        httpOptions,
      )
      .pipe(
        tap(() => {
          this.cartCountSubject.next(this.cartCountSubject.value + quantity);
        }),
      );
  }

  list_cart() {
    return this.http.get<any>(`${this.local_url}/list/cart`, httpOptions).pipe(
      tap((res) => {
        const items = res?.data?.item;

        const count = items.reduce(
          (total: number, item: any) => total + item.cart_quantity,
          0,
        );

        this.cartCountSubject.next(count);
      }),
    );
  }

  delete_cart(product_id: string) {
    return this.http
      .delete<any>(
        `${this.local_url}/delete/cart/item/${product_id}`,
        httpOptions,
      )
      .pipe(
        tap(() => {
          this.cartCountSubject.next(
            Math.max(0, this.cartCountSubject.value - 1),
          );
        }),
      );
  }

  // Optional helper
  resetCart() {
    this.cartCountSubject.next(0);
  }
}
