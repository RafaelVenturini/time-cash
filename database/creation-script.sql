CREATE DATABASE time_cash;
USE time_cash;

CREATE TABLE users(
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(225),
    password varchar(20)
);

CREATE TABLE events(
    event_id VARCHAR(20) PRIMARY KEY,
    date DATE,
    type VARCHAR(20),
    user_id INT,
    place VARCHAR(225),
    money DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);