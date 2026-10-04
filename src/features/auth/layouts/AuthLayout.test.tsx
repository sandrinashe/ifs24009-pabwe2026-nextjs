import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import AuthLayout from "./AuthLayout";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";

const mockPush = vi.fn();
const mockPathname = vi.fn(() => "/auth/login");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mockPathname(),
  useParams: () => ({}),
}));

describe("AuthLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/auth/login");
  });

  it("should render branding and tabs", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    renderWithProviders(<AuthLayout />, {
      preloadedState: {
        profile: null,
      },
    });

    expect(screen.getByText("Delcom Posts")).toBeInTheDocument();
    expect(screen.getByText("Masuk Akun")).toBeInTheDocument();
    expect(screen.getByText("Daftar Baru")).toBeInTheDocument();
    expect(screen.getByText("Masuk Akun")).toHaveClass("bg-white");
    expect(screen.getByText("Daftar Baru")).toHaveClass("text-slate-600");
  });

  it("should highlight register tab when on register path", () => {
    mockPathname.mockReturnValue("/auth/register");
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    renderWithProviders(<AuthLayout />, {
      preloadedState: {
        profile: null,
      },
    });

    expect(screen.getByText("Daftar Baru")).toHaveClass("bg-white");
    expect(screen.getByText("Masuk Akun")).toHaveClass("text-slate-600");
  });

  it("should navigate to home if user already logged in with profile", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(<AuthLayout />, {
      preloadedState: {
        profile: { id: 1, name: "Logged In User" },
        isProfile: true,
      },
    });

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should stay on auth layout if isProfile is true but profile is null", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    renderWithProviders(<AuthLayout />, {
      preloadedState: {
        profile: null,
        isProfile: true,
      },
    });

    expect(screen.getByText("Masuk Akun")).toBeInTheDocument();
  });
});
