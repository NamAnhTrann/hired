import { Component } from '@angular/core';
import { Contact_Service } from '../services/contact';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {
  loading = false;
  error_message = '';
  success_message = '';

  constructor(private contact: Contact_Service) {}

  form = new FormGroup({
    contact_last_name: new FormControl('', [Validators.required]),
    contact_first_name: new FormControl('', [Validators.required]),
    contact_email: new FormControl('', [Validators.required, Validators.email]),
    contact_phone_number: new FormControl('', [Validators.required]),
    contact_type: new FormControl('', [Validators.required]),
    contact_message: new FormControl('', [Validators.required]),
    contact_support_file: new FormControl<File | null>(null),
  });

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    this.form.patchValue({ contact_support_file: file });
  }

 add_contact() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.error_message = 'Please enter the correct details';
    this.success_message = '';
    return;
  }

  this.error_message = '';
  this.loading = true;

  const payload = {
    contact_last_name: this.form.value.contact_last_name,
    contact_first_name: this.form.value.contact_first_name,
    contact_email: this.form.value.contact_email,
    contact_phone_number: this.form.value.contact_phone_number,
    contact_type: this.form.value.contact_type,
    contact_message: this.form.value.contact_message,
    contact_support_file: null   // or remove this entirely
  };

  this.contact.send_contact(payload).subscribe({
    next: () => {
      this.loading = false;
      this.success_message = 'Thank you, your message has been sent';
      alert("Thank you, your message has been sent")
      this.form.reset();
    },
    error: (err: any) => {
      this.loading = false;
      this.error_message = err.error?.message || 'Something went wrong';
    }
  });
}

}
