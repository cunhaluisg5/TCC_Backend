# Scan NFC-e Back-End

API principal do ecossistema Scan NFC-e, responsavel por autenticacao, recuperacao de senha, crawler da NFC-e e persistencia em Firebase Realtime Database.

## Responsabilidades

- cadastro e autenticacao de usuarios
- emissao e validacao de token
- recuperacao e redefinicao de senha
- crawler da NFC-e
- armazenamento e consulta de notas fiscais

## Arquitetura atual

```text
src/
  config/        configuracoes de ambiente e autenticacao
  controllers/   adaptadores HTTP
  db/            inicializacao do Firebase
  http/          bootstrap da aplicacao Express
  middlewares/   autenticacao e tratamento de erro
  modules/       integracoes auxiliares, como mailer
  repositories/  acesso a dados
  resources/     templates e arquivos estaticos usados pelo backend
  routes/        definicao publica das rotas
  services/      regras de negocio
  utils/         helpers HTTP e erros de dominio
```

## Variaveis de ambiente

Crie um `.env` a partir de `.env.example`.

Variaveis principais:

- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `RESET_APP_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_DATABASE_URL`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_SECURE`
- `MAIL_USER`
- `MAIL_PASS`
- `CORS_ORIGIN`

## Scripts

```bash
npm run dev
npm start
```

## Estado atual da modernizacao

Esta fase estabelece a base de configuracao segura do backend e introduz separacao em camadas, preservando os endpoints existentes.
