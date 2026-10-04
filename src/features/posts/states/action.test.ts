import { describe, it, expect, vi, beforeEach } from "vitest";
import * as actions from "./action";
import { ActionType } from "./action";
import postApi from "../api/postApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("posts action creators", () => {
  it("should create action objects correctly", () => {
    expect(actions.setPostsActionCreator([])).toEqual({ type: ActionType.SET_POSTS, payload: [] });
    expect(actions.setPostActionCreator(null)).toEqual({ type: ActionType.SET_POST, payload: null });
    expect(actions.setIsPostActionCreator(true)).toEqual({ type: ActionType.SET_IS_POST, payload: true });

    const pairs: [keyof typeof actions, string][] = [
      ["setIsPostAddActionCreator", ActionType.SET_IS_POST_ADD],
      ["setIsPostAddedActionCreator", ActionType.SET_IS_POST_ADDED],
      ["setIsPostChangeActionCreator", ActionType.SET_IS_POST_CHANGE],
      ["setIsPostChangedActionCreator", ActionType.SET_IS_POST_CHANGED],
      ["setIsPostChangeCoverActionCreator", ActionType.SET_IS_POST_CHANGE_COVER],
      ["setIsPostChangedCoverActionCreator", ActionType.SET_IS_POST_CHANGED_COVER],
      ["setIsPostDeleteActionCreator", ActionType.SET_IS_POST_DELETE],
      ["setIsPostDeletedActionCreator", ActionType.SET_IS_POST_DELETED],
      ["setIsPostLikeActionCreator", ActionType.SET_IS_POST_LIKE],
      ["setIsPostLikedActionCreator", ActionType.SET_IS_POST_LIKED],
      ["setIsPostAddCommentActionCreator", ActionType.SET_IS_POST_ADD_COMMENT],
      ["setIsPostAddedCommentActionCreator", ActionType.SET_IS_POST_ADDED_COMMENT],
      ["setIsPostDeleteCommentActionCreator", ActionType.SET_IS_POST_DELETE_COMMENT],
      ["setIsPostDeletedCommentActionCreator", ActionType.SET_IS_POST_DELETED_COMMENT],
      ["setIsPostDeleteAllActionCreator", ActionType.SET_IS_POST_DELETE_ALL],
      ["setIsPostDeletedAllActionCreator", ActionType.SET_IS_POST_DELETED_ALL],
    ];
    for (const [name, type] of pairs) {
      const creator = actions[name] as (v: boolean) => unknown;
      expect(creator(true)).toEqual({ type, payload: true });
    }
  });
});

describe("posts async actions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("asyncSetPosts", () => {
    it("should dispatch posts on success", async () => {
      const dispatch = vi.fn();
      const spy = vi.spyOn(postApi, "getPosts").mockResolvedValue([{ id: 1 }] as never);
      await actions.asyncSetPosts(true)(dispatch);
      expect(spy).toHaveBeenCalledWith(true);
      expect(dispatch).toHaveBeenCalledWith(actions.setPostsActionCreator([{ id: 1 }] as never));
    });

    it("should dispatch empty array on error and default isMe false", async () => {
      const dispatch = vi.fn();
      const spy = vi.spyOn(postApi, "getPosts").mockRejectedValue(new Error("x"));
      await actions.asyncSetPosts()(dispatch);
      expect(spy).toHaveBeenCalledWith(false);
      expect(dispatch).toHaveBeenCalledWith(actions.setPostsActionCreator([]));
    });
  });

  describe("asyncSetPost", () => {
    it("should dispatch post then flag on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(postApi, "getPostById").mockResolvedValue({ id: 5 } as never);
      await actions.asyncSetPost(5)(dispatch);
      expect(dispatch).toHaveBeenCalledWith(actions.setPostActionCreator({ id: 5 } as never));
      expect(dispatch).toHaveBeenCalledWith(actions.setIsPostActionCreator(true));
    });

    it("should dispatch null then flag on error", async () => {
      const dispatch = vi.fn();
      vi.spyOn(postApi, "getPostById").mockRejectedValue(new Error("x"));
      await actions.asyncSetPost(5)(dispatch);
      expect(dispatch).toHaveBeenCalledWith(actions.setPostActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(actions.setIsPostActionCreator(true));
    });
  });

  type Case = {
    name: string;
    run: (dispatch: unknown) => Promise<void>;
    api: keyof typeof postApi;
    success: string | null;
    fallback: string | null;
    done: (v: boolean) => unknown;
    flag: (v: boolean) => unknown;
  };

  const cases: Case[] = [
    {
      name: "asyncSetIsPostAdd",
      run: (d) => actions.asyncSetIsPostAdd("Halo")(d as never),
      api: "postPost",
      success: "Postingan berhasil dipublikasikan!",
      fallback: null,
      done: actions.setIsPostAddedActionCreator,
      flag: actions.setIsPostAddActionCreator,
    },
    {
      name: "asyncSetIsPostChange",
      run: (d) => actions.asyncSetIsPostChange(1, "Halo")(d as never),
      api: "putPost",
      success: "Berhasil mengubah data",
      fallback: "Postingan berhasil diperbarui!",
      done: actions.setIsPostChangedActionCreator,
      flag: actions.setIsPostChangeActionCreator,
    },
    {
      name: "asyncSetIsPostChangeCover",
      run: (d) => actions.asyncSetIsPostChangeCover(1, new File(["a"], "a.png"))(d as never),
      api: "postPostCover",
      success: "Berhasil mengubah cover",
      fallback: "Cover berhasil diperbarui!",
      done: actions.setIsPostChangedCoverActionCreator,
      flag: actions.setIsPostChangeCoverActionCreator,
    },
    {
      name: "asyncSetIsPostDelete",
      run: (d) => actions.asyncSetIsPostDelete(1)(d as never),
      api: "deletePost",
      success: "Berhasil menghapus data",
      fallback: "Postingan berhasil dihapus!",
      done: actions.setIsPostDeletedActionCreator,
      flag: actions.setIsPostDeleteActionCreator,
    },
    {
      name: "asyncSetIsPostAddComment",
      run: (d) => actions.asyncSetIsPostAddComment(1, "Keren")(d as never),
      api: "postPostComment",
      success: "Berhasil memberikan komentar",
      fallback: "Komentar berhasil ditambahkan!",
      done: actions.setIsPostAddedCommentActionCreator,
      flag: actions.setIsPostAddCommentActionCreator,
    },
    {
      name: "asyncSetIsPostDeleteComment",
      run: (d) => actions.asyncSetIsPostDeleteComment(1)(d as never),
      api: "deletePostComment",
      success: "Berhasil menghapus komentar",
      fallback: "Komentar berhasil dihapus!",
      done: actions.setIsPostDeletedCommentActionCreator,
      flag: actions.setIsPostDeleteCommentActionCreator,
    },
    {
      name: "asyncSetIsPostDeleteAll",
      run: (d) => actions.asyncSetIsPostDeleteAll()(d as never),
      api: "deleteAllPosts",
      success: "Berhasil menghapus semua",
      fallback: "Semua postingan berhasil dihapus!",
      done: actions.setIsPostDeletedAllActionCreator,
      flag: actions.setIsPostDeleteAllActionCreator,
    },
  ];

  for (const c of cases) {
    describe(c.name, () => {
      it("should show success dialog and dispatch success", async () => {
        const dispatch = vi.fn();
        vi.spyOn(postApi, c.api).mockResolvedValue((c.success ?? { post_id: 1 }) as never);
        const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

        await c.run(dispatch);

        expect(successSpy).toHaveBeenCalledWith(c.success ?? expect.any(String));
        expect(dispatch).toHaveBeenCalledWith(c.done(true));
        expect(dispatch).toHaveBeenCalledWith(c.flag(true));
      });

      if (c.fallback) {
        it("should use fallback success message when api message is empty", async () => {
          const dispatch = vi.fn();
          vi.spyOn(postApi, c.api).mockResolvedValue("" as never);
          const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
          await c.run(dispatch);
          expect(successSpy).toHaveBeenCalledWith(c.fallback);
        });
      }

      it("should show error dialog and dispatch false on failure", async () => {
        const dispatch = vi.fn();
        vi.spyOn(postApi, c.api).mockRejectedValue(new Error("Gagal"));
        const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

        await c.run(dispatch);

        expect(errorSpy).toHaveBeenCalledWith("Gagal");
        expect(dispatch).toHaveBeenCalledWith(c.done(false));
        expect(dispatch).toHaveBeenCalledWith(c.flag(true));
      });
    });
  }

  describe("asyncSetIsPostLike", () => {
    it("should dispatch liked true on success", async () => {
      const dispatch = vi.fn();
      const spy = vi.spyOn(postApi, "postPostLike").mockResolvedValue("ok");
      await actions.asyncSetIsPostLike(1, true)(dispatch);
      expect(spy).toHaveBeenCalledWith(1, true);
      expect(dispatch).toHaveBeenCalledWith(actions.setIsPostLikedActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(actions.setIsPostLikeActionCreator(true));
    });

    it("should show error and dispatch liked false on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(postApi, "postPostLike").mockRejectedValue(new Error("Gagal like"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      await actions.asyncSetIsPostLike(1, false)(dispatch);
      expect(errorSpy).toHaveBeenCalledWith("Gagal like");
      expect(dispatch).toHaveBeenCalledWith(actions.setIsPostLikedActionCreator(false));
      expect(dispatch).toHaveBeenCalledWith(actions.setIsPostLikeActionCreator(true));
    });
  });
});
