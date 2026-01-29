/**
 * FlowPay SDK Client
 */

import { HttpClient } from './http';
import { PixResource } from './resources/pix';
import { ValidationError } from './errors';
import type { FlowPayConfig } from './types';

const DEFAULT_BASE_URL = 'https://flowpayments.net/api';
const DEFAULT_TIMEOUT = 30000;

export class FlowPay {
  private readonly http: HttpClient;

  /**
   * Módulo PIX - Criar e gerenciar cobranças PIX
   */
  public readonly pix: PixResource;

  /**
   * Cria uma nova instância do cliente FlowPay
   *
   * @example
   * ```typescript
   * import { FlowPay } from '@flowpay/sdk';
   *
   * const flowpay = new FlowPay({
   *   apiKey: 'fp_live_sua_chave_aqui'
   * });
   *
   * // Ou simplesmente:
   * const flowpay = new FlowPay('fp_live_sua_chave_aqui');
   * ```
   */
  constructor(config: FlowPayConfig | string) {
    // Permite passar apenas a API key como string
    const normalizedConfig: FlowPayConfig =
      typeof config === 'string' ? { apiKey: config } : config;

    // Validação da API key
    if (!normalizedConfig.apiKey) {
      throw new ValidationError('apiKey é obrigatória');
    }

    if (!normalizedConfig.apiKey.startsWith('fp_')) {
      throw new ValidationError(
        'apiKey inválida. Deve começar com "fp_live_" ou "fp_test_"'
      );
    }

    // Configura o cliente HTTP
    this.http = new HttpClient({
      baseUrl: normalizedConfig.baseUrl || DEFAULT_BASE_URL,
      apiKey: normalizedConfig.apiKey,
      timeout: normalizedConfig.timeout || DEFAULT_TIMEOUT,
    });

    // Inicializa os recursos
    this.pix = new PixResource(this.http);
  }

  /**
   * Retorna se está usando ambiente de teste
   */
  get isTestMode(): boolean {
    return this.http['config'].apiKey.includes('_test_');
  }

  /**
   * Retorna se está usando ambiente de produção
   */
  get isLiveMode(): boolean {
    return this.http['config'].apiKey.includes('_live_');
  }
}
