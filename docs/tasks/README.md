# Finnext - Plano de Implementacao

Este diretorio organiza o PRD em tasks executaveis para desenvolver o Finnext com Next.js, Supabase e Vercel.

Use estes arquivos como roteiro incremental: cada task tem objetivo, escopo, passos de implementacao, validacoes e criterios de aceite. A ordem foi pensada para reduzir risco: primeiro contrato de banco e seguranca, depois fluxos de produto, depois relatorios, privacidade, observabilidade e deploy.

## Ordem recomendada

1. [00 - Setup do projeto](./00-setup-projeto.md)
2. [01 - Supabase: projeto, ambientes e schema base](./01-supabase-schema-base.md)
3. [02 - Supabase: RLS, policies, RPCs e triggers](./02-supabase-rls-rpcs-triggers.md)
4. [03 - Next.js: estrutura, design system e clientes Supabase](./03-nextjs-estrutura-base.md)
5. [04 - Autenticacao e onboarding](./04-auth-onboarding.md)
6. [05 - Categorias e subcategorias](./05-categorias-subcategorias.md)
7. [06 - Lancamentos](./06-lancamentos.md)
8. [07 - Orcamentos](./07-orcamentos.md)
9. [08 - Dashboard](./08-dashboard.md)
10. [09 - Relatorios e exportacoes](./09-relatorios-exportacoes.md)
11. [10 - Configuracoes, privacidade e conta](./10-configuracoes-privacidade.md)
12. [11 - Qualidade, testes e observabilidade](./11-qualidade-testes-observabilidade.md)
13. [12 - Vercel: deploy, ambientes e operacao](./12-vercel-deploy-operacao.md)

## Principios de implementacao

- Supabase e a fonte de verdade para identidade, isolamento, integridade financeira e operacoes transacionais.
- O cliente nunca envia `usuario_id` como autoridade. O usuario sempre vem da sessao.
- `valor_gasto` e derivado dos lancamentos e deve ser reconstruivel.
- Exclusoes que afetam historico financeiro devem preferir inativacao logica.
- Dashboard, lista de lancamentos, orcamentos e relatorios devem bater para o mesmo usuario e periodo.
- Vercel recebe apenas variaveis publicas seguras no frontend; segredos ficam somente em server actions, route handlers ou ambiente protegido.

## Definition of Done global

- Regras do PRD cobertas por testes ou validacao manual documentada.
- RLS testado contra acesso cruzado entre usuarios.
- Estados de loading, vazio, erro e sucesso implementados.
- Interface responsiva a partir de 360 px e navegavel por teclado.
- Deploy em preview validado antes de producao.
- Nenhum log contem senha, token ou conteudo financeiro sensivel desnecessario.
