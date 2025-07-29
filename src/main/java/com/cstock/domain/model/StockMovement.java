package com.cstock.domain.model;

import java.time.LocalDate;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "stock_movement")
public class StockMovement {
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Long id;
	@NotNull
	@Column(name = "movement_type")
	@Enumerated(EnumType.STRING)
	private MovementType movementType;
	@NotNull
	@JsonFormat(pattern = "dd/MM/yyyy")
	@Column(name = "movement_date")
	private LocalDate movementDate;
	@NotNull
	@Min(1)
	private int quantity;
	@NotNull
	private String observation;
	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;
	@ManyToOne
	@JoinColumn(name = "product_id")
	private Product product;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public MovementType getMovementType() {
		return movementType;
	}
	public void setMovementType(MovementType movementType) {
		this.movementType = movementType;
	}
	public LocalDate getMovementDate() {
		return movementDate;
	}
	public void setMovementDate(LocalDate movementDate) {
		this.movementDate = movementDate;
	}
	public int getQuantity() {
		return quantity;
	}
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public Product getProduct() {
		return product;
	}
	public void setProduct(Product product) {
		this.product = product;
	}
	public String getObservation() {
		return observation;
	}
	public void setObservation(String observation) {
		this.observation = observation;
	}
	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		StockMovement other = (StockMovement) obj;
		return Objects.equals(id, other.id);
	}
}
