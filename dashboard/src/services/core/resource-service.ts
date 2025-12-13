import { apiClient, RequestOptions } from "./api-client";

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
    return apiClient.get<ListResponse<T>>(this.basePath, params);
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
