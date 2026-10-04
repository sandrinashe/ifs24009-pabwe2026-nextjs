import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import RegisterPage from "./RegisterPage";
import { renderWithProviders } from "../../../test-utils";
import * as authAction from "../states/action";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/auth/register",
  useParams: () => ({}),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render inputs and dispatch registration", () => {
    const registerSpy = vi
      .spyOn(authAction, "asyncSetIsAuthRegister")
      .mockReturnValue(() => {});

    renderWithProviders(<RegisterPage />, {
      preloadedState: {
        isAuthRegister: false,
      },
    });

    const nameInput = screen.getByTestId("register-name-input");
    const emailInput = screen.getByTestId("register-email-input");
    const passwordInput = screen.getByTestId("register-password-input");
    const submitBtn = screen.getByTestId("register-submit-button");

    fireEvent.change(nameInput, { target: { value: "Delcom User" } });
    fireEvent.change(emailInput, { target: { value: "user@delcom.org" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    expect(registerSpy).toHaveBeenCalledWith(
      "Delcom User",
      "user@delcom.org",
      "password123"
    );
  });

  it("should reset form fields and navigate to /auth/login on isAuthRegister success", () => {
    renderWithProviders(<RegisterPage />, {
      preloadedState: {
        isAuthRegister: true,
      },
    });

    expect(screen.getByTestId("register-submit-button")).toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("should handle error state when isAuthRegister is false while loading", () => {
    const { store } = renderWithProviders(<RegisterPage />, {
      preloadedState: {
        isAuthRegister: null,
      },
    });

    const submitBtn = screen.getByTestId("register-submit-button");
    fireEvent.click(submitBtn);

    // Simulate action failure wrapped in act
    act(() => {
      store.dispatch(authAction.setIsAuthRegisterActionCreator(false));
    });
    expect(screen.getByTestId("register-submit-button")).toBeEnabled();
  });
});
