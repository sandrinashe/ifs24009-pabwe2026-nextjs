import apiHelper from "../../../helpers/apiHelper";
import { DELCOM_BASEURL } from "@/lib/config";
import type { ApiResult, Post } from "@/types";

const postApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/posts`;

  function _url(path: string) {
    return BASE_URL + path;
  }

  async function _parse<T = unknown>(
    response: Response,
    fallbackMessage: string
  ): Promise<ApiResult<T>> {
    const result: ApiResult<T> = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || fallbackMessage);
    }
    return result;
  }

  async function getPosts(isMe: boolean | string | number = false) {
    const mine = isMe === true || isMe === 1 || isMe === "1";
    const response = await apiHelper.fetchData(_url(mine ? "?is_me=1" : ""), {
      method: "GET",
    });

    const result = await _parse<{ posts: Post[] }>(
      response,
      "Gagal mengambil data postingan"
    );
    return result.data?.posts || [];
  }

  async function getPostById(postId: number | string) {
    const response = await apiHelper.fetchData(_url(`/${postId}`), {
      method: "GET",
    });

    const result = await _parse<{ post: Post }>(
      response,
      "Gagal mengambil detail postingan"
    );
    return result.data?.post;
  }

  async function postPost(description: string) {
    const response = await apiHelper.fetchData(_url(""), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    const result = await _parse<{ post_id: number }>(
      response,
      "Gagal menambahkan postingan"
    );
    return result.data;
  }

  async function putPost(postId: number | string, description: string) {
    const response = await apiHelper.fetchData(_url(`/${postId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    const result = await _parse(response, "Gagal mengubah postingan");
    return result.message;
  }

  async function postPostCover(postId: number | string, cover: File) {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const response = await apiHelper.fetchData(_url(`/${postId}/cover`), {
      method: "POST",
      body: formData,
    });

    const result = await _parse(response, "Gagal mengubah cover");
    return result.message;
  }

  async function deletePost(postId: number | string) {
    const response = await apiHelper.fetchData(_url(`/${postId}`), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus postingan");
    return result.message;
  }

  async function postPostLike(postId: number | string, like: boolean | number) {
    const response = await apiHelper.fetchData(_url(`/${postId}/likes`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ like: like ? 1 : 0 }),
    });

    const result = await _parse(response, "Gagal mengubah status suka");
    return result.message;
  }

  async function postPostComment(postId: number | string, comment: string) {
    const response = await apiHelper.fetchData(_url(`/${postId}/comments`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });

    const result = await _parse(response, "Gagal menambahkan komentar");
    return result.message;
  }

  async function deletePostComment(postId: number | string) {
    const response = await apiHelper.fetchData(_url(`/${postId}/comments`), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus komentar");
    return result.message;
  }

  async function deleteAllPosts() {
    const response = await apiHelper.fetchData(_url(""), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus semua postingan");
    return result.message;
  }

  return {
    getPosts,
    getPostById,
    postPost,
    putPost,
    postPostCover,
    deletePost,
    postPostLike,
    postPostComment,
    deletePostComment,
    deleteAllPosts,
  };
})();

export default postApi;
