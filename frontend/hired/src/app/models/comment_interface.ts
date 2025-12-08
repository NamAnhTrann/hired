import { User } from "./user_interface";

export interface Comment {
  _id: string;
  product: string;
  user: User;
  text: string;

  parent_comment?: string | null;
  createdAt: string;
  updatedAt: string;

  // Added by comment_tree()
  like_count: number;
  liked_by_user: boolean;
  replies: Comment[];
}
