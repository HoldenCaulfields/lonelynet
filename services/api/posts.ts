import { API_URL, API_ENDPOINTS } from "@/utils/constants";
import { PostMarker, PaginatedResponse } from "@/types/types";

export const postsAPI = {
  async getAll(page = 1, limit = 50): Promise<PaginatedResponse<PostMarker>> {
    const res = await fetch(
      `${API_URL}${API_ENDPOINTS.POSTS}?page=${page}&limit=${limit}`
    );
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
  },

  async getById(id: string): Promise<PostMarker> {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.POSTS}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    return res.json();
  },

  async create(data: FormData): Promise<PostMarker> {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.POSTS}`, {
      method: "POST",
      body: data,
    });
    if (!res.ok) throw new Error("Failed to create post");
    return res.json();
  },

  async update(id: string, data: Partial<PostMarker>): Promise<PostMarker> {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.POSTS}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update post");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.POSTS}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete post");
  },

  async love(id: string): Promise<PostMarker> {
    const res = await fetch(`${API_URL}${API_ENDPOINTS.POSTS}/${id}/love`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to love post");
    return res.json();
  },
};