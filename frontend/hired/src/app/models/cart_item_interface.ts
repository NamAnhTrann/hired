import { Product } from "./product_interface";

export interface CartItem {
  product_id: Product;
  cart_quantity: number;
}
