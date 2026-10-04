import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as postAction from "../states/action";

describe("ChangeModal", () => {
  const mockPost = { id: 1, description: "Deskripsi awal" } as never;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false or post is missing", () => {
    const a = renderWithProviders(<ChangeModal show={false} onClose={vi.fn()} post={mockPost} />);
    expect(a.container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
    a.unmount();

    const b = renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} post={null} />);
    expect(b.container.firstChild).toBeNull();
  });

  it("should populate description and handle change", () => {
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} post={mockPost} />);
    const input = screen.getByTestId("edit-post-description-input") as HTMLTextAreaElement;
    expect(input.value).toBe("Deskripsi awal");
    fireEvent.change(input, { target: { value: "Baru" } });
    expect(input.value).toBe("Baru");
  });

  it("should fall back to empty description", () => {
    renderWithProviders(
      <ChangeModal show={true} onClose={vi.fn()} post={{ id: 1, description: null } as never} />
    );
    expect((screen.getByTestId("edit-post-description-input") as HTMLTextAreaElement).value).toBe("");
  });

  it("should validate empty description", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} post={mockPost} />);
    fireEvent.change(screen.getByTestId("edit-post-description-input"), { target: { value: " " } });
    fireEvent.submit(screen.getByTestId("edit-post-modal").querySelector("form")!);
    expect(errorSpy).toHaveBeenCalledWith("Isi postingan tidak boleh kosong");
  });

  it("should dispatch asyncSetIsPostChange with trimmed description", () => {
    const changeSpy = vi.spyOn(postAction, "asyncSetIsPostChange").mockReturnValue((() => {}) as never);
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} post={mockPost} />);
    fireEvent.change(screen.getByTestId("edit-post-description-input"), { target: { value: " Baru " } });
    fireEvent.submit(screen.getByTestId("edit-post-modal").querySelector("form")!);
    expect(changeSpy).toHaveBeenCalledWith(1, "Baru");
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
  });

  it("should refetch post and close when change succeeded", () => {
    const onClose = vi.fn();
    const postSpy = vi.spyOn(postAction, "asyncSetPost").mockReturnValue((() => {}) as never);
    const { store } = renderWithProviders(<ChangeModal show={true} onClose={onClose} post={mockPost} />, {
      preloadedState: { isPostChange: true, isPostChanged: true },
    });
    expect(postSpy).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
    expect(store.getState().isPostChange).toBe(false);
  });

  it("should stay open when change failed", () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal show={true} onClose={onClose} post={mockPost} />, {
      preloadedState: { isPostChange: true, isPostChanged: false },
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close modal when close or cancel clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(<ChangeModal show={true} onClose={onClose} post={mockPost} />);
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-edit-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
