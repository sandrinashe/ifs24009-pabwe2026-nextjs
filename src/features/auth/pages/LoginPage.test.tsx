import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import LoginPage from "./LoginPage";
import { renderWithProviders } from "../../../test-utils";
import * as authAction from "../states/action";
import * as userAction from "../../users/states/action";
import apiHelper from "../../../helpers/apiHelper";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render inputs and handle submit", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("sample-token");
    const loginSpy = vi
      .spyOn(authAction, "asyncSetIsAuthLogin")
      .mockReturnValue(() => {});

    renderWithProviders(<LoginPage />, {
      preloadedState: {
        isAuthLogin: false,
        isProfile: false,
      },
    });

    const emailInput = screen.getByTestId("login-email-input");
    const passwordInput = screen.getByTestId("login-password-input");
    const submitBtn = screen.getByTestId("login-submit-button");

    fireEvent.change(emailInput, { target: { value: "testing@delcom.org" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    fireEvent.click(submitBtn);

    expect(loginSpy).toHaveBeenCalledWith("testing@delcom.org", "123456");
  });

  it("should reset loading when token is not present after submit", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    vi.spyOn(authAction, "asyncSetIsAuthLogin").mockImplementation(() => async () => {});

    renderWithProviders(<LoginPage />, {
      preloadedState: {
        isAuthLogin: false,
        isProfile: false,
      },
    });

    const submitBtn = screen.getByTestId("login-submit-button");
    await act(async () => {
      fireEvent.submit(submitBtn.closest("form")!);
    });

    expect(submitBtn).toBeEnabled();
  });

  it("should handle login submit rejection", async () => {
    const error = new Error("Login failed");
    vi.spyOn(authAction, "asyncSetIsAuthLogin").mockReturnValue(() => {
      throw error;
    });

    renderWithProviders(<LoginPage />, {
      preloadedState: {
        isAuthLogin: false,
        isProfile: false,
      },
    });

    const submitBtn = screen.getByTestId("login-submit-button");
    fireEvent.submit(submitBtn.closest("form")!);

    expect(submitBtn).toBeEnabled();
  });

  it("should trigger asyncSetProfile when login succeeds and token exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("test-token");
    const setProfileSpy = vi
      .spyOn(userAction, "asyncSetProfile")
      .mockReturnValue(() => {});

    renderWithProviders(<LoginPage />, {
      preloadedState: {
        isAuthLogin: true,
        isProfile: false,
      },
    });

    expect(setProfileSpy).toHaveBeenCalled();
  });

  it("should reset state when login fails or when isProfile finishes", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const setLoginActionSpy = vi.spyOn(
      authAction,
      "setIsAuthLoginActionCreator"
    );
    const setIsProfileSpy = vi.spyOn(userAction, "setIsProfile");

    // Case 1: isAuthLogin true but no token
    renderWithProviders(<LoginPage />, {
      preloadedState: {
        isAuthLogin: true,
        isProfile: false,
      },
    });
    expect(setLoginActionSpy).toHaveBeenCalledWith(false);

    // Case 2: isProfile true
    renderWithProviders(<LoginPage />, {
      preloadedState: {
        isAuthLogin: false,
        isProfile: true,
      },
    });
    expect(setIsProfileSpy).toHaveBeenCalledWith(false);
  });
});
