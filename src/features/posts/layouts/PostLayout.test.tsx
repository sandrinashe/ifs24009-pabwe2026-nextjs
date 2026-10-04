import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import PostLayout from "./PostLayout";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe("PostLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to login if access token does not exist", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    renderWithProviders(<PostLayout />, {
      preloadedState: {
        profile: null,
      },
    });

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
    expect(screen.getByText("Memuat sesi pengguna...")).toBeInTheDocument();
  });

  it("should render layout with navbar and sidebar when profile is present and handle sidebar toggling & logout", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(<PostLayout />, {
      preloadedState: {
        profile: {
          id: 1,
          name: "Test User",
          email: "test@delcom.org",
        },
      },
    });

    expect(screen.getByText("Delcom Posts")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();

    // Toggle sidebar
    const toggleBtn = screen.getByTestId("toggle-sidebar-btn");
    fireEvent.click(toggleBtn);

    // Click backdrop to close mobile sidebar
    const backdrop = screen.getByTestId("sidebar-backdrop");
    fireEvent.click(backdrop);

    // Trigger logout from navbar
    const dropdownBtn = screen.getByTestId("profile-dropdown-button");
    fireEvent.click(dropdownBtn);
    const logoutBtn = screen.getByTestId("dropdown-logout-button");
    fireEvent.click(logoutBtn);
  });

  it("should stay on page when isProfile is triggered and profile exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(<PostLayout />, {
      preloadedState: {
        profile: { id: 1, name: "Logged User" },
        isProfile: true,
      },
    });

    expect(screen.getByText("Logged User")).toBeInTheDocument();
  });

  it("should redirect to login when isProfile is triggered and profile is null", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    renderWithProviders(<PostLayout />, {
      preloadedState: {
        profile: null,
        isProfile: true,
      },
    });

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("should redirect to login when isAuthLogout is true", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(<PostLayout />, {
      preloadedState: {
        profile: { id: 1, name: "Logged User" },
        isAuthLogout: true,
      },
    });

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });
});
