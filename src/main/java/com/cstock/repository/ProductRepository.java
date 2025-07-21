package com.cstock.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cstock.domain.model.Product;
import com.cstock.domain.model.User;
import com.cstock.repository.product.ProductRepositoryQuery;

public interface ProductRepository extends JpaRepository<Product, Long>, ProductRepositoryQuery{
	List<Product> findByUser(User user);
}
