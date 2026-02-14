import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Trending } from '../models/trending_interface';

@Injectable({
  providedIn: 'root',
})
export class Trending_Service {
  private local_url = 'http://54.252.159.167:2020/api';

  constructor(private http: HttpClient) {}

  list_trending() {
    return this.http.get<{ success: boolean; data: Trending[] }>(
      `${this.local_url}/list/trending`
    );
  }
}
