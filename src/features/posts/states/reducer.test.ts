import { describe, it, expect } from "vitest";
import * as reducers from "./reducer";
import { ActionType } from "./action";

const flagReducers: [keyof typeof reducers, string][] = [
  ["isPostReducer", ActionType.SET_IS_POST],
  ["isPostAddReducer", ActionType.SET_IS_POST_ADD],
  ["isPostAddedReducer", ActionType.SET_IS_POST_ADDED],
  ["isPostChangeReducer", ActionType.SET_IS_POST_CHANGE],
  ["isPostChangedReducer", ActionType.SET_IS_POST_CHANGED],
  ["isPostChangeCoverReducer", ActionType.SET_IS_POST_CHANGE_COVER],
  ["isPostChangedCoverReducer", ActionType.SET_IS_POST_CHANGED_COVER],
  ["isPostDeleteReducer", ActionType.SET_IS_POST_DELETE],
  ["isPostDeletedReducer", ActionType.SET_IS_POST_DELETED],
  ["isPostLikeReducer", ActionType.SET_IS_POST_LIKE],
  ["isPostLikedReducer", ActionType.SET_IS_POST_LIKED],
  ["isPostAddCommentReducer", ActionType.SET_IS_POST_ADD_COMMENT],
  ["isPostAddedCommentReducer", ActionType.SET_IS_POST_ADDED_COMMENT],
  ["isPostDeleteCommentReducer", ActionType.SET_IS_POST_DELETE_COMMENT],
  ["isPostDeletedCommentReducer", ActionType.SET_IS_POST_DELETED_COMMENT],
  ["isPostDeleteAllReducer", ActionType.SET_IS_POST_DELETE_ALL],
  ["isPostDeletedAllReducer", ActionType.SET_IS_POST_DELETED_ALL],
];

describe("posts reducer", () => {
  it("should return default state for unknown or missing actions", () => {
    expect(reducers.postsReducer(undefined, undefined)).toEqual([]);
    expect(reducers.postReducer(undefined, undefined)).toBeNull();
    expect(reducers.postsReducer([], { type: "UNKNOWN" })).toEqual([]);
    expect(reducers.postReducer(null, { type: "UNKNOWN" })).toBeNull();
    for (const [name] of flagReducers) {
      const reducer = reducers[name] as (s?: boolean, a?: unknown) => boolean;
      expect(reducer(undefined, undefined)).toBe(false);
      expect(reducer(true, { type: "UNKNOWN" })).toBe(true);
    }
  });

  it("should handle SET_POSTS", () => {
    const posts = [{ id: 1 }] as never;
    expect(reducers.postsReducer([], { type: ActionType.SET_POSTS, payload: posts })).toEqual([{ id: 1 }]);
  });

  it("should handle SET_POST including undefined payload", () => {
    expect(reducers.postReducer(null, { type: ActionType.SET_POST, payload: { id: 1 } as never })).toEqual({ id: 1 });
    expect(reducers.postReducer({ id: 1 } as never, { type: ActionType.SET_POST, payload: undefined })).toBeNull();
  });

  it("should handle every status flag action", () => {
    for (const [name, type] of flagReducers) {
      const reducer = reducers[name] as (s: boolean, a: unknown) => boolean;
      expect(reducer(false, { type, payload: true })).toBe(true);
      expect(reducer(true, { type, payload: false })).toBe(false);
    }
  });
});
