package com.cstock.dto;

import com.cstock.domain.model.OrderStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class OrderRequestDTO {
    
    private Long id;
    
    @NotNull(message = "ID do produto é obrigatório")
    @Positive(message = "ID do produto deve ser positivo")
    private Long productId;
    
    private String productName; 
    
    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser no mínimo 1")
    private Integer quantity;
    
    @NotBlank(message = "Email do fornecedor é obrigatório")
    @Email(message = "Email deve ser válido")
    private String supplierEmail;
    
    @Size(max = 500, message = "Observação deve ter no máximo 500 caracteres")
    private String observation;
    
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public OrderRequestDTO() {}
    
    public OrderRequestDTO(Long productId, Integer quantity, String supplierEmail, String observation) {
        this.productId = productId;
        this.quantity = quantity;
        this.supplierEmail = supplierEmail;
        this.observation = observation;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getProductId() {
		return productId;
	}

	public void setProductId(Long productId) {
		this.productId = productId;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public String getSupplierEmail() {
		return supplierEmail;
	}

	public void setSupplierEmail(String supplierEmail) {
		this.supplierEmail = supplierEmail;
	}

	public String getObservation() {
		return observation;
	}

	public void setObservation(String observation) {
		this.observation = observation;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public void setStatus(OrderStatus status) {
		this.status = status;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
    
}
