# Task 04 - Autenticacao e Onboarding

## Objetivo

Implementar cadastro, login, logout, recuperacao de senha, reenvio de confirmacao e criacao idempotente da taxonomia inicial.

## Escopo

- Fluxos publicos de auth.
- Validacao client/server.
- Feedback visual.
- Onboarding inicial.
- Persistencia de tour concluido/dispensado.

## Passos

1. Cadastro:
   - validar email.
   - senha com minimo de 6 caracteres.
   - confirmar igualdade entre senhas.
   - chamar Supabase Auth.
   - redirecionar para `/auth/sign-up-success`.
2. Login:
   - autenticar por email/senha.
   - apos sucesso, chamar `criar_categorias_padrao()`.
   - redirecionar para `redirectTo` ou `/dashboard`.
3. Logout:
   - chamar sign out.
   - limpar estado privado.
   - redirecionar para login.
4. Recuperacao de senha:
   - tela para solicitar email.
   - tela para redefinir senha quando callback chegar.
5. Reenvio de confirmacao:
   - acao em tela de sucesso ou login.
6. Onboarding:
   - criar modal/tour curto.
   - permitir pular.
   - persistir em `preferencias_usuario` ou tabela dedicada.
   - sugerir primeira acao: criar lancamento ou ajustar categorias.

## Criterios de aceite

- Senhas divergentes bloqueiam cadastro.
- Erro do provedor nao apaga campos.
- Categorias padrao nao duplicam.
- Falha no onboarding nao invalida conta.
- Usuario sem email confirmado respeita configuracao do Supabase.
