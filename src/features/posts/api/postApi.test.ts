import { describe, it, expect, vi, beforeEach } from "vitest";
import postApi from "./postApi";
import apiHelper from "../../../helpers/apiHelper";

function mockJson(body: unknown) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({ json: async () => body } as never);
}
function lastCall() {
  const [url, options] = vi.mocked(apiHelper.fetchData).mock.calls.at(-1)!;
  return { url: url as string, options: options as RequestInit };
}

describe("postApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getPosts", () => {
    it("should fetch all posts", async () => {
      mockJson({ status: "success", data: { posts: [{ id: 1 }] } });
      expect(await postApi.getPosts()).toEqual([{ id: 1 }]);
      expect(lastCall().url).toMatch(/\/posts$/);
      expect(lastCall().options.method).toBe("GET");
    });

    it.each([[true], [1], ["1"]])("should add is_me=1 for %s", async (value) => {
      mockJson({ status: "success", data: { posts: [] } });
      await postApi.getPosts(value);
      expect(lastCall().url).toMatch(/\/posts\?is_me=1$/);
    });

    it("should not add is_me for falsy values", async () => {
      mockJson({ status: "success", data: { posts: [] } });
      await postApi.getPosts(0);
      expect(lastCall().url).toMatch(/\/posts$/);
    });

    it("should return empty array when data.posts is missing", async () => {
      mockJson({ status: "success", data: {} });
      expect(await postApi.getPosts()).toEqual([]);
    });

    it("should throw api message or fallback", async () => {
      mockJson({ status: "fail", message: "Akses ditolak" });
      await expect(postApi.getPosts()).rejects.toThrow("Akses ditolak");
      mockJson({ status: "fail" });
      await expect(postApi.getPosts()).rejects.toThrow("Gagal mengambil data postingan");
    });
  });

  describe("getPostById", () => {
    it("should return post", async () => {
      mockJson({ status: "success", data: { post: { id: 5 } } });
      expect(await postApi.getPostById(5)).toEqual({ id: 5 });
      expect(lastCall().url).toMatch(/\/posts\/5$/);
    });

    it("should throw api message or fallback", async () => {
      mockJson({ status: "fail", message: "Tidak ada" });
      await expect(postApi.getPostById(5)).rejects.toThrow("Tidak ada");
      mockJson({ status: "fail" });
      await expect(postApi.getPostById(5)).rejects.toThrow("Gagal mengambil detail postingan");
    });
  });

  describe("postPost", () => {
    it("should create a post and return data", async () => {
      mockJson({ status: "success", data: { post_id: 10 } });
      expect(await postApi.postPost("Halo")).toEqual({ post_id: 10 });
      const { url, options } = lastCall();
      expect(url).toMatch(/\/posts$/);
      expect(options.method).toBe("POST");
      expect(options.body).toBe(JSON.stringify({ description: "Halo" }));
    });

    it("should accept legacy success flag", async () => {
      mockJson({ success: true, data: { post_id: 1 } });
      expect(await postApi.postPost("x")).toEqual({ post_id: 1 });
    });

    it("should throw api message or fallback", async () => {
      mockJson({ status: "fail", message: "Data tidak valid" });
      await expect(postApi.postPost("")).rejects.toThrow("Data tidak valid");
      mockJson({ status: "fail" });
      await expect(postApi.postPost("")).rejects.toThrow("Gagal menambahkan postingan");
    });
  });

  describe("putPost", () => {
    it("should update post and return message", async () => {
      mockJson({ status: "success", message: "Berhasil mengubah data" });
      expect(await postApi.putPost(1, "Baru")).toBe("Berhasil mengubah data");
      const { url, options } = lastCall();
      expect(url).toMatch(/\/posts\/1$/);
      expect(options.method).toBe("PUT");
      expect(options.body).toBe(JSON.stringify({ description: "Baru" }));
    });

    it("should throw api message or fallback", async () => {
      mockJson({ status: "fail", message: "Gagal x" });
      await expect(postApi.putPost(1, "")).rejects.toThrow("Gagal x");
      mockJson({ status: "fail" });
      await expect(postApi.putPost(1, "")).rejects.toThrow("Gagal mengubah postingan");
    });
  });

  describe("postPostCover", () => {
    it("should upload cover as multipart form data", async () => {
      mockJson({ status: "success", message: "Berhasil mengubah cover" });
      const file = new File(["a"], "cover.png", { type: "image/png" });
      expect(await postApi.postPostCover(1, file)).toBe("Berhasil mengubah cover");
      const { url, options } = lastCall();
      expect(url).toMatch(/\/posts\/1\/cover$/);
      expect(options.method).toBe("POST");
      expect((options.body as FormData).get("cover")).toBeInstanceOf(File);
    });

    it("should fall back to default file name", async () => {
      mockJson({ status: "success", message: "ok" });
      const blob = new Blob(["a"], { type: "image/png" }) as File;
      await postApi.postPostCover(1, blob);
      expect(((lastCall().options.body as FormData).get("cover") as File).name).toBe("cover.jpg");
    });

    it("should throw api message or fallback", async () => {
      const file = new File(["a"], "cover.png");
      mockJson({ status: "fail", message: "File besar" });
      await expect(postApi.postPostCover(1, file)).rejects.toThrow("File besar");
      mockJson({ status: "fail" });
      await expect(postApi.postPostCover(1, file)).rejects.toThrow("Gagal mengubah cover");
    });
  });

  describe("deletePost", () => {
    it("should delete post", async () => {
      mockJson({ status: "success", message: "Berhasil menghapus data" });
      expect(await postApi.deletePost(3)).toBe("Berhasil menghapus data");
      expect(lastCall().url).toMatch(/\/posts\/3$/);
      expect(lastCall().options.method).toBe("DELETE");
    });

    it("should throw api message or fallback", async () => {
      mockJson({ status: "fail", message: "Tidak bisa" });
      await expect(postApi.deletePost(3)).rejects.toThrow("Tidak bisa");
      mockJson({ status: "fail" });
      await expect(postApi.deletePost(3)).rejects.toThrow("Gagal menghapus postingan");
    });
  });

  describe("postPostLike", () => {
    it("should send like=1 or like=0", async () => {
      mockJson({ status: "success", message: "ok" });
      await postApi.postPostLike(1, true);
      expect(lastCall().url).toMatch(/\/posts\/1\/likes$/);
      expect(lastCall().options.body).toBe(JSON.stringify({ like: 1 }));
      await postApi.postPostLike(1, 0);
      expect(lastCall().options.body).toBe(JSON.stringify({ like: 0 }));
    });

    it("should throw api message or fallback", async () => {
      mockJson({ status: "fail", message: "Gagal like" });
      await expect(postApi.postPostLike(1, true)).rejects.toThrow("Gagal like");
      mockJson({ status: "fail" });
      await expect(postApi.postPostLike(1, true)).rejects.toThrow("Gagal mengubah status suka");
    });
  });

  describe("postPostComment", () => {
    it("should send comment", async () => {
      mockJson({ status: "success", message: "Berhasil memberikan komentar" });
      expect(await postApi.postPostComment(1, "Keren")).toBe("Berhasil memberikan komentar");
      expect(lastCall().url).toMatch(/\/posts\/1\/comments$/);
      expect(lastCall().options.method).toBe("POST");
      expect(lastCall().options.body).toBe(JSON.stringify({ comment: "Keren" }));
    });

    it("should throw api message or fallback", async () => {
      mockJson({ status: "fail", message: "Komentar kosong" });
      await expect(postApi.postPostComment(1, "")).rejects.toThrow("Komentar kosong");
      mockJson({ status: "fail" });
      await expect(postApi.postPostComment(1, "")).rejects.toThrow("Gagal menambahkan komentar");
    });
  });

  describe("deletePostComment", () => {
    it("should delete comment", async () => {
      mockJson({ status: "success", message: "Berhasil menghapus komentar" });
      expect(await postApi.deletePostComment(1)).toBe("Berhasil menghapus komentar");
      expect(lastCall().url).toMatch(/\/posts\/1\/comments$/);
      expect(lastCall().options.method).toBe("DELETE");
    });

    it("should throw api message or fallback", async () => {
      mockJson({ status: "fail", message: "Tidak ada komentar" });
      await expect(postApi.deletePostComment(1)).rejects.toThrow("Tidak ada komentar");
      mockJson({ status: "fail" });
      await expect(postApi.deletePostComment(1)).rejects.toThrow("Gagal menghapus komentar");
    });
  });

  describe("deleteAllPosts", () => {
    it("should delete all posts", async () => {
      mockJson({ status: "success", message: "Berhasil menghapus semua" });
      expect(await postApi.deleteAllPosts()).toBe("Berhasil menghapus semua");
      expect(lastCall().url).toMatch(/\/posts$/);
      expect(lastCall().options.method).toBe("DELETE");
    });

    it("should throw api message or fallback", async () => {
      mockJson({ status: "fail", message: "Unauthenticated." });
      await expect(postApi.deleteAllPosts()).rejects.toThrow("Unauthenticated.");
      mockJson({ status: "fail" });
      await expect(postApi.deleteAllPosts()).rejects.toThrow("Gagal menghapus semua postingan");
    });
  });
});
