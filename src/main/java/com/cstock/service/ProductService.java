package com.cstock.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.cstock.domain.model.Product;
import com.cstock.domain.model.User;
import com.cstock.repository.ProductRepository;
import com.cstock.repository.UserRepository;
import com.cstock.repository.filter.ProductFilter;
import com.cstock.service.exception.NonExistentUserException;


@Service
public class ProductService {

	@Autowired
	private ProductRepository productRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	public Product save(Product product) {
		Optional<User> user = userRepository.findById(product.getId());
		if(!user.isPresent()) {
			throw new NonExistentUserException();
		}
		product.setTotalValue(product.getUnityValue() * product.getQuantity());
		return productRepository.save(product);
	}
	
	public Product update(Long id, Product product) {
		Product productSaved = findProductById(id);
		BeanUtils.copyProperties(product, productSaved, "id");
		productSaved.setTotalValue(productSaved.getUnityValue() * productSaved.getQuantity());
		return productRepository.save(productSaved);	
	}
	
	public Product findProductById(Long id) {
		Product productSaved = productRepository.findById(id).orElseThrow(() -> new EmptyResultDataAccessException(1));
		return productSaved;
	}
	
	public List<Product> findProductByUserId(Long userId){
		User user = userRepository.findById(userId).orElseThrow(() -> new EmptyResultDataAccessException(1));
		Long enterpriseId = user.getEnterprise().getId();
		return productRepository.findByEnterpriseId(enterpriseId);
	}
	
	public List<Product> search(ProductFilter productFilter) {
		return productRepository.filter(productFilter, Sort.by("productName").descending());
	}
	
}
