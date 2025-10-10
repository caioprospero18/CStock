package com.cstock.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReportDTO {
    private LocalDate reportDate;
    private String reportType; 
    private List<StockMovementReport> movements;
    private BigDecimal totalRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal netProfit;
    private int totalEntries;
    private int totalExits;
    
    public LocalDate getReportDate() {
		return reportDate;
	}

	public void setReportDate(LocalDate reportDate) {
		this.reportDate = reportDate;
	}

	public String getReportType() {
		return reportType;
	}

	public void setReportType(String reportType) {
		this.reportType = reportType;
	}

	public List<StockMovementReport> getMovements() {
		return movements;
	}

	public void setMovements(List<StockMovementReport> movements) {
		this.movements = movements;
	}

	public BigDecimal getTotalRevenue() {
		return totalRevenue;
	}

	public void setTotalRevenue(BigDecimal totalRevenue) {
		this.totalRevenue = totalRevenue;
	}

	public BigDecimal getTotalExpenses() {
		return totalExpenses;
	}

	public void setTotalExpenses(BigDecimal totalExpenses) {
		this.totalExpenses = totalExpenses;
	}

	public BigDecimal getNetProfit() {
		return netProfit;
	}

	public void setNetProfit(BigDecimal netProfit) {
		this.netProfit = netProfit;
	}

	public int getTotalEntries() {
		return totalEntries;
	}

	public void setTotalEntries(int totalEntries) {
		this.totalEntries = totalEntries;
	}

	public int getTotalExits() {
		return totalExits;
	}

	public void setTotalExits(int totalExits) {
		this.totalExits = totalExits;
	}

	public static class StockMovementReport {
        private String productName;
        private String movementType;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalValue;
        private String movementDate;
        private String userName;
		public String getProductName() {
			return productName;
		}
		public void setProductName(String productName) {
			this.productName = productName;
		}
		public String getMovementType() {
			return movementType;
		}
		public void setMovementType(String movementType) {
			this.movementType = movementType;
		}
		public int getQuantity() {
			return quantity;
		}
		public void setQuantity(int quantity) {
			this.quantity = quantity;
		}
		public BigDecimal getUnitPrice() {
			return unitPrice;
		}
		public void setUnitPrice(BigDecimal unitPrice) {
			this.unitPrice = unitPrice;
		}
		public BigDecimal getTotalValue() {
			return totalValue;
		}
		public void setTotalValue(BigDecimal totalValue) {
			this.totalValue = totalValue;
		}
		public String getMovementDate() {
			return movementDate;
		}
		public void setMovementDate(String movementDate) {
			this.movementDate = movementDate;
		}
		public String getUserName() {
			return userName;
		}
		public void setUserName(String userName) {
			this.userName = userName;
		}
        
    }
    
    
}
