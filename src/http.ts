/**
 * FlowPay HTTP Client
 */

import {
  FlowPayError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from './errors';

export interface HttpClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

export class HttpClient {
  private readonly config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = 'Erro desconhecido';
      let errorDetails: Record<string, unknown> | undefined;

      if (isJson) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData.details;
        } catch {
          // Ignora erro de parse
        }
      }

      switch (response.status) {
        case 400:
          throw new ValidationError(errorMessage, errorDetails);
        case 401:
          throw new AuthenticationError(errorMessage);
        case 403:
          throw new AuthenticationError('Chave de API inativa ou sem permissão');
        case 404:
          throw new NotFoundError(errorMessage);
        case 429:
          throw new RateLimitError(errorMessage);
        case 500:
        case 502:
        case 503:
        case 504:
          throw new ServerError(errorMessage);
        default:
          throw new FlowPayError(errorMessage, 'HTTP_ERROR', response.status, errorDetails);
      }
    }

    if (!isJson) {
      throw new FlowPayError('Resposta inválida do servidor', 'INVALID_RESPONSE');
    }

    return response.json();
  }

  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(path, this.config.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FlowPayError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FlowPayError('Timeout da requisição', 'TIMEOUT');
      }
      throw new FlowPayError(
        error instanceof Error ? error.message : 'Erro de conexão',
        'NETWORK_ERROR'
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    const url = new URL(path, this.config.baseUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof FlowPayError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FlowPayError('Timeout da requisição', 'TIMEOUT');
      }
      throw new FlowPayError(
        error instanceof Error ? error.message : 'Erro de conexão',
        'NETWORK_ERROR'
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
