export interface Contact {
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone_number: string;
  contact_type: 'general' | 'payment' | 'account';
  contact_message: string;
  contact_support_file?: string;
}
