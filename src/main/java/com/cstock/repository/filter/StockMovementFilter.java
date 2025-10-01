package com.cstock.repository.filter;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.cstock.domain.model.MovementType;
import com.cstock.domain.model.Product;

public class StockMovementFilter {
	private MovementType movementType;
	private LocalDateTime movementDate;
	private Product product;
	public MovementType getMovementType() {
		return movementType;
	}
	public void setMovementType(MovementType movementType) {
		this.movementType = movementType;
	}
	public LocalDateTime getMovementDate() {
		return movementDate;
	}
	public void setMovementDate(LocalDateTime movementDate) {
		this.movementDate = movementDate;
	}
	public Product getProduct() {
		return product;
	}
	public void setProduct(Product product) {
		this.product = product;
	}
	
}
