CREATE DATABASE time_cash;
USE time_cash;

CREATE TABLE users
(
    user_id  INT AUTO_INCREMENT PRIMARY KEY,
    email    VARCHAR(225),
    password varchar(20)
);

CREATE TABLE events
(
    event_id VARCHAR(25) PRIMARY KEY,
    date     DATE,
    type     VARCHAR(20),
    user_id  INT,
    place    VARCHAR(225),
    money    DECIMAL(10, 2),
    installments INT DEFAULT NULL COMMENT 'Número de parcelas para compras',
    name     VARCHAR(225),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_type VARCHAR(20) DEFAULT NULL COMMENT 'monthly, weekly, yearly, daily',
    recurrence_interval INT DEFAULT 1 COMMENT 'Intervalo da recorrência (ex: a cada 2 meses = 2)',
    parent_event_id VARCHAR(25) DEFAULT NULL COMMENT 'ID do evento original se for uma instância repetida',
    recurrence_end_date DATE DEFAULT NULL COMMENT 'Data final da recorrência (NULL = sem fim)',
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (parent_event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    INDEX idx_parent_event (parent_event_id),
    INDEX idx_recurring (is_recurring, recurrence_type)
);