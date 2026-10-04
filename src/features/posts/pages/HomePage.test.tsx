import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

const mockPush = vi.fn();
let mockSearch = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

const profile = { id: 1, name: "Abdullah", email: "a@del.org" };
const posts = [
  {
    id: 1,
    user_id: 1,
    description: "Belajar Next.js itu seru",
    cover: "https://example.com/1.jpg",
    created_at: "2024-10-05T03:07:11.000000Z",
    author: { name: "Budi", photo: "https://example.com/budi.jpg" },
    likes: [1, 2],
    comments: [{ id: 1, comment: "Mantap" }],
  },
  {
    id: 2,
    user_id: 2,
    description: "Redux Toolkit mudah",
    cover: null,
    created_at: "2024-10-06T03:07:11.000000Z",
    author: { name: "Sari", photo: null },
    likes: [],
    comments: [],
  },
  {
    id: 3,
    user_id: 3,
    description: "",
    cover: null,
    created_at: "2024-10-07T03:07:11.000000Z",
    author: { name: "", photo: null },
    likes: [],
    comments: [],
  },
  {
    id: 4,
    user_id: 4,
    description: null,
    cover: null,
    created_at: "2024-10-08T03:07:11.000000Z",
    author: null,
    likes: [],
    comments: [],
  },
] as never;

describe("HomePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockPush.mockClear();
    mockSearch = "";
    vi.spyOn(postAction, "asyncSetPosts").mockReturnValue((() => Promise.resolve()) as never);
  });

  it("should render nothing when profile is missing", () => {
    const { container } = renderWithProviders(<HomePage />, {
      preloadedState: { profile: null, posts: [] },
    });
    expect(container.firstChild).toBeNull();
  });

  it("should fetch all posts and render timeline cards", async () => {
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts } });
    await waitFor(() => expect(postAction.asyncSetPosts).toHaveBeenCalledWith(false));

    expect(screen.getByText("Linimasa Postingan")).toBeInTheDocument();
    expect(screen.getByTestId("post-card-1")).toHaveAttribute("href", "/posts/1");
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByAltText("Budi")).toBeInTheDocument();
    expect(screen.getAllByAltText("Cover postingan")).toHaveLength(1);
    expect(screen.getByTestId("post-likes-1")).toHaveTextContent("2");
    expect(screen.getByTestId("post-comments-1")).toHaveTextContent("1");
    expect(screen.getByTestId("post-likes-2")).toHaveTextContent("0");
    expect(screen.getAllByText("Pengguna").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("delete-all-posts-btn")).not.toBeInTheDocument();
  });

  it("should show my posts tab with delete-all button", () => {
    mockSearch = "tab=me";
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts } });
    expect(postAction.asyncSetPosts).toHaveBeenCalledWith(true);
    expect(screen.getByText("Postingan Saya", { selector: "h1" })).toBeInTheDocument();
    expect(screen.getByTestId("delete-all-posts-btn")).toBeInTheDocument();
  });

  it("should hide delete-all button on my tab when there are no posts", () => {
    mockSearch = "tab=me";
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts: [] } });
    expect(screen.queryByTestId("delete-all-posts-btn")).not.toBeInTheDocument();
  });

  it("should switch tabs through the router", () => {
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts } });
    fireEvent.click(screen.getByTestId("tab-me-btn"));
    expect(mockPush).toHaveBeenCalledWith("/?tab=me");
    fireEvent.click(screen.getByTestId("tab-all-btn"));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should show empty state", async () => {
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts: [] } });
    expect(await screen.findByText("Belum ada postingan yang cocok.")).toBeInTheDocument();
  });

  it("should show loading indicator while fetching", async () => {
    let resolveFetch: () => void = () => {};
    vi.mocked(postAction.asyncSetPosts).mockReturnValue(
      (() => new Promise<void>((resolve) => (resolveFetch = resolve))) as never
    );
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts: [] } });
    expect(screen.getByTestId("posts-loading")).toBeInTheDocument();
    await act(async () => resolveFetch());
    expect(await screen.findByText("Belum ada postingan yang cocok.")).toBeInTheDocument();
  });

  it("should not update state if unmounted before fetch finishes", async () => {
    let resolveFetch: () => void = () => {};
    vi.mocked(postAction.asyncSetPosts).mockReturnValue(
      (() => new Promise<void>((resolve) => (resolveFetch = resolve))) as never
    );
    const { unmount } = renderWithProviders(<HomePage />, { preloadedState: { profile, posts: [] } });
    unmount();
    await act(async () => resolveFetch());
  });

  it("should filter posts by description and author with live search", () => {
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts } });
    const search = screen.getByTestId("search-post-input");

    fireEvent.change(search, { target: { value: "redux" } });
    expect(screen.getByTestId("post-card-2")).toBeInTheDocument();
    expect(screen.queryByTestId("post-card-1")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "budi" } });
    expect(screen.getByTestId("post-card-1")).toBeInTheDocument();
    expect(screen.queryByTestId("post-card-2")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "" } });
    expect(screen.getByTestId("post-card-3")).toBeInTheDocument();
    expect(screen.getByTestId("post-card-4")).toBeInTheDocument();
  });

  it("should open and close add modal", () => {
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts } });
    fireEvent.click(screen.getByTestId("add-post-btn"));
    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(screen.queryByTestId("add-post-modal")).not.toBeInTheDocument();
  });

  it("should delete all my posts after confirmation", async () => {
    mockSearch = "tab=me";
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as never);
    const spy = vi.spyOn(postAction, "asyncSetIsPostDeleteAll").mockReturnValue((() => {}) as never);
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts } });
    fireEvent.click(screen.getByTestId("delete-all-posts-btn"));
    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  it("should not delete all when cancelled", async () => {
    mockSearch = "tab=me";
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: false } as never);
    const spy = vi.spyOn(postAction, "asyncSetIsPostDeleteAll").mockReturnValue((() => {}) as never);
    renderWithProviders(<HomePage />, { preloadedState: { profile, posts } });
    fireEvent.click(screen.getByTestId("delete-all-posts-btn"));
    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());
    expect(spy).not.toHaveBeenCalled();
  });

  it("should reload posts after delete-all succeeded", () => {
    const { store } = renderWithProviders(<HomePage />, {
      preloadedState: { profile, posts, isPostDeleteAll: true, isPostDeletedAll: true },
    });
    expect(store.getState().isPostDeleteAll).toBe(false);
    expect(store.getState().isPostDeletedAll).toBe(false);
    expect(vi.mocked(postAction.asyncSetPosts).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should not reload posts when delete-all failed", () => {
    const { store } = renderWithProviders(<HomePage />, {
      preloadedState: { profile, posts, isPostDeleteAll: true, isPostDeletedAll: false },
    });
    expect(store.getState().isPostDeleteAll).toBe(false);
    expect(vi.mocked(postAction.asyncSetPosts).mock.calls.length).toBe(1);
  });
});
