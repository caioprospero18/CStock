CREATE TABLE `enterprise`(
	`id` bigint(20) PRIMARY KEY AUTO_INCREMENT,
	`enterprise_name` varchar(45) NOT NULL,
	`cnpj` varchar(18) NOT NULL UNIQUE
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO enterprise (id, enterprise_name, cnpj) 
VALUES (1, 'CStock', '46.486.061/0001-01');
INSERT INTO enterprise (id, enterprise_name, cnpj) 
VALUES (2, 'Fic Acessorios', '85.424.117/0001-55');

CREATE TABLE `user`(
	`id` bigint(20) PRIMARY KEY AUTO_INCREMENT,
	`email` varchar(45) NOT NULL UNIQUE,
	`password` varchar(150) NOT NULL,
	`user_name` varchar(45) NOT NULL,
	`position` varchar(45) NOT NULL,
	`enterprise_id` bigint(20),
	FOREIGN KEY (enterprise_id) REFERENCES enterprise(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO user (id, email, password, user_name, position, enterprise_id)
VALUES (2, 'claudio@ficacessorios.com', '$2a$10$sC9.rkoADQh3vzWvJoqMluJb2.w9H73a8xp25vMSRFS6pPreT4NZW', 'Claudio', 'Operador de Estoque', 1);