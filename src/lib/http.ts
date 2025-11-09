import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { getAuthToken } from "./token-provider";

/**
 * HttpClient with AWS Cognito Integration
 *
 * Architecture:
 * - NO localStorage for tokens (AWS Cognito manages this)
 * - Dynamically fetches token before each request
 * - Low-level service that doesn't know about AWS directly
 * - Uses token-provider as abstraction layer
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private signal?: AbortSignal;

  /**
   * Create a new HttpClient instance
   * @param configs Axios configuration
   * @param signal AbortSignal for cancelling requests
   */
  constructor(configs: AxiosRequestConfig, signal?: AbortSignal) {
    const axiosConfig = {
      ...configs,
      baseURL: import.meta.env.VITE_API_BASE_URL || configs.baseURL,
      timeout: configs.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...configs.headers,
      },
    };

    this.axiosInstance = axios.create(axiosConfig);
    this.signal = signal;
    this.initInterceptors();
  }

  /**
   * Make a GET request
   * @param url URL to request
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  /**
   * Make a POST request
   * @param url URL to request
   * @param data Data to send
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  public async post<T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  /**
   * Make a PUT request
   * @param url URL to request
   * @param data Data to send
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  public async put<T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  /**
   * Make a PATCH request
   * @param url URL to request
   * @param data Data to send
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  public async patch<T, D = unknown>(
    url: string,
    data: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  /**
   * Make a DELETE request
   * @param url URL to request
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  /**
   * Upload files
   * @param url URL to upload to
   * @param files File or files to upload
   * @param data Additional form data
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  public async uploadFile<T, D = unknown>(
    url: string,
    files: File | File[],
    data?: Record<string, D>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    } else {
      formData.append("file", files);
    }

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>({
      ...config,
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Upload files with query parameters
   * @param url URL to upload to
   * @param files File or files to upload
   * @param queryParams Query parameters to add to the URL
   * @param data Additional form data
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  public async uploadFileWithQuery<
    T,
    D = unknown,
    Q = Record<string, string | number | boolean>,
  >(
    url: string,
    files: File | File[],
    queryParams: Q,
    data?: Record<string, D>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    } else {
      formData.append("file", files);
    }

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>({
      ...config,
      method: "POST",
      url,
      params: queryParams,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Make a request with the given configuration
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({
        ...config,
        signal: this.signal,
      });

      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Initialize request and response interceptors
   *
   * Request Interceptor:
   * - Dynamically fetches fresh token from AWS Cognito
   * - No localStorage, no manual token management
   * - AWS handles refresh automatically
   */
  private initInterceptors() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // ✅ Dynamically get fresh token from AWS
        const token = await getAuthToken();

        if (token) {
          // Ensure headers object exists
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        return Promise.reject(error);
      }
    );
  }
}
