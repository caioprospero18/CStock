CREATE TABLE enterprise (
    id BIGSERIAL PRIMARY KEY,
    enterprise_name VARCHAR(45) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE
);

INSERT INTO enterprise (enterprise_name, cnpj) VALUES
('CStock', '46.486.061/0001-01'),
('Fic Acessorios', '85.424.117/0001-55');
