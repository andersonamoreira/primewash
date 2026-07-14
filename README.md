# Prime Wash — Sistema de Gestão

Sistema de gestão de serviços para a Prime Wash Estética de Motos: cadastro de clientes e motos, checklist fotográfico de avarias, ordens de serviço, agenda, catálogo de serviços/preços, usuários e uma dashboard com indicadores do mês.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma ORM
- Auth.js (NextAuth) com login por e-mail/senha e perfis Administrador/Usuário
- Recharts (gráficos da dashboard)
- Docker + Docker Compose para deploy

## Desenvolvimento local

Pré-requisitos: Node.js 22+, um PostgreSQL acessível e as variáveis de ambiente do `.env` (veja `.env.example`).

```bash
npm install
npx prisma db push      # cria as tabelas a partir do schema
npm run db:seed         # cria o catálogo de serviços e o usuário admin padrão
npm run dev
```

Acesse `http://localhost:3000`. Usuário administrador padrão criado pelo seed:

- **E-mail:** `admin@primewash.com.br`
- **Senha:** `primewash123`

**Troque essa senha assim que possível**, em Usuários → editar o seu usuário.

## Deploy em produção (servidor próprio com Docker)

O projeto já vem com `Dockerfile` e `docker-compose.yml` prontos: um container para a aplicação e outro para o PostgreSQL, com volumes persistentes para o banco de dados e para as fotos do checklist.

### 1. Copiar o projeto para o servidor

Envie a pasta do projeto para o servidor (via `git clone`, `scp`, `rsync` etc.), excluindo `node_modules` e `.next` (não são necessários — a imagem Docker instala e builda tudo).

### 2. Configurar variáveis de ambiente

No servidor, dentro da pasta do projeto:

```bash
cp .env.example .env
nano .env
```

Defina:

- `POSTGRES_PASSWORD` — uma senha forte para o banco de dados.
- `AUTH_SECRET` — uma chave aleatória longa. Gere uma com `openssl rand -base64 32`.
- `APP_PORT` — porta que ficará exposta no servidor (padrão `3000`).

### 3. Build e start

```bash
docker compose up -d --build
```

Isso vai:

1. Construir a imagem da aplicação (instala dependências, gera o client do Prisma e faz o build do Next.js).
2. Subir o PostgreSQL com um volume persistente (`pgdata`).
3. Ao iniciar, o container da aplicação aguarda o banco ficar disponível, aplica as migrações do Prisma automaticamente (`prisma migrate deploy`) e popula o catálogo de serviços/usuário admin padrão (`prisma db seed` — seguro de rodar novamente, não duplica dados).
4. Iniciar a aplicação, acessível em `http://IP_DO_SERVIDOR:APP_PORT` (padrão porta `3000`).

Acompanhar os logs:

```bash
docker compose logs -f app
```

Parar/atualizar:

```bash
docker compose down          # para os containers (mantém os volumes/dados)
docker compose up -d --build # reconstrói e sobe novamente após alterações no código
```

### 4. Backup

Os dados persistem em dois volumes Docker:

- `pgdata` — banco de dados (clientes, motos, ordens de serviço, etc.)
- `uploads` — fotos do checklist de avarias

Para fazer backup do banco:

```bash
docker compose exec db pg_dump -U primewash primewash > backup-$(date +%Y%m%d).sql
```

### 5. Domínio e HTTPS (quando disponível)

Por enquanto o acesso é feito por IP:porta. Quando houver um domínio disponível, o caminho recomendado é colocar um **Nginx** (ou Caddy/Traefik) como proxy reverso na frente do container `app`, apontando o domínio para ele, e usar **Let's Encrypt** (via `certbot` ou o próprio Caddy) para emitir o certificado HTTPS automaticamente. Isso não exige nenhuma mudança no código da aplicação — apenas configuração do proxy reverso no servidor.

### 6. Deploy usando um PostgreSQL já existente no servidor

Se o servidor já tem um container PostgreSQL rodando (compartilhado com outras aplicações), use `docker-compose.prod.yml` em vez do `docker-compose.yml` padrão — ele **não** cria um novo container de banco, só a aplicação, e se conecta ao Postgres existente pela rede Docker dele.

1. Descubra a rede Docker do Postgres existente: `docker inspect <container_do_postgres> --format '{{json .NetworkSettings.Networks}}'`. Ajuste o nome da rede em `docker-compose.prod.yml` (`dec-db-shared` é só um exemplo).
2. Crie um usuário e um banco dedicados dentro do Postgres existente (evita usar a senha do superusuário compartilhado):
   ```bash
   docker exec <container_do_postgres> psql -U postgres -c "CREATE USER primewash WITH PASSWORD 'senha-forte-aqui';"
   docker exec <container_do_postgres> psql -U postgres -c "CREATE DATABASE bcoprime OWNER primewash;"
   ```
3. No `.env` do projeto, defina `DATABASE_URL` apontando para o container do Postgres pelo nome dele na rede Docker (não `localhost`):
   ```bash
   DATABASE_URL=postgres://primewash:senha-forte-aqui@<container_do_postgres>:5432/bcoprime
   ```
4. Suba só a aplicação:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

Isso não reinicia nem afeta o container do Postgres nem qualquer outra aplicação já rodando no servidor.

## Integração com o Google Calendar

O sistema pode sincronizar automaticamente cada Ordem de Serviço com um evento na Google Agenda da conta `primewashmoto@gmail.com`: ao abrir uma OS, um evento é criado; ao cancelar a OS, o evento é removido. A integração é **opcional** — se as variáveis abaixo não forem configuradas, o sistema funciona normalmente, só não sincroniza.

Ela usa uma **Conta de Serviço do Google**, que não exige login interativo nem expira (diferente de conectar uma conta de usuário comum).

### Passo a passo (uma única vez)

1. Acesse [console.cloud.google.com](https://console.cloud.google.com/) com qualquer conta Google (pode ser a sua, não precisa ser a `primewashmoto@gmail.com`).
2. Crie um novo projeto (ex: "Prime Wash").
3. No menu, vá em **APIs e Serviços → Biblioteca**, procure por **Google Calendar API** e clique em **Ativar**.
4. Vá em **APIs e Serviços → Credenciais → Criar Credenciais → Conta de serviço**. Dê um nome (ex: `prime-wash-agenda`) e clique em **Criar e continuar** → **Concluir** (pode pular a etapa de papéis/permissões).
5. Clique na conta de serviço criada → aba **Chaves** → **Adicionar chave → Criar nova chave** → tipo **JSON** → **Criar**. Um arquivo `.json` será baixado — guarde-o, ele não pode ser baixado de novo depois.
6. Abra o arquivo JSON baixado. Você vai precisar de dois campos dele: `client_email` e `private_key`.
7. Entre em [calendar.google.com](https://calendar.google.com/) **logado como `primewashmoto@gmail.com`**. Em **Configurações → Configurações de agenda**, selecione a agenda principal (ou crie uma agenda específica, tipo "Prime Wash - Agendamentos"), abra **Compartilhar com pessoas específicas → Adicionar pessoas** e cole o `client_email` da conta de serviço (algo como `prime-wash-agenda@prime-wash-xxxxx.iam.gserviceaccount.com`), com permissão **"Fazer alterações em eventos"**.
8. Preencha no `.env` (local) ou nas variáveis do servidor (produção):

```bash
GOOGLE_CLIENT_EMAIL="prime-wash-agenda@prime-wash-xxxxx.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...restante-da-chave...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID="primewashmoto@gmail.com"
```

**Atenção com `GOOGLE_PRIVATE_KEY`**: no arquivo JSON baixado, o campo `private_key` já vem com `\n` no lugar das quebras de linha — copie o valor exatamente como está no JSON (entre aspas, numa linha só) para a variável de ambiente.

9. Reinicie a aplicação (`docker compose up -d --build` em produção, ou `npm run dev` localmente). A partir daí, toda nova OS aberta já cria o evento correspondente na Google Agenda.

## Estrutura de dados

- **Clientes** e **Motos** (um cliente pode ter várias motos)
- **Serviços** e **preços por categoria de cilindrada** (Baixa/Média/Alta), cadastrados em Parâmetros
- **Ordens de Serviço (OS)** — reúnem cliente, moto, serviços contratados, forma de pagamento, status (Agendado → Em andamento → Concluído/Cancelado) e o checklist fotográfico de avarias
- **Usuários** do sistema, com perfis Administrador (acesso total) e Usuário comum (sem acesso a Usuários/Serviços)
