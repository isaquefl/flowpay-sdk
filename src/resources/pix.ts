/**
 * FlowPay PIX Resource
 */

import { HttpClient } from '../http';
import { ValidationError } from '../errors';
import type {
  CreatePixChargeParams,
  CreatePixChargeResponse,
  GetPixStatusResponse,
  ListPixChargesParams,
  ListPixChargesResponse,
  PixCharge,
} from '../types';

export class PixResource {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Cria uma nova cobrança PIX com QR Code
   *
   * @example
   * ```typescript
   * const charge = await flowpay.pix.create({
   *   value: 5000, // R$ 50,00
   *   description: 'Pedido #123',
   *   customer: {
   *     name: 'João Silva',
   *     email: 'joao@email.com'
   *   }
   * });
   *
   * console.log(charge.brCode); // Código PIX copia e cola
   * console.log(charge.qrCodeImage); // Base64 do QR Code
   * ```
   */
  async create(params: CreatePixChargeParams): Promise<PixCharge> {
    // Validações
    if (!params.value || typeof params.value !== 'number') {
      throw new ValidationError('value é obrigatório e deve ser um número');
    }

    if (params.value < 100) {
      throw new ValidationError('value deve ser no mínimo 100 (R$ 1,00 em centavos)');
    }

    if (params.expiresIn !== undefined && params.expiresIn < 60) {
      throw new ValidationError('expiresIn deve ser no mínimo 60 segundos');
    }

    if (params.expiresIn !== undefined && params.expiresIn > 86400) {
      throw new ValidationError('expiresIn deve ser no máximo 86400 segundos (24 horas)');
    }

    const response = await this.http.post<CreatePixChargeResponse>('/pix/create', {
      value: params.value,
      description: params.description,
      expiresIn: params.expiresIn,
      customer: params.customer,
    });

    return response.charge;
  }

  /**
   * Verifica o status de uma cobrança PIX
   *
   * Quando o status muda para COMPLETED, a API automaticamente:
   * - Desconta a taxa de processamento
   * - Adiciona o valor líquido ao saldo
   * - Dispara webhooks configurados
   *
   * @example
   * ```typescript
   * const charge = await flowpay.pix.getStatus('550e8400-e29b-41d4-a716-446655440000');
   *
   * if (charge.status === 'COMPLETED') {
   *   console.log('Pagamento confirmado em:', charge.paidAt);
   * }
   * ```
   */
  async getStatus(chargeId: string): Promise<PixCharge> {
    if (!chargeId || typeof chargeId !== 'string') {
      throw new ValidationError('chargeId é obrigatório');
    }

    const response = await this.http.get<GetPixStatusResponse>('/pix/status', {
      id: chargeId,
    });

    return response.charge;
  }

  /**
   * Lista todas as cobranças PIX com filtros opcionais
   *
   * @example
   * ```typescript
   * // Listar últimas 10 cobranças completadas
   * const { charges, count } = await flowpay.pix.list({
   *   limit: 10,
   *   status: 'completed'
   * });
   *
   * charges.forEach(charge => {
   *   console.log(`${charge.id}: R$ ${(charge.value / 100).toFixed(2)}`);
   * });
   * ```
   */
  async list(params: ListPixChargesParams = {}): Promise<ListPixChargesResponse> {
    if (params.limit !== undefined) {
      if (params.limit < 1 || params.limit > 100) {
        throw new ValidationError('limit deve estar entre 1 e 100');
      }
    }

    const response = await this.http.get<ListPixChargesResponse>('/pix/list', {
      limit: params.limit,
      status: params.status?.toLowerCase(),
    });

    return response;
  }

  /**
   * Alias para getStatus - verifica se uma cobrança foi paga
   *
   * @example
   * ```typescript
   * const isPaid = await flowpay.pix.isPaid('550e8400-e29b-41d4-a716-446655440000');
   * ```
   */
  async isPaid(chargeId: string): Promise<boolean> {
    const charge = await this.getStatus(chargeId);
    return charge.status === 'COMPLETED';
  }

  /**
   * Aguarda até que uma cobrança seja paga (polling)
   *
   * @example
   * ```typescript
   * try {
   *   const charge = await flowpay.pix.waitForPayment('charge-id', {
   *     timeout: 300000, // 5 minutos
   *     interval: 5000   // verifica a cada 5 segundos
   *   });
   *   console.log('Pago!', charge);
   * } catch (error) {
   *   if (error.code === 'TIMEOUT') {
   *     console.log('Timeout esperando pagamento');
   *   }
   * }
   * ```
   */
  async waitForPayment(
    chargeId: string,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<PixCharge> {
    const { timeout = 300000, interval = 5000 } = options; // 5 min timeout, 5s interval
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const charge = await this.getStatus(chargeId);

      if (charge.status === 'COMPLETED') {
        return charge;
      }

      if (charge.status === 'EXPIRED') {
        throw new ValidationError('Cobrança expirada');
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new ValidationError('Timeout aguardando pagamento');
  }
}
