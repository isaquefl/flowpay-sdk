# Publicando o SDK no NPM

Este guia explica como publicar o `@flowpay/sdk` no npm.

## Pré-requisitos

1. **Conta no npm**: Crie uma conta em [npmjs.com](https://www.npmjs.com/signup)
2. **Node.js 18+**: Instale a versão LTS mais recente
3. **Conta no GitHub**: Para hospedar o código fonte

## Passo 1: Criar Repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `flowpay-sdk` ou `sdk-js`
3. Descrição: "SDK oficial para integração com a API FlowPay"
4. **Marque como Público** (obrigatório para npm público)
5. Adicione licença MIT
6. Clique em "Create repository"

## Passo 2: Fazer Upload do Código

```bash
# Clone o repositório vazio
git clone https://github.com/SEU_USUARIO/flowpay-sdk.git

# Copie os arquivos do SDK para a pasta
# (copie todo o conteúdo de packages/flowpay-sdk/)

# Entre na pasta
cd flowpay-sdk

# Instale as dependências
npm install

# Faça o build
npm run build

# Verifique se compilou corretamente
ls dist/
# Deve mostrar: index.js, index.mjs, index.d.ts
```

## Passo 3: Configurar npm

```bash
# Faça login no npm
npm login

# Verifique se está logado
npm whoami
```

## Passo 4: Publicar

### Primeira Publicação

```bash
# Publicar como pacote público (scoped packages são privados por padrão)
npm publish --access public
```

### Atualizações

```bash
# Atualizar versão (patch: 1.0.0 -> 1.0.1)
npm version patch

# Atualizar versão (minor: 1.0.0 -> 1.1.0)
npm version minor

# Atualizar versão (major: 1.0.0 -> 2.0.0)
npm version major

# Publicar nova versão
npm publish
```

## Passo 5: Verificar Publicação

Após publicar, verifique em:
- https://www.npmjs.com/package/@flowpay/sdk

Os usuários agora podem instalar:
```bash
npm install @flowpay/sdk
```

## Estrutura Final do Repositório

```
flowpay-sdk/
├── src/
│   ├── index.ts          # Entry point
│   ├── client.ts         # FlowPay class
│   ├── http.ts           # HTTP client
│   ├── types.ts          # TypeScript types
│   ├── errors.ts         # Custom errors
│   └── resources/
│       └── pix.ts        # PIX module
├── dist/                 # Build output (não commitar)
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── .gitignore
```

## Arquivo .gitignore

Crie um `.gitignore` na raiz:

```gitignore
node_modules/
dist/
*.log
.DS_Store
```

## Arquivo LICENSE

Crie um `LICENSE` com a licença MIT:

```
MIT License

Copyright (c) 2024 FlowPay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## GitHub Actions (Opcional)

Para publicar automaticamente quando criar uma release, crie `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Para configurar:
1. Vá em npmjs.com → Account Settings → Access Tokens
2. Crie um token do tipo "Automation"
3. No GitHub, vá em Settings → Secrets → Actions
4. Adicione `NPM_TOKEN` com o valor do token

## Dúvidas Comuns

### Erro "402 Payment Required"
Pacotes com escopo (@flowpay/sdk) são privados por padrão. Use `--access public`.

### Erro "403 Forbidden"
O nome do pacote já existe. Escolha outro nome ou use seu próprio escopo (@seuusuario/flowpay-sdk).

### Como mudar o escopo?
Edite o `package.json`:
```json
{
  "name": "@seuusuario/sdk-flow"
}
```

## Suporte

- **Documentação npm:** https://docs.npmjs.com/
- **GitHub Actions:** https://docs.github.com/en/actions
