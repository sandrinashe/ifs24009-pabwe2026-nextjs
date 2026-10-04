import type { Post } from "@/types";
import type { SetPostsAction, SetPostAction, SetStatusAction } from "@/types/action";
import { ActionType } from "./action";

export function postsReducer(states: Post[] = [], action: SetPostsAction = {}): Post[] {
  switch (action.type) {
    case ActionType.SET_POSTS:
      return action.payload as Post[];
    default:
      return states;
  }
}

export function postReducer(state: Post | null = null, action: SetPostAction = {}): Post | null {
  switch (action.type) {
    case ActionType.SET_POST:
      return action.payload ?? null;
    default:
      return state;
  }
}

export function isPostReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST:
      return action.payload;
    default:
      return state;
  }
}

export function isPostAddReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_ADD:
      return action.payload;
    default:
      return state;
  }
}

export function isPostAddedReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_ADDED:
      return action.payload;
    default:
      return state;
  }
}

export function isPostChangeReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_CHANGE:
      return action.payload;
    default:
      return state;
  }
}

export function isPostChangedReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_CHANGED:
      return action.payload;
    default:
      return state;
  }
}

export function isPostChangeCoverReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_CHANGE_COVER:
      return action.payload;
    default:
      return state;
  }
}

export function isPostChangedCoverReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_CHANGED_COVER:
      return action.payload;
    default:
      return state;
  }
}

export function isPostDeleteReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_DELETE:
      return action.payload;
    default:
      return state;
  }
}

export function isPostDeletedReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_DELETED:
      return action.payload;
    default:
      return state;
  }
}

export function isPostLikeReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_LIKE:
      return action.payload;
    default:
      return state;
  }
}

export function isPostLikedReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_LIKED:
      return action.payload;
    default:
      return state;
  }
}

export function isPostAddCommentReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_ADD_COMMENT:
      return action.payload;
    default:
      return state;
  }
}

export function isPostAddedCommentReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_ADDED_COMMENT:
      return action.payload;
    default:
      return state;
  }
}

export function isPostDeleteCommentReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_DELETE_COMMENT:
      return action.payload;
    default:
      return state;
  }
}

export function isPostDeletedCommentReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_DELETED_COMMENT:
      return action.payload;
    default:
      return state;
  }
}

export function isPostDeleteAllReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_DELETE_ALL:
      return action.payload;
    default:
      return state;
  }
}

export function isPostDeletedAllReducer(state = false, action: SetStatusAction = {}) {
  switch (action.type) {
    case ActionType.SET_IS_POST_DELETED_ALL:
      return action.payload;
    default:
      return state;
  }
}
