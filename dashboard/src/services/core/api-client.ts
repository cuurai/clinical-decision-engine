// Service port mapping
const SERVICE_PORTS: Record<string, number> = {
  "decision-intelligence": 3001,
  "integration-interoperability": 3002,
  "knowledge-evidence": 3003,
  "patient-clinical-data": 3004,
  "workflow-care-pathways": 3005,
};

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  timeout: 30000,
};

// Get base URL for a specific service
export function getServiceBaseURL(serviceId?: string): string {
  if (!serviceId) {
    return API_CONFIG.baseURL;
  }
  const port = SERVICE_PORTS[serviceId];
  if (port) {
    return `http://localhost:${port}`;
  }
  return API_CONFIG.baseURL;
}

export interface ApiError {
  message: string;
  status: number;
  statusText: string;
}

export class ApiClientError extends Error {
  status: number;
  statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.statusText = statusText;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions & { serviceId?: string } = {}
): Promise<T> {
  const { method = "GET", headers = {}, body, params, serviceId } = options;

  // Use service-specific base URL if serviceId is provided
  const baseURL = serviceId ? getServiceBaseURL(serviceId) : API_CONFIG.baseURL;

  // Build URL with query parameters
  const url = new URL(`${baseURL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Default headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Get org ID from localStorage or use default
  const orgId = localStorage.getItem("orgId") || "test-org";
    defaultHeaders["X-Org-Id"] = orgId;

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), config);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Request failed: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new ApiClientError(errorMessage, response.status, response.statusText);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(
      error instanceof Error ? error.message : "Network error",
      0,
      "Network Error"
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions & { serviceId?: string }) =>
    request<T>(endpoint, { method: "GET", ...options }),

  post: <T>(endpoint: string, options?: RequestOptions & { serviceId?: string }) =>
    request<T>(endpoint, { method: "POST", ...options }),

  patch: <T>(endpoint: string, options?: RequestOptions & { serviceId?: string }) =>
    request<T>(endpoint, { method: "PATCH", ...options }),

  put: <T>(endpoint: string, options?: RequestOptions & { serviceId?: string }) =>
    request<T>(endpoint, { method: "PUT", ...options }),

  delete: <T>(endpoint: string, options?: RequestOptions & { serviceId?: string }) =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};
