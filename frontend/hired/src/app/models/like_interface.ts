export interface Like {
  _id: string;
  user: string;
  product?: string | null;
  comment?: string | null;
}
