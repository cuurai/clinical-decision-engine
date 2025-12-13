import { useState, useEffect } from "react";
import { ApiClientError } from "./api-client";
import { ResourceService, ListParams } from "./resource-service";

interface UseResourceResult<Item, CreateInput, UpdateInput> {
  data: Item[] | null;
  item: Item | null;
  loading: boolean;
  error: string | null;
  total: number | undefined;
  refresh: () => Promise<void>;
  fetchItem: (id: string) => Promise<void>;
  create: (data: CreateInput) => Promise<Item>;
  update: (id: string, data: UpdateInput) => Promise<Item>;
  remove: (id: string) => Promise<void>;
}

export function useResourceHook<Item, CreateInput, UpdateInput, Params extends ListParams>(
  service: ResourceService<Item, CreateInput, UpdateInput>,
  autoFetch: boolean,
  initialParams?: Params
): UseResourceResult<Item, CreateInput, UpdateInput> {
  const [data, setData] = useState<Item[] | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | undefined>(undefined);

  const fetchData = async (params?: Params) => {
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

  const create = async (data: CreateInput): Promise<Item> => {
    const result = await service.create(data);
    await fetchData();
    return result;
  };

  const update = async (id: string, data: UpdateInput): Promise<Item> => {
    const result = await service.update(id, data);
    await fetchData();
    if (item && (item as { id: string }).id === id) {
      setItem(result);
    }
    return result;
  };

  const remove = async (id: string): Promise<void> => {
    await service.delete(id);
    await fetchData();
    if (item && (item as { id: string }).id === id) {
      setItem(null);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

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
