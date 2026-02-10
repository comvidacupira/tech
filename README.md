# Curadoria de Aulas (GitHub Pages)

Site simples para organizar aulas por curso (Hardware, Windows, Word e Internet), com manutencao por Markdown.

## Como editar aulas (so Markdown)

Cada curso fica em um arquivo dentro de `_cursos/`:

- `_cursos/hardware.md`
- `_cursos/windows.md`
- `_cursos/word.md`
- `_cursos/internet.md`

Para adicionar uma nova aula, edite a secao `## Aulas` com a lista numerada:

```md
1. Aula 01 - Descricao
2. Aula 02 - Descricao
3. Aula 03 - Descricao
4. Aula 04 - Nova aula
```

Se quiser, adicione o link da aula em `## Links sugeridos`.

## Publicar no GitHub Pages

1. Crie um repositorio no GitHub e envie estes arquivos.
2. No GitHub, acesse `Settings` > `Pages`.
3. Em `Build and deployment`, selecione:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (ou `master`) e pasta `/ (root)`
4. Salve e aguarde o deploy.
5. O site ficara disponivel na URL do GitHub Pages do repositorio.

## Trabalho em dupla (colaboracao)

Fluxo recomendado:

1. Uma pessoa cria/edita as aulas em Markdown.
2. A outra revisa e aprova Pull Request.
3. Ao fazer merge na branch principal, o GitHub Pages atualiza o site automaticamente.

## Login e progresso de video (Supabase)

A pagina `_cursos/windows.md` ja possui um exemplo completo com:

1. Cadastro e login do aluno.
2. Player YouTube embutido.
3. Salvamento de progresso por usuario.

### 1) Criar projeto Supabase

1. Crie um projeto em https://supabase.com.
2. Copie `Project URL` e `anon public key`.
3. No arquivo `_cursos/windows.md`, substitua:
   - `COLE_AQUI_SUPABASE_URL`
   - `COLE_AQUI_SUPABASE_ANON_KEY`

### 2) Criar tabela de progresso (SQL Editor)

```sql
create table if not exists public.video_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_id text not null,
  video_id text not null,
  watched_seconds integer not null default 0,
  duration_seconds integer,
  last_position_seconds integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_id)
);

alter table public.video_progress enable row level security;

create policy "select own progress"
on public.video_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "insert own progress"
on public.video_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "update own progress"
on public.video_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### 3) Auth no Supabase

1. Em `Authentication > Providers`, mantenha `Email` ativo.
2. Opcional: em `Authentication > Email`, desative confirmacao por email para testes mais rapidos.
