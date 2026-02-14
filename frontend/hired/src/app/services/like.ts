import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const httpOptions = {
  withCredentials: true,
};
@Injectable({
  providedIn: 'root',
})
export class Like_Service {
  private local_url = 'http://54.252.159.167:2020/api';
  constructor(private http: HttpClient) {}

  like_product(like_data: any) {
    return this.http.post(
      `${this.local_url}/like/product`,
      like_data,
      httpOptions
    );
  }

  unlike(target_id: string, type: 'product' | 'comment') {
    return this.http.delete(`${this.local_url}/like/remove`, {
      ...httpOptions, 
      body: { target_id, type },
    });
  }
}
