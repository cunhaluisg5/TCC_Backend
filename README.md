# Scan NFC-e Backend

API principal do ecossistema Scan NFC-e. Este projeto concentra autenticação, recuperação de senha, captura de NFC-e, persistência em Firebase Realtime Database e documentação pública das rotas.

## Visão geral

O backend atende três clientes do ecossistema:

- `Scan_NFCe`: aplicativo mobile principal
- `Scan_NFCe_Reset`: aplicação web de redefinição de senha
- `Scan_NFCe_Help`: central de ajuda com acesso ao Swagger

## Responsabilidades

- cadastro e autenticação de usuários
- emissão, validação e expiração de token
- recuperação e redefinição de senha
- captura e normalização de NFC-e
- armazenamento, consulta e exclusão de notas fiscais
- documentação da API com Swagger/OpenAPI
- validações, rate limit e proteção de rotas

## Stack

- Node.js
- Express
- Firebase Admin SDK
- JWT
- Nodemailer
- Swagger UI Express
- Jest + Supertest

## Estrutura do projeto

```text
src/
  config/        configuração de ambiente e autenticação
  controllers/   adaptadores HTTP
  db/            inicialização do Firebase
  docs/          especificação OpenAPI/Swagger
  http/          bootstrap da aplicação Express
  middlewares/   autenticação, rate limit, validação e tratamento de erro
  modules/       integrações auxiliares, como mailer
  repositories/  acesso a dados
  resources/     templates e arquivos estáticos do backend
  routes/        definição pública das rotas
  services/      regras de negócio
  utils/         helpers HTTP, validação e erros de domínio
  validators/    regras de validação de payload
```

## Variáveis de ambiente

Crie um arquivo `.env` a partir de `.env.example`.

Principais variáveis:

- `PORT`
- `PUBLIC_BASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `RESET_APP_URL`
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_MAX`
- `JSON_LIMIT`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_DATABASE_URL`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_SECURE`
- `MAIL_USER`
- `MAIL_PASS`

## Pré-requisitos

- Node.js compatível com o projeto
- npm
- credenciais válidas do Firebase
- configuração SMTP para envio de e-mails

## Como executar localmente

```bash
npm install
npm run dev
```

Scripts úteis:

```bash
npm start
npm run dev
npm test
npm run check:swagger
npm run ci
```

## Docker

O backend já está preparado para execução em container com leitura de variáveis a partir do arquivo `.env`.

### Build manual da imagem

```bash
docker build -t scan-nfce-backend .
```

```bash
docker run --rm --env-file .env -p 3000:3000 scan-nfce-backend
```

### Subida com Docker Compose

```bash
docker compose up --build
```

A API ficará disponível em `http://localhost:3000`.

## Documentação da API

- Swagger UI: `/docs`
- OpenAPI JSON: `/docs.json`

## Fluxos cobertos

1. Cadastro, login e persistência de sessão.
2. Recuperação de senha com geração e validação de token.
3. Consulta do QR Code da NFC-e e normalização dos dados retornados.
4. Salvamento, leitura e exclusão de notas por usuário autenticado.
5. Suporte às análises e comparações consumidas pelo aplicativo.

## Segurança aplicada

- `helmet` para cabeçalhos de segurança
- `cors` configurável por ambiente
- `express-rate-limit` para autenticação e uso geral
- validação de payloads nas rotas críticas
- proteção de recursos por usuário autenticado
- remoção de segredos do código-fonte

## Testes e CI

- testes automatizados com `jest` e `supertest`
- verificação da especificação Swagger
- workflow de GitHub Actions para instalação, validação e testes

## Troubleshooting

- erro ao enviar e-mail: revise SMTP e credenciais em `.env`
- erro de autenticação: valide `JWT_SECRET`, `JWT_EXPIRES_IN` e o relógio do ambiente
- falha no crawler: confirme conectividade externa e disponibilidade do portal fiscal
- erro de CORS: ajuste `CORS_ORIGIN` para os clientes que consumirão a API
- container sobe, mas a API falha ao acessar o Firebase: revise `FIREBASE_PRIVATE_KEY` e demais variáveis obrigatórias

## Publicação e operação

- configure URLs públicas coerentes em `PUBLIC_BASE_URL` e `RESET_APP_URL`
- mantenha segredos apenas em variáveis de ambiente
- revise logs e limites antes do ambiente de produção
- use a mesma configuração do `.env` em orquestradores como Docker, serviços cloud ou VPS

## Capturas de tela

Este repositório não usa prints no `README`, porque seu foco é API e operação técnica.

## Roadmap

- ampliar cobertura dos fluxos críticos do crawler
- consolidar observabilidade e logs estruturados
- preparar checklist final de produção