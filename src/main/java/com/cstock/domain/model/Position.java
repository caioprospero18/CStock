package com.cstock.domain.model;

public enum Position {
	ADMIN("Admin"),
	CEO("Presidente"),
	MANAGER("Gerente de Estoque"),
	OPERATOR("Operador de Estoque"),
	FINANCIAL("Financeiro"),
	VIEWER("Usuario Comum");
	
	private String position;
	
	private Position(String position) {
		this.position = position;
	}
	
	public String getPosition() {
		return position;
	}
}
