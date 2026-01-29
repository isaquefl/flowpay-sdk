/**
 * FlowPay SDK Types
 */

// ============================================
// Configuration
// ============================================

export interface FlowPayConfig {
  /** Sua chave de API (fp_live_xxx ou fp_test_xxx) */
  apiKey: string;
  /** URL base da API (opcional, padrão: https://flowpayments.net/api) */
  baseUrl?: string;
  /** Timeout em ms (opcional, padrão: 30000) */
  timeout?: number;
}

// ============================================
// Customer
// ============================================

export interface Customer {
  /** Nome do cliente */
  name?: string;
  /** E-mail do cliente */
  email?: string;
  /** Telefone do cliente */
  phone?: string;
  /** CPF ou CNPJ do cliente */
  taxId?: string;
}

// ============================================
// PIX Types
// ============================================

export interface CreatePixChargeParams {
  /** Valor em centavos (mínimo 100 = R$ 1,00) */
  value: number;
  /** Descrição da cobrança */
  description?: string;
  /** Tempo de expiração em segundos (padrão: 3600) */
  expiresIn?: number;
  /** Dados do cliente */
  customer?: Customer;
}

export interface PixCharge {
  /** ID único da cobrança */
  id: string;
  /** ID de correlação */
  correlationId: string;
  /** Valor em centavos */
  value: number;
  /** Status da cobrança */
  status: PixChargeStatus;
  /** Código BR para copiar e colar */
  brCode?: string;
  /** Imagem do QR Code em base64 */
  qrCodeImage?: string;
  /** Data de expiração */
  expiresAt?: string;
  /** Descrição */
  description?: string;
  /** Nome do cliente */
  customerName?: string;
  /** Data de criação */
  createdAt?: string;
  /** Data do pagamento */
  paidAt?: string;
  /** Dados do cliente */
  customer?: Customer;
}

export type PixChargeStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

export interface ListPixChargesParams {
  /** Quantidade de resultados (máx: 100, padrão: 20) */
  limit?: number;
  /** Filtrar por status */
  status?: PixChargeStatus | Lowercase<PixChargeStatus>;
}

export interface ListPixChargesResponse {
  success: boolean;
  charges: PixCharge[];
  count: number;
}

export interface CreatePixChargeResponse {
  success: boolean;
  charge: PixCharge;
}

export interface GetPixStatusResponse {
  success: boolean;
  charge: PixCharge;
}

// ============================================
// Card Types (futuro)
// ============================================

export interface CreateCardChargeParams {
  /** Valor em centavos */
  value: number;
  /** Descrição da cobrança */
  description?: string;
  /** Dados do cliente */
  customer?: Customer;
  /** Número de parcelas (1-12) */
  installments?: number;
}

export interface CardCharge {
  id: string;
  value: number;
  status: CardChargeStatus;
  checkoutUrl?: string;
  description?: string;
  customer?: Customer;
  createdAt?: string;
  paidAt?: string;
}

export type CardChargeStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// ============================================
// Error Types
// ============================================

export interface FlowPayErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
