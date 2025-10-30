package com.cstock.domain.model;

import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "product")
public class Product {
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	@Id
	private Long id;
	
	@NotNull
	@Column(name = "product_name")
	private String productName;
	
	@NotNull
	private String brand;
	
	@NotNull
	private int quantity;
	
	@NotNull
	@Column(name = "purchase_price") 
	private double purchasePrice;
	
	@NotNull
	@Column(name = "sale_price") 
	private double salePrice;
	
	@NotNull
	@Column(name = "total_investment") 
	private double totalInvestment;
	
	@NotNull
	@Column(name = "potential_revenue") 
	private double potentialRevenue;
	
	@Column(nullable = false)
    private Boolean active = true;
	
	@ManyToOne
	@JoinColumn(name = "enterprise_id")
	private Enterprise enterprise;
	
	@OneToMany(mappedBy = "product")
	@JsonIgnore
	private List<StockMovement> stockMovement;
	
	public Product() {
        this.active = true; 
    }

	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getProductName() {
		return productName;
	}
	public void setProductName(String productName) {
		this.productName = productName;
	}
	public String getBrand() {
		return brand;
	}
	public void setBrand(String brand) {
		this.brand = brand;
	}
	public int getQuantity() {
		return quantity;
	}
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}
	public double getPurchasePrice() {
		return purchasePrice;
	}
	public void setPurchasePrice(double purchasePrice) {
		this.purchasePrice = purchasePrice;
	}
	public double getSalePrice() {
		return salePrice;
	}
	public void setSalePrice(double salePrice) {
		this.salePrice = salePrice;
	}
	public double getTotalInvestment() {
		return totalInvestment;
	}
	public void setTotalInvestment(double totalInvestment) {
		this.totalInvestment = totalInvestment;
	}
	public double getPotentialRevenue() {
		return potentialRevenue;
	}
	public Boolean getActive() {
		return active;
	}
	public void setActive(Boolean active) {
		this.active = active;
	}
	public void setPotentialRevenue(double potentialRevenue) {
		this.potentialRevenue = potentialRevenue;
	}
	public Enterprise getEnterprise() {
		return enterprise;
	}
	public void setEnterprise(Enterprise enterprise) {
		this.enterprise = enterprise;
	}
	public List<StockMovement> getStockMovement() {
		return stockMovement;
	}
	public void setStockMovement(List<StockMovement> stockMovement) {
		this.stockMovement = stockMovement;
	}
	
	public void calculateTotals() {
		this.totalInvestment = this.purchasePrice * this.quantity;
		this.potentialRevenue = this.salePrice * this.quantity;
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
		Product other = (Product) obj;
		return Objects.equals(id, other.id);
	}
}
