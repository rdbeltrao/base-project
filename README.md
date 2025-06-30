# Test Pod - Guia de Desenvolvimento

## Visão Geral

Este é um projeto monorepo gerenciado com PNPM e Turborepo, contendo os seguintes componentes principais:

- **Backend**: API principal (Node.js/Express)
- **Auth**: Serviço de autenticação (funciona como um SSO, todas as aplicações usam um cookie compartilhado no dominio)
- **App**: Aplicação principal (é o portal do usuário)
- **Backoffice**: Interface administrativa (é o painel de administração)
- **Site**: Site institucional (landing page com os eventos em destaque e login)

## Pré-requisitos

- [Node.js](https://nodejs.org/)
- [PNPM](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- Conta Google Cloud Platform

## Configuração do Ambiente de Desenvolvimento

### 1. Clonando o Repositório

```bash
git clone https://github.com/seu-usuario/test-pod.git
cd test-pod
```

### 2. Instalando as Dependências

```bash
pnpm install
```

### 3. Configurando as Variáveis de Ambiente

Copie os arquivos de exemplo de variáveis de ambiente para cada aplicação:

```bash
# Para o backend
cp apps/backend/.env.example apps/backend/.env

# Para o app
cp apps/app/.env.example apps/app/.env

# Para o auth
cp apps/auth/.env.example apps/auth/.env

# Para o backoffice
cp apps/backoffice/.env.example apps/backoffice/.env

# Para o site
cp apps/site/.env.example apps/site/.env
```

Ajuste as variáveis de ambiente conforme necessário.

### 4. Garanta que exista um banco de dados ou inicie usando o docker-compose

```bash
docker-compose up -d
```

Este comando iniciará um contêiner PostgreSQL com as seguintes configurações:

- **Host**: localhost
- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: postgres
- **Database**: test_pod_db

### 5. Configurando o Redis

O Redis é utilizado para cache no backend. Existem duas opções para configurá-lo:

#### Opção 1: Usando Docker Compose (Recomendado)

Execute:

```bash
docker-compose up -d
```

#### Opção 2: Instalação Local

Alternativamente, você pode instalar o Redis localmente

#### Configuração no .env

Note que existe uma variável de ambiente `REDIS_URL` no arquivo `.env.example` do backend:

```
REDIS_URL=redis://localhost:6379
```

Você pode ajustar a URL conforme necessário.

### 6. Configurando a Integração com Google

A integração com o Google é necessária para adicionar eventos ao calendário dos usuários e também para login. Siga os passos abaixo para configurar:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá para "APIs e Serviços" > "Biblioteca"
4. Busque e ative as seguintes APIs:
   - Google Calendar API
   - Google OAuth 2.0
5. No menu lateral, vá para "APIs e Serviços" > "Credenciais"
6. Clique em "Criar Credenciais" > "ID do Cliente OAuth"
7. Configure a tela de consentimento OAuth:
   - Escolha o tipo de usuário (Externo ou Interno)
   - Adicione seu email como usuário de teste
8. Crie um ID de cliente OAuth:
   - Selecione "Aplicativo da Web" como tipo
   - Dê um nome à sua aplicação
   - Adicione URIs de redirecionamento autorizados:
     - `http://localhost:3000/api/auth/google/callback` (para desenvolvimento)
9. Anote o "ID do Cliente" e a "Chave Secreta do Cliente"

#### Configuração no .env

Adicione as seguintes variáveis ao arquivo `.env` do backend:

```
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=sua_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

**IMPORTANTE**: A integração com o Google Calendar não funcionará sem estas credenciais configuradas corretamente, porém o sistema irá funcionar sem elas.

### 7. Executando Migrações e Seeds

```bash
# Executa todas as migrações pendentes
cd packages/database
pnpm migrate:up

# Popula o banco de dados com dados iniciais
pnpm seed:all
```

### 8. Iniciando o Ambiente de Desenvolvimento

```bash
# Na raiz do projeto
turbo dev
```

Este comando iniciará todos os serviços em modo de desenvolvimento:

- **Backend**: http://localhost:3000
- **App**: http://localhost:3001
- **Auth**: http://localhost:3002
- **Backoffice**: http://localhost:3003
- **Site**: http://localhost:3004

## Estrutura do Projeto

````
.
├── apps/                 # Aplicações
│   ├── app/              # Aplicação principal
│   ├── auth/             # Serviço de autenticação
│   ├── backend/          # API principal
│   ├── backoffice/       # Interface administrativa
│   └── site/             # Site institucional
└── packages/             # Bibliotecas compartilhadas
    ├── database/         # Configuração do banco de dados, modelos e migrações
    └── ...               # Outras bibliotecas compartilhadas
```

## Testes

```bash
# Executar todos os testes
turbo test

# Executar testes específicos de um pacote
cd apps/backend
pnpm test
````

## Comandos Úteis

```bash
# Construir todos os pacotes
turbo build

# Verificar problemas de lint
turbo lint

# Corrigir problemas de lint
turbo lint:fix

# Formatar o código
turbo format

# Limpar caches e node_modules
turbo clean
```

## Sobre o funcionamento do sistema

O cadastro do usuário na tela de registro adiciona o usuário no grupo `user` (Criado nas migrations, caso não exista não funcionará)
O sistema de permissão macro funciona da seguinte forma:

- um usuário com a role `user` pode acessar o app
- um usuário com a role `admin` pode acessar o backoffice

Isto significa que para acessar o portal do usuário (app) é necessario estar no grupo `user`
