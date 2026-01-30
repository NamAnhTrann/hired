import { User } from './user_interface';

export interface Product {
  _id: string;

  product_title: string;
  product_description?: string;

  product_price: number;
  product_quantity: number;

  product_image: string[];

  product_category: 'clothing' | 'digital' | 'electronic' | 'food' | 'other';
  product_features: string[];
  shipping_info: string[];
  product_policies: string[];

  product_user: string;

  product_view_count: number;

  like_count: number;
  comment_count: number;
  liked_by_user: boolean;
}
