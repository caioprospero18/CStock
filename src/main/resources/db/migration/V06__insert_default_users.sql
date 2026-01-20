-- Admin
INSERT INTO users (email, password, user_name, position, birth_date, active, enterprise_id)
VALUES (
    'admin@cstock.com',
    '$2a$10$X607ZPhQ4EgGNaYKt3n4SONjIv9zc.VMWdEuhCuba7oLAL5IvcL5.',
    'Admin',
    'ADMIN',
    '2025-01-06',
    true,
    1
);

-- Claudio
INSERT INTO users (email, password, user_name, position, birth_date, active, enterprise_id)
VALUES (
    'claudio@ficacessorios.com',
    '$2a$10$sC9.rkoADQh3vzWvJoqMluJb2.w9H73a8xp25vMSRFS6pPreT4NZW',
    'Claudio',
    'OPERATOR',
    '1989-09-02',
    true,
    2
);

-- Demo
INSERT INTO users (email, password, user_name, position, birth_date, active, enterprise_id)
VALUES (
    'recruiter@demo.com',
    '$2a$10$sC9.rkoADQh3vzWvJoqMluJb2.w9H73a8xp25vMSRFS6pPreT4NZW',
    'Teste',
    'OPERATOR',
    '1990-01-01',
    true,
    1
);


INSERT INTO user_permission (user_id, permission_id)
SELECT u.id, p.id
FROM users u
JOIN permission p ON true
WHERE u.email IN ('admin@cstock.com');


INSERT INTO user_permission (user_id, permission_id)
SELECT u.id, p.id
FROM users u
JOIN permission p ON p.description IN (
    'SEARCH_USER',
    'REGISTER_PRODUCT',
    'REMOVE_PRODUCT',
    'SEARCH_PRODUCT',
    'REGISTER_STOCK_MOVEMENT'
)
WHERE u.email = 'claudio@ficacessorios.com';

INSERT INTO user_permission (user_id, permission_id)
SELECT u.id, p.id
FROM users u
JOIN permission p ON p.description IN (
    'SEARCH_USER',
    'REGISTER_PRODUCT',
    'REMOVE_PRODUCT',
    'SEARCH_PRODUCT',
    'REGISTER_STOCK_MOVEMENT'
)
WHERE u.email = 'recruiter@demo.com';