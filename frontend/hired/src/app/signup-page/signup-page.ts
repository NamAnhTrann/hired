import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-signup-page',
  imports: [RouterLink,ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.css',
})
export class SignupPage {
  loading = false;
  error_message = '';
  success_message = '';

  form = new FormGroup({
    user_username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20)
    ]),
    user_first_name: new FormControl('', [Validators.required]),
    user_last_name: new FormControl('', [Validators.required]),
    user_email: new FormControl('', [Validators.required, Validators.email]),
    user_password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    user_phone_number: new FormControl('')
  });

  constructor(private auth:AuthService, private router:Router){}

  signup() {
    if (this.form.invalid) {
      this.error_message = 'Please fill all required fields correctly.';
      return;
    }

    this.error_message = '';
    this.success_message = '';
    this.loading = true;

    const data = {
      user_username: this.form.value.user_username!,
      user_first_name: this.form.value.user_first_name!,
      user_last_name: this.form.value.user_last_name!,
      user_email: this.form.value.user_email!,
      user_password: this.form.value.user_password!,
      user_phone_number: this.form.value.user_phone_number || null
    };

    this.auth.signup(data).subscribe({
      next: () => {
        this.loading = false;
        this.success_message = 'Signup successful';
        this.router.navigate(['/login-page'])
      },
      error: (err: any) => {
        this.loading = false;
        this.error_message = err.error?.message || 'Signup failed';
      }
    });
  }
}
