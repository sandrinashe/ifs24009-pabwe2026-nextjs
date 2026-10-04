export type PostAuthor = {
  name: string;
  photo?: string | null;
};

export type PostComment = {
  id: number;
  comment: string;
  created_at?: string;
  updated_at?: string;
};

export type Post = {
  id: number;
  user_id: number;
  cover?: string | null;
  description: string;
  created_at?: string;
  updated_at?: string;
  author?: PostAuthor;
  likes: number[];
  comments: PostComment[];
  my_comment?: PostComment | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
};

export type ApiResult<T = unknown> = {
  status?: string;
  success?: boolean;
  message?: string;
  data?: T;
};

export type { RootState, AppDispatch } from "@/store";
