-- Migração para adicionar suporte a eventos recorrentes
-- Execute este script no banco de dados time_cash

USE time_cash;

-- Adicionar colunas para eventos recorrentes
ALTER TABLE events
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurrence_type VARCHAR(20) DEFAULT NULL COMMENT 'monthly, weekly, yearly, daily',
ADD COLUMN recurrence_interval INT DEFAULT 1 COMMENT 'Intervalo da recorrência (ex: a cada 2 meses = 2)',
ADD COLUMN parent_event_id VARCHAR(25) DEFAULT NULL COMMENT 'ID do evento original se for uma instância repetida',
ADD COLUMN recurrence_end_date DATE DEFAULT NULL COMMENT 'Data final da recorrência (NULL = sem fim)',
ADD INDEX idx_parent_event (parent_event_id),
ADD INDEX idx_recurring (is_recurring, recurrence_type);

-- Adicionar coluna para número de parcelas em compras
ALTER TABLE events
ADD COLUMN installments INT DEFAULT NULL COMMENT 'Número de parcelas para compras';

-- Adicionar foreign key para parent_event_id (auto-referência)
ALTER TABLE events
ADD CONSTRAINT fk_parent_event 
FOREIGN KEY (parent_event_id) REFERENCES events(event_id) 
ON DELETE CASCADE;

