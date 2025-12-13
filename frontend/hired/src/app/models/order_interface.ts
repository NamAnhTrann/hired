import { Product } from './product_interface';

export interface OrderItem {
  product_id: Product;
  order_quantity: number;
  subtotal: number; // dollars (derived, display-only)
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'failed_out_of_stock'
  | 'shipped';

export interface Order {
  _id: string;
  user_id: string;
  cart_id: string;

  order_item: OrderItem[];

  order_total_amount: number; // cents
  vat_amount: number;         // cents

  order_status: OrderStatus;

  cancelled_by?: 'customer' | 'system';
  cancelled_at?: string;

  createdAt: string;
  updatedAt: string;
}
