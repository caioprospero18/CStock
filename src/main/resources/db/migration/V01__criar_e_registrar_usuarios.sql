CREATE TABLE enterprise (
    id BIGSERIAL PRIMARY KEY,
    enterprise_name VARCHAR(45) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE
);

INSERT INTO enterprise (id, enterprise_name, cnpj) VALUES
(1, 'CStock', '46.486.061/0001-01'),
(2, 'Fic Acessorios', '85.424.117/0001-55');


CREATE TABLE "user" (
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

INSERT INTO "user" (id, email, password, user_name, position, birth_date, active, enterprise_id) 
VALUES (
    2, 'claudio@ficacessorios.com',
    '$2a$10$sC9.rkoADQh3vzWvJoqMluJb2.w9H73a8xp25vMSRFS6pPreT4NZW',
    'Claudio', 'OPERATOR', '1989-09-02', true, 2
);
