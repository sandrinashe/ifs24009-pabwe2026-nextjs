import type { Post, User } from "./index";

export type AppAction<P = any> = {
  type?: string;
  payload?: P;
};

export type SetPostsAction = AppAction<Post[]>;
export type SetPostAction = AppAction<Post | null>;
export type SetStatusAction = AppAction<boolean>;
export type SetProfileAction = AppAction<User | null>;
