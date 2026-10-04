import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import DetailPage from "./DetailPage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ postId: "1" }),
}));

const profile = { id: 1, name: "Abdullah", email: "a@del.org" };
const basePost = {
  id: 1,
  user_id: 1,
  description: "Isi postingan",
  cover: "https://example.com/cover.jpg",
  created_at: "2024-10-05T03:07:11.000000Z",
  updated_at: "2024-10-05T03:07:11.000000Z",
  author: { name: "Abdullah", photo: "https://example.com/a.jpg" },
  likes: [2, 3],
  comments: [
    { id: 10, comment: "Komentar orang lain", created_at: "2024-10-05T03:49:59.000000Z" },
    { id: 11, comment: "Komentar saya", created_at: "2024-10-05T03:50:59.000000Z" },
  ],
  my_comment: { id: 11, comment: "Komentar saya" },
};

function render(post: unknown, extra: Record<string, unknown> = {}, prof: unknown = profile) {
  return renderWithProviders(<DetailPage />, {
    preloadedState: { profile: prof, post, ...extra },
  });
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockClear();
    vi.spyOn(postAction, "asyncSetPost").mockReturnValue((() => {}) as never);
  });

  it("should render loading spinner when profile or post is missing", () => {
    render(null, {}, null);
    expect(screen.queryByTestId("like-btn")).not.toBeInTheDocument();
  });

  it("should fetch and render post detail for the owner", () => {
    render(basePost);
    expect(postAction.asyncSetPost).toHaveBeenCalledWith("1");
    expect(screen.getByText("Isi postingan")).toBeInTheDocument();
    expect(screen.getByTestId("post-author-name")).toHaveTextContent("Abdullah");
    expect(screen.getByAltText("Abdullah")).toBeInTheDocument();
    expect(screen.getByAltText("Cover postingan")).toBeInTheDocument();
    expect(screen.getByTestId("likes-count")).toHaveTextContent("2");
    expect(screen.getByTestId("comments-count")).toHaveTextContent("2");
    expect(screen.getByTestId("owner-actions")).toBeInTheDocument();
    expect(screen.getByText("Komentar saya")).toBeInTheDocument();
    expect(screen.getAllByTestId("delete-comment-btn")).toHaveLength(1);
  });

  it("should hide owner actions for other users and show fallbacks", () => {
    render(
      {
        ...basePost,
        user_id: 2,
        description: "",
        cover: null,
        author: null,
        comments: [],
        my_comment: null,
        likes: [1],
      }
    );
    expect(screen.queryByTestId("owner-actions")).not.toBeInTheDocument();
    expect(screen.queryByTestId("edit-cover-btn")).not.toBeInTheDocument();
    expect(screen.getByText("Tidak ada isi postingan.")).toBeInTheDocument();
    expect(screen.getByTestId("post-author-name")).toHaveTextContent("Pengguna");
    expect(screen.getByTestId("no-comments")).toBeInTheDocument();
    expect(screen.getByText("Disukai")).toBeInTheDocument();
  });

  it("should render initial avatar when author has no photo", () => {
    render({ ...basePost, author: { name: "sari", photo: null } });
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("should render default avatar letter when author name is empty", () => {
    render({ ...basePost, author: { name: "", photo: null } });
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should open and close cover and edit modals", () => {
    render(basePost);
    fireEvent.click(screen.getByTestId("edit-cover-btn"));
    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("edit-detail-post-btn"));
    expect(screen.getByTestId("edit-post-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-post-modal")).not.toBeInTheDocument();
  });

  it("should navigate home when loaded post is null", () => {
    render(null, { isPost: true });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should stay when loaded post exists", () => {
    render(basePost, { isPost: true });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should delete post after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as never);
    const spy = vi.spyOn(postAction, "asyncSetIsPostDelete").mockReturnValue((() => {}) as never);
    render(basePost);
    fireEvent.click(screen.getByTestId("delete-detail-post-btn"));
    await waitFor(() => expect(spy).toHaveBeenCalledWith(1));
  });

  it("should not delete post when cancelled", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: false } as never);
    const spy = vi.spyOn(postAction, "asyncSetIsPostDelete").mockReturnValue((() => {}) as never);
    render(basePost);
    fireEvent.click(screen.getByTestId("delete-detail-post-btn"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    expect(spy).not.toHaveBeenCalled();
  });

  it("should navigate home after delete succeeded and stay when failed", () => {
    const a = render(basePost, { isPostDelete: true, isPostDeleted: true });
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(a.store.getState().isPostDeleted).toBe(false);
    a.unmount();

    mockPush.mockClear();
    render(basePost, { isPostDelete: true, isPostDeleted: false });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should like and unlike", () => {
    const spy = vi.spyOn(postAction, "asyncSetIsPostLike").mockReturnValue((() => {}) as never);
    const a = render(basePost);
    fireEvent.click(screen.getByTestId("like-btn"));
    expect(spy).toHaveBeenLastCalledWith(1, true);
    a.unmount();

    render({ ...basePost, likes: [1] });
    fireEvent.click(screen.getByTestId("like-btn"));
    expect(spy).toHaveBeenLastCalledWith(1, false);
  });

  it("should refetch post after like succeeded and not when failed", () => {
    const a = render(basePost, { isPostLike: true, isPostLiked: true });
    expect(a.store.getState().isPostLiked).toBe(false);
    expect(vi.mocked(postAction.asyncSetPost).mock.calls.length).toBe(2);
    a.unmount();

    vi.mocked(postAction.asyncSetPost).mockClear();
    render(basePost, { isPostLike: true, isPostLiked: false });
    expect(vi.mocked(postAction.asyncSetPost).mock.calls.length).toBe(1);
  });

  it("should validate empty comment", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    render(basePost);
    fireEvent.change(screen.getByTestId("comment-input"), { target: { value: "  " } });
    fireEvent.submit(screen.getByTestId("comment-input").closest("form")!);
    expect(errorSpy).toHaveBeenCalledWith("Komentar tidak boleh kosong");
  });

  it("should send trimmed comment", () => {
    const spy = vi.spyOn(postAction, "asyncSetIsPostAddComment").mockReturnValue((() => {}) as never);
    render(basePost);
    fireEvent.change(screen.getByTestId("comment-input"), { target: { value: " Keren " } });
    fireEvent.submit(screen.getByTestId("comment-input").closest("form")!);
    expect(spy).toHaveBeenCalledWith(1, "Keren");
    expect(screen.getByTestId("send-comment-btn")).toBeDisabled();
  });

  it("should clear input and refetch after comment succeeded, keep on failure", () => {
    const a = render(basePost, { isPostAddComment: true, isPostAddedComment: true });
    expect(a.store.getState().isPostAddedComment).toBe(false);
    expect(vi.mocked(postAction.asyncSetPost).mock.calls.length).toBe(2);
    a.unmount();

    vi.mocked(postAction.asyncSetPost).mockClear();
    render(basePost, { isPostAddComment: true, isPostAddedComment: false });
    expect(vi.mocked(postAction.asyncSetPost).mock.calls.length).toBe(1);
  });

  it("should delete own comment after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as never);
    const spy = vi.spyOn(postAction, "asyncSetIsPostDeleteComment").mockReturnValue((() => {}) as never);
    render(basePost);
    fireEvent.click(screen.getByTestId("delete-comment-btn"));
    await waitFor(() => expect(spy).toHaveBeenCalledWith(1));
  });

  it("should not delete comment when cancelled", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: false } as never);
    const spy = vi.spyOn(postAction, "asyncSetIsPostDeleteComment").mockReturnValue((() => {}) as never);
    render(basePost);
    fireEvent.click(screen.getByTestId("delete-comment-btn"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    expect(spy).not.toHaveBeenCalled();
  });

  it("should refetch after comment deleted and not when failed", () => {
    const a = render(basePost, { isPostDeleteComment: true, isPostDeletedComment: true });
    expect(a.store.getState().isPostDeletedComment).toBe(false);
    expect(vi.mocked(postAction.asyncSetPost).mock.calls.length).toBe(2);
    a.unmount();

    vi.mocked(postAction.asyncSetPost).mockClear();
    render(basePost, { isPostDeleteComment: true, isPostDeletedComment: false });
    expect(vi.mocked(postAction.asyncSetPost).mock.calls.length).toBe(1);
  });
});
