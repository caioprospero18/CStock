CREATE TABLE permission (
	id BIGINT(20) PRIMARY KEY,
	description VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE user_permission (
	user_id BIGINT(20) NOT NULL,
	permission_id BIGINT(20) NOT NULL,
	PRIMARY KEY (user_id, permission_id),
	FOREIGN KEY (user_id) REFERENCES user(id),
	FOREIGN KEY (permission_id) REFERENCES permission(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- senha admin
INSERT INTO user (id, email, password, user_name, position, birth_date, active, enterprise_id) values (1, 'admin@cstock.com', '$2a$10$X607ZPhQ4EgGNaYKt3n4SONjIv9zc.VMWdEuhCuba7oLAL5IvcL5.', 'Admin', 'ADMIN','2025/01/06', true, 1);

-- usuario
INSERT INTO permission (id, description) values (1, 'REGISTER_ENTERPRISE');
INSERT INTO permission (id, description) values (2, 'REGISTER_USER');
INSERT INTO permission (id, description) values (3, 'REMOVE_USER');
INSERT INTO permission (id, description) values (4, 'SEARCH_USER');

-- produto
INSERT INTO permission (id, description) values (5, 'REGISTER_PRODUCT');
INSERT INTO permission (id, description) values (6, 'REMOVE_PRODUCT');
INSERT INTO permission (id, description) values (7, 'SEARCH_PRODUCT');
INSERT INTO permission (id, description) values (8, 'REGISTER_STOCK_MOVEMENT');

-- admin
INSERT INTO user_permission (user_id, permission_id) values (1, 1);
INSERT INTO user_permission (user_id, permission_id) values (1, 2);
INSERT INTO user_permission (user_id, permission_id) values (1, 3);
INSERT INTO user_permission (user_id, permission_id) values (1, 4);
INSERT INTO user_permission (user_id, permission_id) values (1, 5);
INSERT INTO user_permission (user_id, permission_id) values (1, 6);
INSERT INTO user_permission (user_id, permission_id) values (1, 7);
INSERT INTO user_permission (user_id, permission_id) values (1, 8);

-- claudio
INSERT INTO user_permission (user_id, permission_id) values (2, 4);
INSERT INTO user_permission (user_id, permission_id) values (2, 5);
INSERT INTO user_permission (user_id, permission_id) values (2, 6);
INSERT INTO user_permission (user_id, permission_id) values (2, 7);
INSERT INTO user_permission (user_id, permission_id) values (2, 8);

