# DogManager

Sistema simples para gerenciar cachorros clientes (Next.js 15 + Prisma + Postgres/Neon + Tailwind).

## Setup

```bash
pnpm install
cp .env.example .env
# preencha DATABASE_URL (pooled) e DIRECT_URL (unpooled) com as URLs do Neon
# edite SESSION_PASSWORD com pelo menos 32 caracteres (openssl rand -base64 32)
pnpm prisma migrate dev --name init
pnpm db:seed
pnpm dev
```

Acesse http://localhost:3000 e faça login com:

- usuário: `fabi`
- senha: `fabi`

## Trocar a senha pelo DB

A senha fica como hash bcrypt na tabela `User`. Para gerar um novo hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('NOVASENHA', 10))"
```

Depois, no `npm run db:studio` ou direto via SQL:

```sql
UPDATE User SET passwordHash = '<hash-gerado>' WHERE username = 'fabi';
```

## Deploy

- **Vercel**: configure `DATABASE_URL` (pooled, com `-pooler` no host), `DIRECT_URL` (unpooled) e `SESSION_PASSWORD` em Project Settings → Environment Variables. O cliente Prisma usa o `@prisma/adapter-neon` (WebSocket) pra não estourar conexões em serverless.
- **Storage de fotos** (`public/uploads/`) ainda usa filesystem local — na Vercel o filesystem é efêmero, então antes do primeiro deploy troque pra object storage (Cloudflare R2, S3, Vercel Blob, etc).
- **Railway/Fly**: também funcionam apontando pro Neon; só precisam de volume pra `public/uploads/` enquanto o storage de fotos não for migrado.
