package com.cstock.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cstock.domain.model.Product;
import com.cstock.repository.product.ProductRepositoryQuery;

public interface ProductRepository extends JpaRepository<Product, Long>, ProductRepositoryQuery{
    
    List<Product> findByEnterpriseIdAndActiveTrue(Long enterpriseId);
    
    List<Product> findByEnterpriseId(Long enterpriseId);
    
    Optional<Product> findByIdAndActiveTrue(Long id);
    
    List<Product> findByActiveTrue();
}