# Contrato de modernizacao do backend

## Objetivo

Registrar o papel do backend no ecossistema e os riscos que precisam ser eliminados durante a profissionalizacao.

## Fluxos que nao podem quebrar

1. cadastro
2. login
3. recuperacao de senha
4. redefinicao de senha
5. crawler da NFC-e
6. gravacao, consulta e exclusao de notas
7. protecao por token nas rotas privadas

## Riscos atuais mapeados

- segredo JWT versionado em arquivo
- URL do reset hardcoded no template de e-mail
- ausencia de `.env.example`
- ausencia de contrato tecnico claro para evolucao da API

## Saidas entregues nesta fase

- configuracao JWT movida para ambiente
- URL do reset movida para ambiente
- arquivo `.env.example`
- README revisado
