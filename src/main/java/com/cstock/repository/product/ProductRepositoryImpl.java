package com.cstock.repository.product;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;

import com.cstock.domain.model.Product;
import com.cstock.repository.filter.ProductFilter;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public class ProductRepositoryImpl implements ProductRepositoryQuery{
    
    @PersistenceContext
    private EntityManager manager;
    
    @Override
    public List<Product> filter(ProductFilter productFilter, Sort sort) {
        CriteriaBuilder builder = manager.getCriteriaBuilder();
        CriteriaQuery<Product> criteria = builder.createQuery(Product.class);
        Root<Product> root = criteria.from(Product.class);
        
        Predicate[] predicates = createConstraints(productFilter, builder, root);
        criteria.where(predicates);
        
        if (sort != null) {
            List<Order> orderList = sort.stream()
                .map(order -> order.isAscending() ? builder.asc(root.get(order.getProperty()))
                                                  : builder.desc(root.get(order.getProperty())))
                .toList();
            criteria.orderBy(orderList);
        }
        
        TypedQuery<Product> query = manager.createQuery(criteria);
        return query.getResultList();
    }

    private Predicate[] createConstraints(ProductFilter productFilter, CriteriaBuilder builder, Root<Product> root) {
        List<Predicate> predicates = new ArrayList<>();
        
        predicates.add(builder.isTrue(root.get("active")));
        
        if(productFilter.getProductName() != null) {
            predicates.add(builder.like(
                    builder.lower(root.get("productName")), 
                    "%" + productFilter.getProductName().toLowerCase() + "%"));
        }
        if(productFilter.getBrand() != null) {
            predicates.add(builder.like(
                    builder.lower(root.get("brand")), 
                    "%" + productFilter.getBrand().toLowerCase() + "%"));
        }
        
        return predicates.toArray(new Predicate[predicates.size()]);
    }
}