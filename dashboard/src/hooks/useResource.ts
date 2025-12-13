import { useState, useEffect } from "react";
import { createResourceService, ListParams, ListResponse } from "../services/core/resource-service";
import { getResourceApiPath } from "../types/services";
import { ApiClientError, getServiceBaseURL } from "../services/core/api-client";

export interface UseResourceOptions {
  serviceId: string;
  resourceId: string;
  autoFetch?: boolean;
  initialParams?: ListParams;
}

export interface UseResourceResult<T = unknown> {
  data: T[] | null;
  item: T | null;
  loading: boolean;
  error: string | null;
  total: number | undefined;
  refresh: () => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  create: (data: unknown) => Promise<T>;
  update: (id: string, data: unknown) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export function useResource<T = unknown>({
  serviceId,
  resourceId,
  autoFetch = true,
  initialParams,
}: UseResourceOptions): UseResourceResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | undefined>(undefined);

  const apiPath = getResourceApiPath(serviceId, resourceId);
  const service = apiPath ? createResourceService<T>(apiPath, serviceId) : null;

  const fetchData = async (params?: ListParams) => {
    if (!service) {
      setError("Resource API path not found");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await service.list(params || initialParams);
      setData(response.data || []);
      setTotal(response.total);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to fetch data";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchItem = async (id: string) => {
    if (!service) {
      setError("Resource API path not found");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await service.get(id);
      setItem(result);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to fetch item";
      setError(message);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: unknown): Promise<T> => {
    if (!service) {
      throw new Error("Resource API path not found");
    }
    const result = await service.create(data);
    await fetchData();
    return result;
  };

  const update = async (id: string, data: unknown): Promise<T> => {
    if (!service) {
      throw new Error("Resource API path not found");
    }
    const result = await service.update(id, data);
    await fetchData();
    if (item && (item as { id: string }).id === id) {
      setItem(result);
    }
    return result;
  };

  const remove = async (id: string): Promise<void> => {
    if (!service) {
      throw new Error("Resource API path not found");
    }
    await service.delete(id);
    await fetchData();
    if (item && (item as { id: string }).id === id) {
      setItem(null);
    }
  };

  useEffect(() => {
    if (autoFetch && service) {
      fetchData();
    }
  }, [serviceId, resourceId, autoFetch]);

  return {
    data,
    item,
    loading,
    error,
    total,
    refresh: () => fetchData(),
    fetchItem,
    create,
    update,
    remove,
  };
}
