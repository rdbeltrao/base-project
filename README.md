# Test Pod - Guia de Desenvolvimento

## Visão Geral

Este é um projeto monorepo gerenciado com PNPM e Turborepo, contendo os seguintes componentes principais:

- **Backend**: API principal (Node.js/Express)
- **Auth**: Serviço de autenticação
- **App**: Aplicação principal
- **Backoffice**: Interface administrativa
- **Site**: Site institucional
- **Frontend**: Frontend da aplicação

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão recomendada: >=18)
- [PNPM](https://pnpm.io/) (versão 10.11.0 ou superior)
- [PostgreSQL](https://www.postgresql.org/)

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

### 5. Executando Migrações e Seeds

```bash
# Executa todas as migrações pendentes
cd packages/database
pnpm migrate:up

# Popula o banco de dados com dados iniciais
pnpm seed:all
```

### 6. Iniciando o Ambiente de Desenvolvimento

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
│   ├── frontend/         # Frontend da aplicação
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
