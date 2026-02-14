import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService  {
  private local_url = 'http://54.252.159.167:2020/api';

  private _user = new BehaviorSubject<any>(null);
  user$ = this._user.asObservable();

  constructor(private http: HttpClient) {}

  //login route
  login(credentials: { user_email: string; user_password: string }) {
    return this.http
      .post(`${this.local_url}/login/user`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((res: any) => {
          this._user.next(res.user);
        })
      );
  }

  signup(data: any) {
  return this.http.post(`${this.local_url}/register/user`, data, {
    withCredentials: true
  });
}


  //load the user from cookies
  load_user() {
    return this.http
      .get(`${this.local_url}/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((res: any) => {
          this._user.next(res.user);
        })
      );
  }

  logout() {
    return this.http
      .post(
        `${this.local_url}/logout`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(tap(() => this._user.next(null)));
  }

  isLoggedIn(): boolean {
    return this._user.value !== null;
  }
}
