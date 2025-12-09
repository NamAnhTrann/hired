import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  loading = false;
  error_message = '';

  //formValidator (new stuff)
  form = new FormGroup({
    user_email: new FormControl('', [Validators.required, Validators.email]),
    user_password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (this.form.invalid) {
      this.error_message = 'Please enter valid login details';
      return;
    }

    this.error_message = '';
    this.loading = true;
    const credentials = {
      user_email: this.form.value.user_email!,
      user_password: this.form.value.user_password!,
    };

    this.auth.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        alert("Login Success")
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.loading = false;
        alert("Login Failed")
        this.error_message = err.error?.message || 'Login failed';
      },
    });
  }
}
