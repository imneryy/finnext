# Task 10 - Configuracoes, Privacidade e Conta

## Objetivo

Implementar configuracoes de perfil, preferencias, exportacao de dados pessoais e preparar exclusao segura de conta.

## Escopo

- Perfil.
- Preferencias de notificacao.
- Exportacao JSON.
- Fluxo de exclusao de conta.
- Regras de privacidade.

## Passos

1. Criar tela `/configuracoes`.
2. Perfil:
   - mostrar email somente leitura.
   - salvar nome completo nos metadados do Auth.
3. Preferencias:
   - persistir resumo mensal por email.
   - persistir alerta de 80% do orcamento.
   - salvar data de atualizacao.
4. Exportacao de dados:
   - gerar JSON sob demanda.
   - incluir email, data de exportacao, versao do formato.
   - incluir categorias, subcategorias, lancamentos, receitas-base, orcamentos e preferencias.
5. Exclusao de conta:
   - manter desabilitada ate haver decisao e confirmacao forte.
   - depois implementar com senha recente ou link por email.
   - excluir/inativar dados conforme politica.
6. Logs:
   - nao registrar senha, token ou payload financeiro completo.

## Criterios de aceite

- Preferencias persistem apos reload.
- Exportacao contem apenas dados do usuario autenticado.
- JSON tem versao.
- Exclusao nao e oferecida como botao funcional sem fluxo seguro.
