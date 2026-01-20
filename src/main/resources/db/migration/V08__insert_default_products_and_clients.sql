INSERT INTO product (
  product_name,
  brand,
  quantity,
  purchase_price,
  sale_price,
  total_investment,
  potential_revenue,
  active,
  enterprise_id
)
VALUES
('Furadeira', 'Makita', 10, 3.89, 5.55, 38.9, 55.5, true, 1),
('Martelo', 'Sparta', 20, 14.14, 20.2, 282.8, 404.0, true, 1);

INSERT INTO client (
  client_name,
  email,
  phone,
  identification_number,
  enterprise_id
)
VALUES
('Empresa ABC Ltda', 'vendas@empresaabc.com', '(11) 77777-7777', '12.345.678/0001-90', 2),
('Loja de Ferragens XYZ', 'contato@ferragensxyz.com', '(11) 95555-5555', '98.765.432/0001-10', 1);
