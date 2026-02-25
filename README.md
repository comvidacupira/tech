# Curadoria de Aulas (GitHub Pages + Turso)

Site para organizar cursos e aulas. O conteudo das aulas agora vem do banco (Turso/libSQL), nao mais de blocos HTML dentro dos arquivos `.md`.

## Modelo de dados

Schema em `db/schema.sql`:

- `courses`: metadados do curso (slug, nome, resumo, ordem, imagem)
- `lessons`: aulas de cada curso (lesson_id, titulo, descricao, video_id, ordem, enabled)

Dados iniciais:

- `db/seed-data.mjs`
- `scripts/turso-seed.mjs`

## Estrutura dos arquivos de curso

Os arquivos em `_cursos/*.md` agora possuem apenas front matter (metadados e rota).  
Player, lista e galeria sao renderizados no layout `_layouts/course.html` e carregados via API por `assets/js/course-lessons.js`.

## API local

API em `http://localhost:3080` (`api/server.mjs`):

- `GET /api/courses`
- `GET /api/courses/:courseSlug/lessons`
- `GET /api/auth/me` (role do usuario autenticado)
- `PUT /api/admin/users/:userId/role` (somente admin)
- `POST /api/courses/:courseSlug/lessons`
- `PUT /api/courses/:courseSlug/lessons/:lessonId`
- `DELETE /api/courses/:courseSlug/lessons/:lessonId`
- `GET /api/lessons/status?course=...` (compatibilidade)
- `PUT /api/lessons/status`

## Setup

1. Instale dependencias:
   - `npm install`
2. Configure ambiente local:
   - Copie `.env.local.example` para `.env.local`
   - Ajuste `DATABASE_URL` para seu Turso local (`file:./db/local.db` ou `http://127.0.0.1:8080` via `turso dev`)
   - `NEXT_PUBLIC_DATABASE_URL` deve apontar para a API local (`http://localhost:3080`)
2. Migre e popule o banco:
   - `npm run db:setup`
3. Gere configuracao do front (Clerk + URL API):
   - `powershell -ExecutionPolicy Bypass -File scripts/sync-clerk-env.ps1`
4. Inicie API local:
   - `npm run api:start`
5. Em outro terminal, suba o site:
   - `bundle exec jekyll serve`

## Auth (Clerk)

Controle de permissao por role usa `publicMetadata.role` no Clerk:

- `admin` e `editor`: podem criar/editar/excluir/ativar/desativar aulas
- `viewer` (ou sem role): somente leitura

Para funcionar, a API precisa de `CLERK_SECRET_KEY` no ambiente e o front envia `Bearer token` nas rotas de escrita.
Admins tambem podem promover/rebaixar usuarios pela tela "Gerenciar roles de usuario".
Essa tela aparece apenas para usuarios com role `admin`.

### Bootstrap do primeiro admin

Se voce ainda nao tem nenhum admin, promova pelo terminal:

- por `userId`:
  - `npm run clerk:role:set -- --userId user_xxx --role admin`
- por email:
  - `npm run clerk:role:set -- --email seu@email.com --role admin`

Depois, faça login novamente e a seção "Gerenciar roles de usuario" aparecerá no curso.

### Onde ver/editar role no Clerk Dashboard

No Clerk, a role fica em `Users` -> selecione o usuario -> `Metadata` -> `Public metadata`.
Exemplo:

```json
{
  "role": "admin"
}
```

- Nunca exponha `CLERK_SECRET_KEY` no front-end.
- Apenas `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` deve ir para o navegador.
