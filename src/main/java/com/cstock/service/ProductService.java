package com.cstock.service;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.cstock.domain.model.Enterprise;
import com.cstock.domain.model.Product;
import com.cstock.domain.model.User;
import com.cstock.repository.EnterpriseRepository;
import com.cstock.repository.ProductRepository;
import com.cstock.repository.UserRepository;
import com.cstock.repository.filter.ProductFilter;


@Service
public class ProductService {

	@Autowired
	private ProductRepository productRepository;
	
	@Autowired
	private EnterpriseRepository enterpriseRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	public Product save(Product product) {
		 System.out.println("=== DEBUG: Salvando Product ===");
		 System.out.println("Enterprise recebida: " + product.getEnterprise());
		if (product.getEnterprise() == null || product.getEnterprise().getId() == null) {
	        throw new IllegalArgumentException("Empresa é obrigatória");
	    }
		//apagar depois
		Long enterpriseId = product.getEnterprise().getId();
	    System.out.println("Buscando enterprise com ID: " + enterpriseId);
	    //apagar depois
	    boolean exists = enterpriseRepository.existsById(enterpriseId);
	    System.out.println("Enterprise existe no banco? " + exists);
	    
		Enterprise enterprise = enterpriseRepository.findById(product.getEnterprise().getId())
				.orElseThrow(() -> {
		            System.out.println("ERROR: Enterprise não encontrada com ID: " + enterpriseId);
		            return new IllegalArgumentException("Enterprise não encontrada");
		        });
		//apagar depois
		System.out.println("Enterprise encontrada: " + enterprise.getEnterpriseName());
	        
	        product.setEnterprise(enterprise);
		product.setTotalValue(product.getUnitValue() * product.getQuantity());
		return productRepository.save(product);
	}
	
	public Product update(Long id, Product product) {
		Product productSaved = findProductById(id);
		BeanUtils.copyProperties(product, productSaved, "id");
		productSaved.setTotalValue(productSaved.getUnitValue() * productSaved.getQuantity());
		return productRepository.save(productSaved);	
	}
	
	public Product findProductById(Long id) {
		Product productSaved = productRepository.findById(id).orElseThrow(() -> new EmptyResultDataAccessException(1));
		return productSaved;
	}
	
	public List<Product> findProductByUserId(Long userId){
	    User user = userRepository.findById(userId)
	    		.orElseThrow(() -> new IllegalArgumentException("User não encontrado com ID: " + userId));
	    
	    if (user.getEnterprise() == null) {
	        throw new IllegalArgumentException("User não possui enterprise associada");
	    }
	    
	    Long enterpriseId = user.getEnterprise().getId();
	    return productRepository.findByEnterpriseId(enterpriseId);
	}
	
	public List<Product> search(ProductFilter productFilter) {
		return productRepository.filter(productFilter, Sort.by("productName").descending());
	}
	
}
