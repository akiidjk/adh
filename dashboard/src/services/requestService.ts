import { RequestMessage } from '@/lib/models';

type SearchResponse = {
  success: boolean;
  total: number;
  results: RequestMessage[];
};

export const requestService = {
  async deleteRequest(id: number): Promise<void> {
    const response = await fetch(`/api/delete?id=${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete request: ${response.status}`);
    }
  },

  async deleteAllRequests(): Promise<void> {
    const response = await fetch('/api/delete-all', {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete all requests: ${response.status}`);
    }
  },

  async searchRequests(query: string): Promise<SearchResponse> {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    return response.json();
  }
};
