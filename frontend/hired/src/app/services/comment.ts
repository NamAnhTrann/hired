import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const httpOptions = {
  withCredentials: true,
};
@Injectable({
  providedIn: 'root',
})
export class Comment {
  private local_url = 'http://localhost:2020/api';
  constructor(private http: HttpClient) {}

  add_comment(comment_data: any) {
    return this.http.post(
      `${this.local_url}/comment/add`,
      comment_data,
      httpOptions
    );
  }

  add_reply(reply_data: any) {
    return this.http.post(
      `${this.local_url}/comment/reply`,
      reply_data,
      httpOptions
    );
  }

  list_comments(product_id: string) {
    return this.http.get(
      `${this.local_url}/comment/${product_id}`,
      httpOptions
    );
  }

  delete_comment(comment_id: string) {
    return this.http.delete(
      `${this.local_url}/comment/delete/${comment_id}`,
      httpOptions
    );
  }
}
