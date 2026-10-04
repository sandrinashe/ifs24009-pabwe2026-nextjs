import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import AddModal from "./AddModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false and restore body overflow", () => {
    const { container } = renderWithProviders(<AddModal show={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should lock body overflow when shown", () => {
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should show validation error if description is empty", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByTestId("add-post-description-input"), { target: { value: "   " } });
    fireEvent.submit(screen.getByTestId("add-post-modal").querySelector("form")!);

    expect(errorSpy).toHaveBeenCalledWith("Isi postingan tidak boleh kosong");
  });

  it("should dispatch asyncSetIsPostAdd with trimmed description", () => {
    const addSpy = vi.spyOn(postAction, "asyncSetIsPostAdd").mockReturnValue((() => {}) as never);
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByTestId("add-post-description-input"), {
      target: { value: "  Belajar Next.js  " },
    });
    fireEvent.submit(screen.getByTestId("add-post-modal").querySelector("form")!);

    expect(addSpy).toHaveBeenCalledWith("Belajar Next.js");
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
  });

  it("should refresh posts and close after successful add", () => {
    const onClose = vi.fn();
    const postsSpy = vi.spyOn(postAction, "asyncSetPosts").mockReturnValue((() => {}) as never);
    const { store } = renderWithProviders(<AddModal show={true} onClose={onClose} isMe={true} />, {
      preloadedState: { isPostAdd: true, isPostAdded: true },
    });

    expect(postsSpy).toHaveBeenCalledWith(true);
    expect(onClose).toHaveBeenCalled();
    expect(store.getState().isPostAdd).toBe(false);
    expect(store.getState().isPostAdded).toBe(false);
  });

  it("should stay open when add failed", () => {
    const onClose = vi.fn();
    renderWithProviders(<AddModal show={true} onClose={onClose} />, {
      preloadedState: { isPostAdd: true, isPostAdded: false },
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId("add-post-modal")).toBeInTheDocument();
  });

  it("should close modal when close or cancel button clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(<AddModal show={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
