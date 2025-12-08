import { CartItem } from "./cart_item_interface";

export interface Cart {
  _id: string;
  user_id: string;
  item: CartItem[];
  cart_subtotal: number;
  createdAt: string;
  updatedAt: string;
}
