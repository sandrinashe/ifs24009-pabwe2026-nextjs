import { describe, it, expect } from "vitest";
import store from "./store";
import { setIsAuthLoginActionCreator } from "./features/auth/states/action";

describe("Redux store configuration", () => {
  it("should contain all expected reducer keys and update state properly", () => {
    const state = store.getState();

    // Verify all keys exist
    expect(state).toHaveProperty("isAuthLogin");
    expect(state).toHaveProperty("isAuthRegister");
    expect(state).toHaveProperty("isAuthLogout");
    expect(state).toHaveProperty("users");
    expect(state).toHaveProperty("user");
    expect(state).toHaveProperty("profile");
    expect(state).toHaveProperty("isProfile");
    expect(state).toHaveProperty("isChangeProfile");
    expect(state).toHaveProperty("isChangeProfilePhoto");
    expect(state).toHaveProperty("isChangeProfilePassword");
    expect(state).toHaveProperty("posts");
    expect(state).toHaveProperty("post");
    expect(state).toHaveProperty("isPost");
    expect(state).toHaveProperty("isPostAdd");
    expect(state).toHaveProperty("isPostAdded");
    expect(state).toHaveProperty("isPostChange");
    expect(state).toHaveProperty("isPostChanged");
    expect(state).toHaveProperty("isPostChangeCover");
    expect(state).toHaveProperty("isPostChangedCover");
    expect(state).toHaveProperty("isPostDelete");
    expect(state).toHaveProperty("isPostDeleted");

    // Test dispatching an action
    store.dispatch(setIsAuthLoginActionCreator(true));
    expect(store.getState().isAuthLogin).toBe(true);
  });
});
