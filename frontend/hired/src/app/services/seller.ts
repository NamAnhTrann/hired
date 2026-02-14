import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Seller } from '../models/seller_interface';
const httpOptions = {
  withCredentials: true,
};
@Injectable({
  providedIn: 'root',
})
export class Seller_Service {
  private local_url = 'http://localhost:2020/api';

  constructor(private http: HttpClient) {}

  //create seller profile
  public create_profile(data: any) {
    return this.http.post(
      `${this.local_url}/create/seller/profile`,
      data,
      httpOptions
    );
  }

public get_seller() {
  return this.http.get<any>(
    `${this.local_url}/get/seller/profile`,
    httpOptions
  );
}

  public create_stripe_account() {
    return this.http.post(`${this.local_url}/create-account`, {}, httpOptions);
  }

  public create_onboard_link() {
    return this.http.post<{ url: string }>(
      `${this.local_url}/onboarding-link`,
      {},
      httpOptions
    );
  }

  public checkStripeStatus() {
    return this.http.get<{
      onboarded: boolean;
      charges_enabled: boolean;
      payouts_enabled: boolean;
    }>(`${this.local_url}/status`, { withCredentials: true });
  }

public getSellerFromProduct(productId: string) {
  return this.http.get<{
    success: boolean;
    seller: Seller;
  }>(
    `${this.local_url}/get/seller/from_product/${productId}`
  );
}

public listBySeller(userId: string) {
  return this.http.get<any>(
    `${this.local_url}/by-seller/${userId}`
  );
}

public update_store_profile(data: Partial<Seller>) {
  return this.http.patch(
    `${this.local_url}/seller/store/profile`,
    data,
    httpOptions
  );
}




}
