import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

vi.mock("next/font/google", () => ({
  Plus_Jakarta_Sans: () => ({ variable: "font-var" }),
}));

vi.mock("@/features/posts/pages/HomePage", () => ({ default: () => <div>home-page</div> }));
vi.mock("@/features/posts/pages/DetailPage", () => ({ default: () => <div>detail-page</div> }));
vi.mock("@/features/users/pages/UsersPage", () => ({ default: () => <div>users-page</div> }));
vi.mock("@/features/users/pages/ProfilePage", () => ({ default: () => <div>profile-page</div> }));
vi.mock("@/features/auth/pages/LoginPage", () => ({ default: () => <div>login-page</div> }));
vi.mock("@/features/auth/pages/RegisterPage", () => ({ default: () => <div>register-page</div> }));
vi.mock("@/features/auth/layouts/AuthLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-layout">{children}</div>,
}));
vi.mock("@/features/posts/layouts/PostLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="post-layout">{children}</div>,
}));

describe("App Router files", () => {
  it("renders every route page", async () => {
    const pages = [
      ["./(dashboard)/page", "home-page"],
      ["./(dashboard)/users/page", "users-page"],
      ["./(dashboard)/profile/page", "profile-page"],
      ["./(dashboard)/posts/[postId]/page", "detail-page"],
      ["./auth/login/page", "login-page"],
      ["./auth/register/page", "register-page"],
    ] as const;

    for (const [path, text] of pages) {
      const mod = await import(/* @vite-ignore */ path);
      const Page = mod.default;
      const { unmount } = render(<Page />);
      expect(screen.getByText(text)).toBeInTheDocument();
      unmount();
    }
  });

  it("wraps children with dashboard and auth layouts", async () => {
    const Dashboard = (await import("./(dashboard)/layout")).default;
    const Auth = (await import("./auth/layout")).default;

    const first = render(<Dashboard><span>child-a</span></Dashboard>);
    expect(screen.getByTestId("post-layout")).toHaveTextContent("child-a");
    first.unmount();

    render(<Auth><span>child-b</span></Auth>);
    expect(screen.getByTestId("auth-layout")).toHaveTextContent("child-b");
  });

  it("renders the 404 page", async () => {
    const NotFound = (await import("./not-found")).default;
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Halaman Tidak Ditemukan");
    expect(screen.getByRole("link", { name: /Kembali ke Beranda/ })).toHaveAttribute("href", "/");
  });

  it("renders the root layout and metadata", async () => {
    const mod = await import("./layout");
    const RootLayout = mod.default;
    const html = RootLayout({ children: <p>root-child</p> });
    expect(html.props.lang).toBe("id");
    expect(html.props.className).toContain("font-var");
    expect(mod.metadata.title).toBe("Delcom Posts");
  });

  it("provides the redux store and typed hooks", async () => {
    const Providers = (await import("@/components/Providers")).default;
    const { useAppDispatch, useAppSelector } = await import("@/hooks/redux");

    function Probe() {
      const dispatch = useAppDispatch();
      const profile = useAppSelector((state) => state.profile);
      return <p>{typeof dispatch}:{profile === null ? "null" : "set"}</p>;
    }

    render(<Providers><Probe /></Providers>);
    expect(screen.getByText("function:null")).toBeInTheDocument();
    renderWithProviders(<Probe />);
    expect(screen.getAllByText("function:null").length).toBeGreaterThan(0);
  });

  it("reads the Delcom base url and port from config", async () => {
    const config = await import("@/lib/config");
    expect(config.DELCOM_BASEURL).toMatch(/^https?:\/\//);
    expect(typeof config.APP_PORT).toBe("string");
  });
});
