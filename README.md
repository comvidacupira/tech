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
