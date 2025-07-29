package com.cstock.domain.model;

public enum MovementType {
	EXIT("Exit"),
	ENTRY("Entry");
	
	private String movementType;
	
	private MovementType(String movementType) {
		this.movementType = movementType;
	}
	
	public String getMovementType() {
		return movementType;
	}

}
