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

## Ativar/desativar aula (sem banco de dados)

Cada aula na galeria usa um botao com o atributo `data-enabled`.

- Aula ativa:
  - `data-enabled="true"`
- Aula desativada:
  - `data-enabled="false"`

Exemplo:

```html
<button
  class="video-card js-video-card"
  type="button"
  data-video-id="IldPMbfLb1E"
  data-title="Aula 2"
  data-description="Explorando a area de trabalho."
  data-enabled="false">
```

Quando uma aula esta com `data-enabled="false"`, ela aparece em cinza, fica marcada como desativada na lista e nao pode ser reproduzida.

### Botao de ativar/desativar (modo admin com Clerk)

O botao `Ativar/Desativar` aparece somente para usuario autenticado no Clerk.

Passos:

1. Configure o arquivo `.env.local` (raiz ou `_cursos/.env.local`) com:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. Gere a configuracao usada no site:
   - `powershell -ExecutionPolicy Bypass -File scripts/sync-clerk-env.ps1`
3. Rode o projeto normalmente com Jekyll.

Observacao de seguranca:

- Nunca exponha `CLERK_SECRET_KEY` no front-end.
- Neste projeto, somente a chave publica (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) e usada no navegador.

Fluxo recomendado:

1. Uma pessoa cria/edita as aulas em Markdown.
2. A outra revisa e aprova Pull Request.
3. Ao fazer merge na branch principal, o GitHub Pages atualiza o site automaticamente.
