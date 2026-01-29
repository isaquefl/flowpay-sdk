/**
 * FlowPay SDK - SDK oficial para integração com a API FlowPay
 *
 * @packageDocumentation
 * @module @flowpay/sdk
 *
 * @example
 * ```typescript
 * import { FlowPay } from '@flowpay/sdk';
 *
 * // Inicializar o cliente
 * const flowpay = new FlowPay('fp_live_sua_chave_aqui');
 *
 * // Criar cobrança PIX
 * const charge = await flowpay.pix.create({
 *   value: 5000, // R$ 50,00 em centavos
 *   description: 'Pedido #123'
 * });
 *
 * console.log(charge.brCode); // Código PIX copia e cola
 * console.log(charge.qrCodeImage); // QR Code em base64
 *
 * // Verificar status
 * const status = await flowpay.pix.getStatus(charge.id);
 * console.log(status.status); // 'ACTIVE', 'COMPLETED' ou 'EXPIRED'
 * ```
 */

// Main client
export { FlowPay } from './client';

// Resources
export { PixResource } from './resources/pix';

// Errors
export {
  FlowPayError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from './errors';

// Types
export type {
  FlowPayConfig,
  Customer,
  CreatePixChargeParams,
  PixCharge,
  PixChargeStatus,
  ListPixChargesParams,
  ListPixChargesResponse,
  CreatePixChargeResponse,
  GetPixStatusResponse,
  CreateCardChargeParams,
  CardCharge,
  CardChargeStatus,
  FlowPayErrorResponse,
} from './types';

// Default export
export { FlowPay as default } from './client';
