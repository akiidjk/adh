import type { PageData, StoredPageData } from "@/lib/models";

export type PagesData = Record<string, StoredPageData>;

export const pagesService = {
  async getAll(): Promise<PagesData> {
    const response = await fetch("/api/create");
    if (!response.ok) throw new Error("Failed to fetch pages");
    return response.json();
  },

  async create(payload: PageData): Promise<void> {
    const response = await fetch("/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error creating page");
    }
  },

  async update(payload: PageData): Promise<void> {
    const response = await fetch("/api/create", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error updating page");
    }
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(
      `/api/create?endpoint=${encodeURIComponent(endpoint)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error deleting page");
    }
  },
};
