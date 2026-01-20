CREATE TABLE product (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(45) NOT NULL,
    brand VARCHAR(45) NOT NULL,
    quantity INT NOT NULL,
    purchase_price DOUBLE PRECISION NOT NULL,
    sale_price DOUBLE PRECISION NOT NULL,
    total_investment DOUBLE PRECISION NOT NULL,
    potential_revenue DOUBLE PRECISION NOT NULL,
    active BOOLEAN NOT NULL,
    enterprise_id BIGINT NOT NULL REFERENCES enterprise(id)
);

CREATE TABLE client (
    id BIGSERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    identification_number VARCHAR(20),
    enterprise_id BIGINT NOT NULL REFERENCES enterprise(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (identification_number, enterprise_id)
);

CREATE TABLE stock_movement (
    id BIGSERIAL PRIMARY KEY,
    movement_type VARCHAR(45) NOT NULL,
    movement_date TIMESTAMP NOT NULL,
    quantity INT NOT NULL,
    observation TEXT NOT NULL,
    unit_price_used DOUBLE PRECISION,
    movement_value DOUBLE PRECISION,
    user_id BIGINT REFERENCES users(id),
    product_id BIGINT NOT NULL REFERENCES product(id),
    client_id BIGINT REFERENCES client(id)
);