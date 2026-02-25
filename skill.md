# Skill: Gestao de Roles com Clerk

## Objetivo
Permitir promover/rebaixar usuarios (`viewer`, `editor`, `admin`) sem entrar no dashboard do Clerk, usando:
- script local de bootstrap do primeiro admin
- endpoint admin na API
- tela no front (visivel apenas para `admin`)

## Pre-requisitos
- `CLERK_SECRET_KEY` configurada em `.env.local` (ou `scripts/.env.local`)
- API local rodando: `npm run api:start`
- Site local rodando (Jekyll)

## Bootstrap do primeiro admin
Se ainda nao existe nenhum admin, promova um usuario via terminal:

```bash
npm run clerk:role:set -- --userId user_xxx --role admin
```

ou por email:

```bash
npm run clerk:role:set -- --email seu@email.com --role admin
```

Depois:
1. Fazer logout/login no site
2. A secao **Gerenciar roles de usuario** aparecera para esse admin

## Comando util (trocar role)
```bash
npm run clerk:role:set -- --userId user_xxx --role editor
npm run clerk:role:set -- --userId user_xxx --role viewer
```

## Endpoint de administracao (somente admin)
- `PUT /api/admin/users/:userId/role`
- Body JSON:

```json
{
  "role": "admin"
}
```

Roles validas: `admin`, `editor`, `viewer`.

## Onde editar no Clerk Dashboard (opcional)
`Users` -> selecionar usuario -> `Metadata` -> `Public metadata`:

```json
{
  "role": "admin"
}
```

## Regras de permissao no projeto
- `admin` e `editor`: criar/editar/excluir/ativar/desativar aulas
- `viewer` (ou sem role): somente leitura
- tela de gestao de roles aparece apenas para `admin`

## Troubleshooting
- `401 unauthorized`:
  - verificar sessao ativa no Clerk
  - verificar envio do bearer token no front
- `403 forbidden`:
  - usuario autenticado sem role suficiente
- secao de role nao aparece:
  - usuario ainda nao e `admin`
  - fazer logout/login apos mudanca de role
- script falha ao setar role:
  - conferir `CLERK_SECRET_KEY`
  - conferir `userId`/email informado
