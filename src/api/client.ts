// ============================================================================
// Core HTTP API Client for NestJS Backend Communication
// ============================================================================

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  statusCode: number;
  errorType?: string;
  validationErrors?: string[];

  constructor(message: string, statusCode = 500, errorType?: string, validationErrors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.validationErrors = validationErrors;
  }
}

class ApiClient {
  private customBaseUrl: string | null = null;
  private tokenKey = 'smartprint_jwt_token';
  private refreshTokenKey = 'smartprint_refresh_token';
  private baseUrlKey = 'smartprint_api_base_url';

  constructor() {
    // Check if custom URL was configured in browser
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem(this.baseUrlKey);
      if (savedUrl) {
        this.customBaseUrl = savedUrl;
      }
    }
  }

  /**
   * Obtém a URL base atual da API (VITE_API_URL, Custom URL ou /api)
   */
  public getBaseUrl(): string {
    if (this.customBaseUrl) {
      return this.customBaseUrl.replace(/\/$/, '');
    }
    const envUrl = (import.meta as any).env?.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
      return envUrl.replace(/\/$/, '');
    }
    return '/api';
  }

  /**
   * Define uma URL customizada para o backend NestJS (ex: http://localhost:3333 ou https://api.meuservidor.com)
   */
  public setBaseUrl(url: string | null): void {
    if (!url || url.trim() === '') {
      this.customBaseUrl = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.baseUrlKey);
      }
    } else {
      const cleanUrl = url.trim().replace(/\/$/, '');
      this.customBaseUrl = cleanUrl;
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.baseUrlKey, cleanUrl);
      }
    }
  }

  /**
   * Gerenciamento de Token JWT de Autenticação
   */
  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  public setToken(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  public clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  /**
   * Cria Headers padrão com JSON e Bearer Token
   */
  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Constrói Query String a partir de um objeto de parâmetros
   */
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        filtered[key] = String(value);
      }
    }
    const searchParams = new URLSearchParams(filtered);
    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
  }

  /**
   * Formata a URL do endpoint considerando a Base URL
   */
  private buildUrl(endpoint: string, queryParams?: Record<string, any>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const base = this.getBaseUrl();
    const qs = this.buildQueryString(queryParams);
    return `${base}${cleanEndpoint}${qs}`;
  }

  /**
   * Executa requisição HTTP tipada
   */
  public async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      queryParams?: Record<string, any>;
      headers?: Record<string, string>;
      timeoutMs?: number;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, queryParams, headers = {}, timeoutMs = 15000 } = options;
    const url = this.buildUrl(endpoint, queryParams);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Tratamento especial para status 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        let validationErrors: string[] | undefined;
        let errorType: string | undefined;

        if (isJson) {
          try {
            const errorData: ApiErrorResponse = await response.json();
            if (Array.isArray(errorData.message)) {
              validationErrors = errorData.message;
              errorMessage = errorData.message.join('; ');
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
            errorType = errorData.error;
          } catch {
            // fallback se falhar parsing
          }
        }

        throw new ApiError(errorMessage, response.status, errorType, validationErrors);
      }

      if (isJson) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new ApiError(`Tempo limite de requisição excedido (${timeoutMs}ms) ao conectar em ${url}`, 408);
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err.message || 'Falha de conexão com a API', 500);
    }
  }

  // Métodos auxiliares CRUD
  public get<T>(endpoint: string, queryParams?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', queryParams, headers });
  }

  public post<T>(endpoint: string, body?: any, queryParams?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, queryParams, headers });
  }

  public put<T>(endpoint: string, body?: any, queryParams?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, queryParams, headers });
  }

  public patch<T>(endpoint: string, body?: any, queryParams?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, queryParams, headers });
  }

  public delete<T>(endpoint: string, queryParams?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', queryParams, headers });
  }

  /**
   * Upload de arquivo (FormData / Multipart)
   */
  public async upload<T>(
    endpoint: string,
    file: File | Blob,
    fieldName = 'file',
    extraFields?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    if (extraFields) {
      for (const [key, value] of Object.entries(extraFields)) {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      }
    }

    const url = this.buildUrl(endpoint);
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(`Erro no upload: ${response.statusText}`, response.status);
    }

    return await response.json();
  }

  /**
   * Testa a conectividade com o Backend NestJS
   */
  public async ping(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const start = performance.now();
    try {
      const res = await this.get<{ status?: string; message?: string }>('/health');
      const latencyMs = Math.round(performance.now() - start);
      return {
        ok: true,
        message: res.status || res.message || 'API NestJS Conectada com Sucesso',
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        ok: false,
        message: err.message || 'Não foi possível conectar ao backend NestJS',
        latencyMs,
      };
    }
  }
}

export const apiClient = new ApiClient();
