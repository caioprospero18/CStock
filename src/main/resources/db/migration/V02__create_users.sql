CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(45) NOT NULL UNIQUE,
    password VARCHAR(150) NOT NULL,
    user_name VARCHAR(45) NOT NULL,
    position VARCHAR(45) NOT NULL,
    birth_date DATE NOT NULL,
    active BOOLEAN NOT NULL,
    deleted_at TIMESTAMP,
    enterprise_id BIGINT REFERENCES enterprise(id)
);
