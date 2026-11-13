export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export interface RequestOptions extends RequestInit {
  data?: any;
  params?: Record<string, string | number | boolean>;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  }

  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    return headers;
  }

  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${cleanEndpoint}`;

    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    const query = searchParams.toString();
    return query ? `${url}?${query}` : url;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { data, params, headers: customHeaders, ...customConfig } = options;

    const url = this.buildURL(endpoint, params);
    const headers = this.getHeaders(customHeaders);

    const config: RequestInit = {
      method: customConfig.method || "GET",
      ...customConfig,
      headers,
    };

    const contentType =
      (headers as Record<string, string>)["Content-Type"] ||
      (headers as Record<string, string>)["content-type"];

    if (data !== undefined && contentType?.includes("application/json")) {
      config.body = JSON.stringify(data);
    } else if (data !== undefined) {
      config.body = data;
    }

    try {
      console.log("🌍 [API_CLIENT] Fetching:", url);

      const response = await fetch(url, config);

      if (response.status === 204) {
        return {} as T;
      }

      const responseContentType = response.headers.get("content-type") || "";
      const isJson = responseContentType.includes("application/json");

      const responseData = isJson
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        let errorMessage =
          responseData?.detail ||
          responseData?.message ||
          response.statusText ||
          "Request failed";

        if (response.status === 422 && Array.isArray(responseData?.detail)) {
          errorMessage = responseData.detail
            .map((err: any) => `${err.loc?.join(".")}: ${err.msg}`)
            .join(", ");
        }

        const error: ApiError = {
          message: errorMessage,
          status: response.status,
          data: responseData,
        };

        throw error;
      }

      return responseData as T;
    } catch (error: any) {
      if (error instanceof TypeError) {
        throw {
          message: "Network error or CORS issue",
          data: error,
        } as ApiError;
      }

      throw error;
    }
  }

  public get<T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  public post<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      data,
    });
  }

  public put<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      data,
    });
  }

  public patch<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      data,
    });
  }

  public delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "data">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

export const API_BASE_URL = "/api/v1";
export const api = new ApiClient(API_BASE_URL);