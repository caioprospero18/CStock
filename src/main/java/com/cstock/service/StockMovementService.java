package com.cstock.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
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
		if (!user.isPresent()) {
			throw new NonExistentUserException();
		}
		Optional<Product> productSaved = productRepository.findById(stockMovement.getProduct().getId());
		if (!productSaved.isPresent()) {
			throw new IllegalArgumentException("Produto não encontrado.");
		}
		Product product = productSaved.get();
		int currentQuantity = product.getQuantity();
		int movementQuantity = stockMovement.getQuantity();
		if (stockMovement.getMovementType() == MovementType.ENTRY) {
			product.setQuantity(currentQuantity + movementQuantity);
		} else if (stockMovement.getMovementType() == MovementType.EXIT) {
			if (movementQuantity > currentQuantity) {
				throw new IllegalArgumentException("Estoque insuficiente para a saída.");
			}
			product.setQuantity(currentQuantity - movementQuantity);
		}
		product.calculateTotals();
		productRepository.save(product);
		calculateMovementValue(stockMovement, product);
		return stockMovementRepository.save(stockMovement);
	}

	private void calculateMovementValue(StockMovement movement, Product product) {
		if (movement.getMovementType() == MovementType.EXIT) {
			movement.setUnitPriceUsed(product.getSalePrice());
			movement.setMovementValue(product.getSalePrice() * movement.getQuantity());
		} else {
			movement.setUnitPriceUsed(product.getPurchasePrice());
			movement.setMovementValue(product.getPurchasePrice() * movement.getQuantity());
		}
	}

	public StockMovement findStockMovementById(Long id) {
		StockMovement stockMovement = stockMovementRepository.findById(id)
				.orElseThrow(() -> new EmptyResultDataAccessException(1));
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
		if (quantity <= 0)
			throw new IllegalArgumentException("Quantidade deve ser positiva.");
		StockMovement movement = new StockMovement();
		movement.setMovementType(MovementType.ENTRY);
		movement.setQuantity(quantity);
		movement.setProduct(findProductById(productId));
		movement.setUser(findUserById(userId));
		return save(movement);
	}

	public StockMovement removeStock(Long productId, Long userId, int quantity) {
		if (quantity <= 0)
			throw new IllegalArgumentException("Quantidade deve ser positiva.");
		StockMovement movement = new StockMovement();
		movement.setMovementType(MovementType.EXIT);
		movement.setQuantity(quantity);
		movement.setProduct(findProductById(productId));
		movement.setUser(findUserById(userId));
		return save(movement);
	}

	public Double getTotalRevenue(String period) {
		List<StockMovement> allMovements = stockMovementRepository.findAll();
		List<StockMovement> exitMovements = filterExitMovementsByPeriod(allMovements, period);
		return exitMovements.stream().mapToDouble(StockMovement::getMovementValue).sum();
	}

	public Double getProductRevenue(Long productId, String period) {
		List<StockMovement> allMovements = stockMovementRepository.findAll();
		List<StockMovement> exitMovements = filterExitMovementsByPeriod(allMovements, period);
		return exitMovements.stream().filter(m -> m.getProduct().getId().equals(productId))
				.mapToDouble(StockMovement::getMovementValue).sum();
	}

	public Map<String, Double> getTopProductsByRevenue(String period, int limit) {
		List<StockMovement> allMovements = stockMovementRepository.findAll();
		List<StockMovement> exitMovements = filterExitMovementsByPeriod(allMovements, period);
		Map<String, Double> revenueByProduct = new HashMap<>();
		for (StockMovement movement : exitMovements) {
			String productName = movement.getProduct().getProductName();
			Double revenue = movement.getMovementValue();
			revenueByProduct.merge(productName, revenue, Double::sum);
		}
		return revenueByProduct.entrySet().stream().sorted(Map.Entry.<String, Double>comparingByValue().reversed())
				.limit(limit)
				.collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));
	}

	private List<StockMovement> filterExitMovementsByPeriod(List<StockMovement> movements, String period) {
		LocalDateTime startDate = calculateStartDate(period);
		return movements.stream().filter(m -> m.getMovementType() == MovementType.EXIT)
				.filter(m -> m.getMovementDate().isAfter(startDate)).collect(Collectors.toList());
	}

	private LocalDateTime calculateStartDate(String period) {
		LocalDateTime now = LocalDateTime.now();
		switch (period.toUpperCase()) {
		case "24H":
			return now.minusHours(24);
		case "7D":
			return now.minusDays(7);
		case "30D":
			return now.minusDays(30);
		case "90D":
			return now.minusDays(90);
		default:
			return now.minusDays(30);
		}
	}
}