import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

/**
 * Clean HttpClient class without middleware complexity
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private signal?: AbortSignal;
  private accessToken: string = localStorage.getItem("access_token") || "";

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
   * Set the authentication token
   * @param token Token to set or undefined to clear
   */
  public setToken(token?: string): void {
    this.accessToken = token || "";
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  /**
   * Get the current authentication token
   * @returns The current token
   */
  public getToken(): string {
    return this.accessToken;
  }

  /**
   * Make a GET request
   * @param url URL to request
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: "GET", url, ...config });
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
    return this.request<T>({ method: "POST", url, data, ...config });
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
    return this.request<T>({ method: "PUT", url, data, ...config });
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
    return this.request<T>({ method: "PATCH", url, data, ...config });
  }

  /**
   * Make a DELETE request
   * @param url URL to request
   * @param config Axios configuration
   * @returns Promise with the response data
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: "DELETE", url, ...config });
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
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
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
      method: "POST",
      url,
      params: queryParams,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
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
      if (axios.isCancel(error)) {
        console.info("Request was cancelled");
      } else if (error instanceof AxiosError) {
        console.error("Request failed:", error.message);
      }

      return Promise.reject(error);
    }
  }

  /**
   * Initialize request and response interceptors
   */
  private initInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken();

        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        console.error("Request failed with error", error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error instanceof AxiosError && error.response?.status === 401) {
          console.error("Unauthorized request");
        }

        return Promise.reject(error);
      }
    );
  }
}
