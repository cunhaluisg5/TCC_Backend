# Scan NFC-e Back-End

API principal do ecossistema Scan NFC-e, responsavel por autenticacao, recuperacao de senha, crawler da NFC-e e persistencia em Firebase Realtime Database.

## Responsabilidades

- cadastro e autenticacao de usuarios
- emissao e validacao de token
- recuperacao e redefinicao de senha
- crawler da NFC-e
- armazenamento e consulta de notas fiscais
- documentacao publica da API via Swagger

## Arquitetura atual

```text
src/
  config/        configuracoes de ambiente e autenticacao
  controllers/   adaptadores HTTP
  db/            inicializacao do Firebase
  docs/          especificacao OpenAPI/Swagger
  http/          bootstrap da aplicacao Express
  middlewares/   autenticacao, rate limit, validacao e tratamento de erro
  modules/       integracoes auxiliares, como mailer
  repositories/  acesso a dados
  resources/     templates e arquivos estaticos usados pelo backend
  routes/        definicao publica das rotas
  services/      regras de negocio
  utils/         helpers HTTP, validacao e erros de dominio
  validators/    regras de validacao de payload
```

## Variaveis de ambiente

Crie um `.env` a partir de `.env.example`.

Variaveis principais:

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

## Documentacao da API

- Swagger UI: `/docs`
- OpenAPI JSON: `/docs.json`

## Seguranca aplicada

- `helmet` para headers de seguranca
- `express-rate-limit` para autenticacao e uso geral da API
- limite de payload JSON
- validacao de payload para auth, reset, crawler e NFC-e
- protecao de alteracao de usuario por dono do recurso
- protecao de leitura, edicao e exclusao de NFC-e por dono do recurso

## Scripts

```bash
npm run dev
npm start
npm run check:swagger
npm test
npm run ci
```

## Integracao continua

O repositório agora possui workflow em `.github/workflows/backend-ci.yml` para validar automaticamente:

- instalacao das dependencias com `npm ci`
- integridade da especificacao Swagger
- suite automatizada de testes

O pipeline nao depende de Firebase real nem de credenciais externas para a validacao atual, porque os testes usam mocks nos pontos de integracao.
