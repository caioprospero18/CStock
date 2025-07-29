package com.cstock.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.cstock.domain.model.MovementType;
import com.cstock.domain.model.Product;
import com.cstock.domain.model.StockMovement;
import com.cstock.domain.model.User;
import com.cstock.repository.ProductRepository;
import com.cstock.repository.StockMovementRepository;
import com.cstock.repository.UserRepository;
import com.cstock.repository.filter.StockMovementFilter;
import com.cstock.service.exception.NonExistentUserException;

@Service
public class StockMovementService {
	@Autowired
	private StockMovementRepository stockMovementRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private ProductRepository productRepository;
	
	public StockMovement save(StockMovement stockMovement) {
		Optional<User> user = userRepository.findById(stockMovement.getUser().getId());
		if(!user.isPresent()) {
			throw new NonExistentUserException();
		}
		Optional<Product> productSaved = productRepository.findById(stockMovement.getProduct().getId());
	    if (!productSaved.isPresent()) {
	        throw new IllegalArgumentException("Produto não encontrado.");
	    }
	    Product product = productSaved.get();
	    int currentQuantity = product.getQuantity();
	    int movementQuantity = stockMovement.getQuantity();
	    if(stockMovement.getMovementType() == MovementType.ENTRY) {
	    	product.setQuantity(currentQuantity + movementQuantity);
	    } else if (stockMovement.getMovementType() == MovementType.EXIT) {
	    	if(movementQuantity > currentQuantity) {
	    		throw new IllegalArgumentException("Estoque insuficiente para a saída.");
	    	}
	    	product.setQuantity(currentQuantity - movementQuantity); 
	    } 
	    product.setTotalValue(product.getUnityValue() * product.getQuantity());
	    productRepository.save(product);
	    return stockMovementRepository.save(stockMovement);
	}
	
	
	public StockMovement findStockMovementById(Long id) {
		StockMovement stockMovement = stockMovementRepository.findById(id).orElseThrow(() -> new EmptyResultDataAccessException(1));
		return stockMovement;
	}
	
	public Product findProductById(Long id) {
		Product product = productRepository.findById(id).orElseThrow(() -> new EmptyResultDataAccessException(1));
		return product;
	}
	
	public User findUserById(Long id) {
		User user = userRepository.findById(id).orElseThrow(() -> new EmptyResultDataAccessException(1));
		return user;
	}
	
	public List<StockMovement> search(StockMovementFilter stockMovementFilter) {
		return stockMovementRepository.filter(stockMovementFilter, Sort.by("product").descending());
	}
	
	public StockMovement addStock(Long productId, Long userId, int quantity) {
		if (quantity <= 0) throw new IllegalArgumentException("Quantidade deve ser positiva.");
		StockMovement movement = new StockMovement();
		movement.setMovementType(MovementType.ENTRY);
		movement.setQuantity(quantity);
		movement.setProduct(findProductById(productId));
		movement.setUser(findUserById(userId));
		return save(movement);
	}
	
	public StockMovement removeStock(Long productId, Long userId, int quantity) {
		if (quantity <= 0) throw new IllegalArgumentException("Quantidade deve ser positiva.");
		StockMovement movement = new StockMovement();
		movement.setMovementType(MovementType.EXIT);
		movement.setQuantity(quantity);
		movement.setProduct(findProductById(productId));
		movement.setUser(findUserById(userId));
		return save(movement);
	}
}
