CREATE TABLE product (
	`id` BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
	`product_name` VARCHAR(45) NOT NULL,
	`brand` VARCHAR(45) NOT NULL,
	`quantity` INT NOT NULL,
	`unity_value` DOUBLE NOT NULL,
	`total_value` DOUBLE NOT NULL,
	`enterprise_id` BIGINT(20) NOT NULL,
	FOREIGN KEY (enterprise_id) REFERENCES enterprise(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO product (id, product_name, brand, quantity, unity_value, total_value, enterprise_id) 
	values (1, 'Furadeira', 'Makita' , 10, 5.55, 55.5, 1); 


	
CREATE TABLE stock_movement (
	`id` BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
	`movement_type` VARCHAR(45) NOT NULL,
	`movement_date` DATE NOT NULL,
	`quantity` INT NOT NULL,
	`observation` TEXT NOT NULL,
	`user_id` BIGINT(20),
	`product_id` BIGINT(20) NOT NULL,
	FOREIGN KEY (user_id) REFERENCES user(id),
	FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

