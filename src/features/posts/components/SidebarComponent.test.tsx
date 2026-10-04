import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import SidebarComponent from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

let mockPathname = "/";
let mockSearch = "";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

function active() {
  return screen
    .getAllByRole("link")
    .filter((el) => el.className.includes("bg-indigo-600"))
    .map((el) => el.textContent);
}

describe("SidebarComponent", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockSearch = "";
  });

  it("should render navigation links properly", () => {
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);

    expect(screen.getByText("Semua Postingan")).toBeInTheDocument();
    expect(screen.getByText("Postingan Saya")).toBeInTheDocument();
    expect(screen.getByText("Daftar Pengguna")).toBeInTheDocument();
    expect(screen.getByText("Profil Saya")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
    expect(active()).toEqual(["Semua Postingan"]);
  });

  it("should highlight Postingan Saya on tab=me", () => {
    mockSearch = "tab=me";
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(active()).toEqual(["Postingan Saya"]);
  });

  it("should highlight users and profile pages", () => {
    mockPathname = "/users";
    const first = renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(active()).toEqual(["Daftar Pengguna"]);
    first.unmount();

    mockPathname = "/users/2";
    const second = renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(active()).toEqual(["Daftar Pengguna"]);
    second.unmount();

    mockPathname = "/profile";
    const third = renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(active()).toEqual(["Profil Saya"]);
    third.unmount();

    mockPathname = "/profile/edit";
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(active()).toEqual(["Profil Saya"]);
  });

  it("should highlight nothing on post detail route", () => {
    mockPathname = "/posts/3";
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(active()).toEqual([]);
  });

  it("should render backdrop and call onCloseMobile when backdrop clicked", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(<SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />);
    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    expect(onCloseMobile).toHaveBeenCalled();
  });

  it("should call onCloseMobile when clicking navigation link", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(<SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />);
    fireEvent.click(screen.getByText("Daftar Pengguna"));
    expect(onCloseMobile).toHaveBeenCalled();
  });
});
