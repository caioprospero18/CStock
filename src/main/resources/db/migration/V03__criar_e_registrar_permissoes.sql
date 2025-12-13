CREATE TABLE permission (
    id BIGINT PRIMARY KEY,
    description VARCHAR(50) NOT NULL
);

CREATE TABLE user_permission (
    user_id BIGINT NOT NULL REFERENCES "user"(id),
    permission_id BIGINT NOT NULL REFERENCES permission(id),
    PRIMARY KEY (user_id, permission_id)
);

-- senha admin
INSERT INTO "user" (id, email, password, user_name, position, birth_date, active, enterprise_id)
VALUES (1, 'admin@cstock.com',
        '$2a$10$X607ZPhQ4EgGNaYKt3n4SONjIv9zc.VMWdEuhCuba7oLAL5IvcL5.',
        'Admin', 'ADMIN', '2025-01-06', true, 1);


-- usuario
INSERT INTO permission (id, description) VALUES
(1, 'REGISTER_ENTERPRISE'),
(2, 'REGISTER_USER'),
(3, 'REMOVE_USER'),
(4, 'SEARCH_USER'),
(5, 'REGISTER_PRODUCT'),
(6, 'REMOVE_PRODUCT'),
(7, 'SEARCH_PRODUCT'),
(8, 'REGISTER_STOCK_MOVEMENT');

-- admin
INSERT INTO user_permission (user_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(1, 5), (1, 6), (1, 7), (1, 8);

-- claudio
INSERT INTO user_permission (user_id, permission_id) VALUES
(2, 4), (2, 5), (2, 6), (2, 7), (2, 8);
