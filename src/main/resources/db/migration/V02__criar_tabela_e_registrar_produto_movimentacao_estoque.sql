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

INSERT INTO product (id, product_name, brand, quantity, purchase_price, sale_price, total_investment, potential_revenue, active, enterprise_id)
VALUES
(1, 'Furadeira', 'Makita', 10, 3.89, 5.55, 38.9, 55.5, true, 2),
(2, 'Martelo', 'Sparta', 20, 14.14, 20.2, 282.8, 404.0, true, 2);


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

INSERT INTO client (id, client_name, email, phone, identification_number, enterprise_id)
VALUES
(1, 'Empresa ABC Ltda', 'vendas@empresaabc.com', '(11) 77777-7777', '12.345.678/0001-90', 2),
(2, 'Loja de Ferragens XYZ', 'contato@ferragensxyz.com', '(11) 95555-5555', '98.765.432/0001-10', 1);


CREATE TABLE stock_movement (
    id BIGSERIAL PRIMARY KEY,
    movement_type VARCHAR(45) NOT NULL,
    movement_date TIMESTAMP NOT NULL,
    quantity INT NOT NULL,
    observation TEXT NOT NULL,
    unit_price_used DOUBLE PRECISION,
    movement_value DOUBLE PRECISION,
    user_id BIGINT REFERENCES "user"(id),
    product_id BIGINT NOT NULL REFERENCES product(id),
    client_id BIGINT REFERENCES client(id)
);
