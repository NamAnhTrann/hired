export interface User {
  _id: string;

  user_username?: string;
  user_email: string;
  user_phone_number?: string;

  user_first_name?: string;
  user_last_name?: string;

  user_profile?: string;

  user_shipping_address?: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };

  createdAt?: string;
  updatedAt?: string;
}
