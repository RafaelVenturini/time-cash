# Diagrama do Banco de Dados - Time Cash

## Estrutura Atual

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ user_id (PK)    │ INT AUTO_INCREMENT
│ email           │ VARCHAR(225)
│ password        │ VARCHAR(20)
└─────────────────┘
         │
         │ 1:N
         │
┌─────────────────────────────────────┐
│              events                 │
├─────────────────────────────────────┤
│ event_id (PK)                       │ VARCHAR(25)
│ date                                │ DATE
│ type                                │ VARCHAR(20)
│ user_id (FK)                        │ INT
│ place                               │ VARCHAR(225)
│ money                               │ DECIMAL(10, 2)
│ name                                │ VARCHAR(225)
│ is_recurring                        │ BOOLEAN
│ recurrence_type                     │ VARCHAR(20)
│ recurrence_interval                 │ INT
│ parent_event_id (FK → events)       │ VARCHAR(25)
│ recurrence_end_date                 │ DATE
└─────────────────────────────────────┘
         │
         │ 1:N (auto-referência)
         │
         └─────┐
               │
               └─> Instâncias repetidas do evento
```

## Relacionamentos

- **users** 1:N **events**
  - Um usuário pode ter múltiplos eventos
  - Um evento pertence a um único usuário

- **events** 1:N **events** (auto-referência)
  - Um evento original pode ter múltiplas instâncias repetidas
  - Uma instância repetida pertence a um evento original (parent_event_id)
  - Quando o evento original é deletado, as instâncias também são (CASCADE)

## Descrição das Tabelas

### Tabela `users`
Armazena informações dos usuários do sistema.

- `user_id`: Identificador único do usuário (chave primária, auto-incremento)
- `email`: Email do usuário
- `password`: Senha do usuário

### Tabela `events`
Armazena os eventos financeiros/pessoais dos usuários, com suporte a recorrência.

**Campos Básicos:**
- `event_id`: Identificador único do evento (chave primária)
- `date`: Data do evento
- `type`: Tipo do evento (Trabalho, Pessoal, Reunião, etc.)
- `user_id`: Referência ao usuário proprietário (chave estrangeira)
- `place`: Local do evento
- `money`: Valor monetário associado ao evento
- `name`: Nome/título do evento

**Campos de Recorrência:**
- `is_recurring`: Indica se o evento é recorrente (TRUE) ou único (FALSE)
- `recurrence_type`: Tipo de recorrência:
  - `monthly`: Repetição mensal
  - `weekly`: Repetição semanal
  - `yearly`: Repetição anual
  - `daily`: Repetição diária
- `recurrence_interval`: Intervalo da recorrência (ex: 2 = a cada 2 meses)
- `parent_event_id`: ID do evento original (NULL para eventos originais, preenchido para instâncias repetidas)
- `recurrence_end_date`: Data final da recorrência (NULL = sem data de término)

## Exemplo de Uso

### Evento Recorrente Mensal
Um evento criado em 2025-01-15 com `is_recurring=TRUE`, `recurrence_type='monthly'`, `recurrence_interval=1` e `recurrence_end_date='2025-12-31'` gerará automaticamente instâncias para:
- 2025-01-15 (original)
- 2025-02-15
- 2025-03-15
- ...
- 2025-12-15

Cada instância terá o mesmo `name`, `type`, `place`, `money`, mas com `parent_event_id` apontando para o evento original.

