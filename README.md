# DogManager

Sistema simples para gerenciar cachorros clientes (Next.js 15 + Prisma + SQLite + Tailwind).

## Setup

```bash
npm install
cp .env.example .env
# edite SESSION_PASSWORD com pelo menos 32 caracteres (openssl rand -base64 32)
npx prisma migrate dev --name init
npm run db:seed
npm run dev
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

- **Railway/Fly** funciona com SQLite + volume persistente em `prisma/dev.db`.
- **Vercel** não funciona com SQLite (filesystem efêmero). Para usar a Vercel, troque o `provider` do `schema.prisma` para `postgresql` e use Neon/Supabase/Turso.
