# 💸 @flowpay/sdk

![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A516-339933?logo=nodedotjs&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Fork](https://img.shields.io/badge/Fork-adaptado-orange)

> 🍴 **Este repositório é um FORK de [`codedbyflow/flowpay-sdk`](https://github.com/codedbyflow/flowpay-sdk)**, projeto original de **Kaio Silva** ([@codedbyflow](https://github.com/codedbyflow)), sob licença **MIT**.
> Adaptado e mantido por **[Isaque Félix](https://github.com/isaquefl)** com melhorias de segurança, documentação e organização. Todo o crédito do código original permanece com o autor.

SDK oficial para integração com a API FlowPay - Pagamentos PIX e Cartão.

## Instalação

```bash
npm install @flowpay/sdk
# ou
yarn add @flowpay/sdk
# ou
pnpm add @flowpay/sdk
```

## ⚙️ Configuração via .env (recomendado)

Nunca coloque sua chave de API diretamente no código. Use variáveis de ambiente:

```bash
cp .env.example .env   # preencha FLOWPAY_API_KEY
```

| Variável | Descrição |
| --- | --- |
| `FLOWPAY_API_KEY` | Chave de API da FlowPay (`fp_test_xxx` para testes, `fp_live_xxx` para produção) |

```typescript
import { FlowPay } from '@flowpay/sdk';

const flowpay = new FlowPay(process.env.FLOWPAY_API_KEY!);
```

## Início Rápido

```typescript
import { FlowPay } from '@flowpay/sdk';

// Inicializar o cliente (chave via variável de ambiente)
const flowpay = new FlowPay(process.env.FLOWPAY_API_KEY!);

// Criar cobrança PIX
const charge = await flowpay.pix.create({
  value: 5000, // R$ 50,00 em centavos
  description: 'Pedido #123',
  customer: {
    name: 'João Silva',
    email: 'joao@email.com',
  },
});

console.log(charge.brCode); // Código PIX copia e cola
console.log(charge.qrCodeImage); // QR Code em base64
```

## Uso

### Configuração

```typescript
import { FlowPay } from '@flowpay/sdk';

// Configuração simples (apenas API key)
const flowpay = new FlowPay(process.env.FLOWPAY_API_KEY!);

// Configuração completa
const flowpay = new FlowPay({
  apiKey: process.env.FLOWPAY_API_KEY!,
  baseUrl: 'https://flowpayments.net/api', // opcional
  timeout: 30000, // opcional, em ms
});

// Verificar ambiente
console.log(flowpay.isTestMode); // true se usando fp_test_xxx
console.log(flowpay.isLiveMode); // true se usando fp_live_xxx
```

### PIX

#### Criar Cobrança

```typescript
const charge = await flowpay.pix.create({
  value: 5000, // Valor em centavos (R$ 50,00)
  description: 'Pedido #123',
  expiresIn: 3600, // Expira em 1 hora (opcional)
  customer: {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999999999',
    taxId: '12345678900', // CPF ou CNPJ
  },
});

// Retorno
console.log(charge.id); // ID da cobrança
console.log(charge.correlationId); // ID de correlação
console.log(charge.brCode); // Código para copiar e colar
console.log(charge.qrCodeImage); // Imagem do QR Code em base64
console.log(charge.status); // 'ACTIVE'
console.log(charge.expiresAt); // Data de expiração
```

#### Verificar Status

```typescript
const charge = await flowpay.pix.getStatus('550e8400-e29b-41d4-a716-446655440000');

console.log(charge.status); // 'ACTIVE', 'COMPLETED' ou 'EXPIRED'

if (charge.status === 'COMPLETED') {
  console.log('Pago em:', charge.paidAt);
}
```

#### Verificar se Foi Pago

```typescript
const isPaid = await flowpay.pix.isPaid('550e8400-e29b-41d4-a716-446655440000');

if (isPaid) {
  console.log('Pagamento confirmado!');
}
```

#### Aguardar Pagamento (Polling)

```typescript
try {
  const charge = await flowpay.pix.waitForPayment('charge-id', {
    timeout: 300000, // 5 minutos (padrão)
    interval: 5000, // Verifica a cada 5 segundos (padrão)
  });

  console.log('Pagamento confirmado!', charge);
} catch (error) {
  if (error.message.includes('Timeout')) {
    console.log('Timeout aguardando pagamento');
  }
}
```

#### Listar Cobranças

```typescript
const { charges, count } = await flowpay.pix.list({
  limit: 10, // Máximo 100
  status: 'completed', // 'active', 'completed', 'expired'
});

charges.forEach((charge) => {
  console.log(`${charge.id}: R$ ${(charge.value / 100).toFixed(2)} - ${charge.status}`);
});
```

## Tratamento de Erros

O SDK fornece classes de erro específicas para diferentes situações:

```typescript
import {
  FlowPay,
  FlowPayError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '@flowpay/sdk';

try {
  const charge = await flowpay.pix.create({ value: 50 }); // valor inválido
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Erro de validação:', error.message);
    console.log('Código:', error.code); // 'VALIDATION_ERROR'
  } else if (error instanceof AuthenticationError) {
    console.log('Erro de autenticação:', error.message);
  } else if (error instanceof NotFoundError) {
    console.log('Recurso não encontrado:', error.message);
  } else if (error instanceof RateLimitError) {
    console.log('Rate limit excedido:', error.message);
  } else if (error instanceof ServerError) {
    console.log('Erro do servidor:', error.message);
  } else if (error instanceof FlowPayError) {
    console.log('Erro FlowPay:', error.message);
    console.log('Código:', error.code);
    console.log('Status HTTP:', error.statusCode);
  }
}
```

## TypeScript

O SDK é escrito em TypeScript e fornece tipos completos:

```typescript
import type {
  FlowPayConfig,
  Customer,
  CreatePixChargeParams,
  PixCharge,
  PixChargeStatus,
  ListPixChargesParams,
} from '@flowpay/sdk';

const config: FlowPayConfig = {
  apiKey: process.env.FLOWPAY_API_KEY!,
  timeout: 60000,
};

const params: CreatePixChargeParams = {
  value: 5000,
  description: 'Pedido #123',
  customer: {
    name: 'João',
    email: 'joao@email.com',
  },
};
```

## Exemplos

### E-commerce

```typescript
import { FlowPay } from '@flowpay/sdk';

const flowpay = new FlowPay(process.env.FLOWPAY_API_KEY!);

async function createOrderPayment(orderId: string, amount: number, customer: any) {
  // Criar cobrança
  const charge = await flowpay.pix.create({
    value: amount * 100, // Converter para centavos
    description: `Pedido #${orderId}`,
    expiresIn: 1800, // 30 minutos
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      taxId: customer.cpf,
    },
  });

  // Salvar no banco de dados
  await saveCharge(orderId, charge.id);

  return {
    chargeId: charge.id,
    qrCode: charge.qrCodeImage,
    copyPaste: charge.brCode,
    expiresAt: charge.expiresAt,
  };
}

async function checkPaymentStatus(chargeId: string) {
  const charge = await flowpay.pix.getStatus(chargeId);
  return charge.status;
}
```

### Webhook Handler

```typescript
import { FlowPay } from '@flowpay/sdk';

const flowpay = new FlowPay(process.env.FLOWPAY_API_KEY!);

async function handleWebhook(payload: any) {
  if (payload.event === 'pix.received') {
    const { chargeId } = payload.data;

    // Verificar status (opcional, webhook já confirma)
    const charge = await flowpay.pix.getStatus(chargeId);

    if (charge.status === 'COMPLETED') {
      // Processar pagamento
      await processPayment(chargeId, charge.value);
    }
  }
}
```

## Status das Cobranças

| Status      | Descrição                        |
| ----------- | -------------------------------- |
| `ACTIVE`    | Aguardando pagamento             |
| `COMPLETED` | Pagamento confirmado             |
| `EXPIRED`   | Cobrança expirada (não foi paga) |

## Taxas de Processamento

Quando um pagamento é confirmado, a taxa é calculada automaticamente:

| Valor da Cobrança | Taxa         |
| ----------------- | ------------ |
| Até R$ 35,00      | R$ 1,00 fixo |
| Acima de R$ 35,00 | 3% do valor  |

## Links Úteis

- **Dashboard:** https://flowpayments.net
- **Documentação API:** https://flowpayments.net/docs
- **Gerenciar API Keys:** https://flowpayments.net/dashboard/api
- **Configurar Webhooks:** https://flowpayments.net/dashboard/webhooks

## Suporte

- **WhatsApp:** +55 11 93620-3588
- **Chat:** https://chat.flowpayments.net

## 🔒 Melhorias aplicadas neste fork

- **Segurança**: exemplos do README atualizados para usar `process.env.FLOWPAY_API_KEY` em vez de chaves literais no código
- **`.env.example`** adicionado e documentado (bilíngue)
- **README** profissional e bilíngue (PT/EN), com créditos ao autor original

## Licença

**MIT** © FlowPay / Kaio Silva — veja o arquivo [`LICENSE`](LICENSE).

---

# 💸 @flowpay/sdk (English)

> 🍴 **This repository is a FORK of [`codedbyflow/flowpay-sdk`](https://github.com/codedbyflow/flowpay-sdk)**, originally created by **Kaio Silva** ([@codedbyflow](https://github.com/codedbyflow)) under the **MIT** license.
> Adapted and maintained by **[Isaque Félix](https://github.com/isaquefl)** with security, documentation and organization improvements. Full credit for the original code remains with the author.

Official SDK for the FlowPay API — PIX and card payments for Brazil, written in TypeScript with complete type definitions.

## Installation

```bash
npm install @flowpay/sdk
```

## Configuration (.env)

Never hardcode your API key. Copy `.env.example` to `.env` and set:

| Variable | Description |
| --- | --- |
| `FLOWPAY_API_KEY` | Your FlowPay API key (`fp_test_xxx` for sandbox, `fp_live_xxx` for production) |

## Quick Start

```typescript
import { FlowPay } from '@flowpay/sdk';

const flowpay = new FlowPay(process.env.FLOWPAY_API_KEY!);

const charge = await flowpay.pix.create({
  value: 5000, // BRL 50.00 in cents
  description: 'Order #123',
  customer: { name: 'João Silva', email: 'joao@email.com' },
});

console.log(charge.brCode);      // PIX copy-and-paste code
console.log(charge.qrCodeImage); // base64 QR code
```

Other PIX methods: `getStatus(id)`, `isPaid(id)`, `waitForPayment(id, { timeout, interval })` and `list({ limit, status })`. Typed error classes are exported (`ValidationError`, `AuthenticationError`, `NotFoundError`, `RateLimitError`, `ServerError`, `FlowPayError`).

## Charge statuses

| Status | Description |
| --- | --- |
| `ACTIVE` | Awaiting payment |
| `COMPLETED` | Payment confirmed |
| `EXPIRED` | Charge expired (unpaid) |

## Improvements in this fork

- **Security**: README examples now use `process.env.FLOWPAY_API_KEY` instead of literal keys
- Added a documented bilingual **`.env.example`**
- Professional bilingual **README** with proper credits

## License

**MIT** © FlowPay / Kaio Silva — see [`LICENSE`](LICENSE).
