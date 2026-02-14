export interface Seller {
  _id: string;

  user_id: string; 

  store_name: string;
  store_description: string;

  store_address: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };

  stripe_account_id?: string | null;

  stripe_onboarded: boolean;
  stripe_charges_enabled: boolean;
  stripe_payouts_enabled: boolean;

  seller_status: 'pending' | 'active' | 'suspended';

  store_banner: string,

  seller_badges: Array<
    | 'trusted_seller'
    | 'top_rated'
    | 'veteran'
    | 'high_volume'
    | 'responsive_seller'
    | 'quality_products'
  >;

  createdAt?: string;
  updatedAt?: string;
}
