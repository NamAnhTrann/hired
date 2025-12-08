import { Product } from "./product_interface";

export interface Trending {
  _id: string;
  product: string | Product;

  added_at: string;
  createdAt: string;
  updatedAt: string;
}
