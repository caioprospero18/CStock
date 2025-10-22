CREATE TABLE product (
    `id` BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    `product_name` VARCHAR(45) NOT NULL,
    `brand` VARCHAR(45) NOT NULL,
    `quantity` INT NOT NULL,
    `purchase_price` DOUBLE NOT NULL,  
    `sale_price` DOUBLE NOT NULL,      
    `total_investment` DOUBLE NOT NULL, 
    `potential_revenue` DOUBLE NOT NULL, 
    `enterprise_id` BIGINT(20) NOT NULL,
    FOREIGN KEY (enterprise_id) REFERENCES enterprise(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO product (id, product_name, brand, quantity, purchase_price, sale_price, total_investment, potential_revenue, enterprise_id) 
    values (1, 'Furadeira', 'Makita', 10, 3.89, 5.55, 38.9, 55.5, 2); 
INSERT INTO product (id, product_name, brand, quantity, purchase_price, sale_price, total_investment, potential_revenue, enterprise_id) 
    values (2, 'Martelo', 'Sparta', 20, 14.14, 20.2, 282.8, 404.0, 2);

CREATE TABLE `client` (
    `id` BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    `client_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100),
    `phone` VARCHAR(20),
    `identification_number` VARCHAR(20), 
    `enterprise_id` BIGINT(20) NOT NULL, 
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES enterprise(id),
    UNIQUE KEY `unique_client_enterprise` (identification_number, enterprise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO client (id, client_name, email, phone, identification_number, enterprise_id) 
values (1, 'Empresa ABC Ltda', 'vendas@empresaabc.com', '(11) 77777-7777', '12.345.678/0001-90', 2);
INSERT INTO client (id, client_name, email, phone, identification_number, enterprise_id) 
values (2, 'Loja de Ferragens XYZ', 'contato@ferragensxyz.com', '(11) 95555-5555', '98.765.432/0001-10', 1); 
	
CREATE TABLE stock_movement (
    `id` BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    `movement_type` VARCHAR(45) NOT NULL,
    `movement_date` TIMESTAMP NOT NULL,
    `quantity` INT NOT NULL,
    `observation` TEXT NOT NULL,
    `unit_price_used` DOUBLE,           
    `movement_value` DOUBLE,            
    `user_id` BIGINT(20),
    `product_id` BIGINT(20) NOT NULL,
    `client_id` BIGINT(20) NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (product_id) REFERENCES product(id),
    FOREIGN KEY (client_id) REFERENCES client(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

