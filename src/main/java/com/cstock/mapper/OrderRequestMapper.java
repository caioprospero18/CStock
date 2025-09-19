package com.cstock.mapper;

import com.cstock.domain.model.OrderRequest;
import com.cstock.dto.OrderRequestDTO;
import org.springframework.stereotype.Component;

@Component
public class OrderRequestMapper {
    
    public OrderRequestDTO toDTO(OrderRequest orderRequest) {
        OrderRequestDTO dto = new OrderRequestDTO();
        dto.setId(orderRequest.getId());
        dto.setProductId(orderRequest.getProduct().getId());
        dto.setProductName(orderRequest.getProduct().getProductName());
        dto.setQuantity(orderRequest.getQuantity());
        dto.setSupplierEmail(orderRequest.getSupplierEmail());
        dto.setObservation(orderRequest.getObservation());
        dto.setStatus(orderRequest.getStatus());
        dto.setCreatedAt(orderRequest.getCreatedAt());
        dto.setUpdatedAt(orderRequest.getUpdatedAt());
        return dto;
    }
    
    public OrderRequest toEntity(OrderRequestDTO dto) {
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.setId(dto.getId());
        orderRequest.setQuantity(dto.getQuantity());
        orderRequest.setSupplierEmail(dto.getSupplierEmail());
        orderRequest.setObservation(dto.getObservation());
        orderRequest.setStatus(dto.getStatus());
        return orderRequest;
    }
}
