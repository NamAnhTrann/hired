import { Product } from "./product_interface";

export interface SearchResponse {
  page: number;
  count: number;
  results: Product[];
}
    