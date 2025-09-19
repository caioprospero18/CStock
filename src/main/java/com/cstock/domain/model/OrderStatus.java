package com.cstock.domain.model;

public enum OrderStatus {
    PENDENTE("Pendente"),
    ENVIADO("Enviado"), 
    RECEBIDO("Recebido"),
    CANCELADO("Cancelado"),
    PROCESSANDO("Processando"),
    ENTREGUE("Entregue");

    private final String descricao;

    OrderStatus(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    public static OrderStatus fromString(String text) {
        for (OrderStatus status : OrderStatus.values()) {
            if (status.name().equalsIgnoreCase(text)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Status inválido: " + text);
    }

    public static boolean isValid(String status) {
        try {
            OrderStatus.fromString(status);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
