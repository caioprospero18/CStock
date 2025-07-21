package com.cstock.repository.product;

import java.util.List;

import org.springframework.data.domain.Sort;

import com.cstock.domain.model.Product;
import com.cstock.repository.filter.ProductFilter;

public interface ProductRepositoryQuery {

	public List<Product> filter(ProductFilter productFilter, Sort sort);
}
