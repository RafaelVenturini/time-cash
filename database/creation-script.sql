DROP SCHEMA IF EXISTS time_cash;
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
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

