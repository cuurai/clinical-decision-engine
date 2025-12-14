import { apiClient } from "../../config/api";

export interface ListParams {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
  [key: string]: unknown;
}

export interface ListResponse<T> {
  data: T[];
  total?: number;
  limit?: number;
  offset?: number;
}

/**
 * Generic CRUD service for any resource
 */
export class ResourceService<T = unknown, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  constructor(private basePath: string) {}

  async list(params?: ListParams): Promise<ListResponse<T>> {
    const response = await apiClient.get<{
      data: { items: T[] };
      meta?: { pagination?: { limit?: number } };
    }>(this.basePath, params);
    // Handle API response format: { data: { items: [...] }, meta: {...} }
    if (response && typeof response === "object" && "data" in response) {
      const responseData = response.data as any;
      if (responseData && "items" in responseData && Array.isArray(responseData.items)) {
        return {
          data: responseData.items,
          total: responseData.items.length,
          limit: response.meta?.pagination?.limit,
        } as ListResponse<T>;
      }
      // Fallback: if data is already an array
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          total: responseData.length,
        } as ListResponse<T>;
      }
    }
    // Fallback to original response structure
    return response as ListResponse<T>;
  }

  async get(id: string): Promise<T> {
    return apiClient.get<T>(`${this.basePath}/${id}`);
  }

  async create(data: CreateInput): Promise<T> {
    return apiClient.post<T>(this.basePath, data);
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return apiClient.patch<T>(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }
}

/**
 * Service factory to create resource services
 */
export function createResourceService<
  T = unknown,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T>
>(basePath: string): ResourceService<T, CreateInput, UpdateInput> {
  return new ResourceService<T, CreateInput, UpdateInput>(basePath);
}
