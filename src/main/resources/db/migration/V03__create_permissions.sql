CREATE TABLE permission (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(50) NOT NULL
);

CREATE TABLE user_permission (
    user_id BIGINT NOT NULL REFERENCES users(id),
    permission_id BIGINT NOT NULL REFERENCES permission(id),
    PRIMARY KEY (user_id, permission_id)
);

INSERT INTO permission (description) VALUES
('REGISTER_ENTERPRISE'),
('REGISTER_USER'),
('REMOVE_USER'),
('SEARCH_USER'),
('REGISTER_PRODUCT'),
('REMOVE_PRODUCT'),
('SEARCH_PRODUCT'),
('REGISTER_STOCK_MOVEMENT');