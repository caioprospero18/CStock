package com.cstock.service;

import com.cstock.domain.model.OrderRequest;
import com.cstock.domain.model.OrderStatus;
import com.cstock.domain.model.Product;
import com.cstock.dto.OrderRequestDTO;
import com.cstock.repository.OrderRequestRepository;
import com.cstock.repository.ProductRepository;
import com.cstock.mapper.OrderRequestMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderRequestService {
    
    @Autowired
    private OrderRequestRepository orderRequestRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRequestMapper orderRequestMapper;
    
    public OrderRequestDTO createOrderRequest(OrderRequestDTO orderRequestDTO) {
        OrderRequest orderRequest = orderRequestMapper.toEntity(orderRequestDTO);
        
        Product product = productRepository.findById(orderRequestDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        orderRequest.setProduct(product);
        
        OrderRequest savedOrder = orderRequestRepository.save(orderRequest);
        return orderRequestMapper.toDTO(savedOrder);
    }
    
    public List<OrderRequestDTO> getAllOrderRequests() {
        return orderRequestRepository.findAll().stream()
                .map(orderRequestMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public OrderRequestDTO getOrderRequestById(Long id) {
        OrderRequest orderRequest = orderRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        return orderRequestMapper.toDTO(orderRequest);
    }
    
    public OrderRequestDTO updateOrderStatus(Long id, String status) {
        OrderRequest orderRequest = orderRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        orderRequest.setStatus(orderStatus);
        
        OrderRequest updatedOrder = orderRequestRepository.save(orderRequest);
        return orderRequestMapper.toDTO(updatedOrder);
    }
    
    public void deleteOrderRequest(Long id) {
        orderRequestRepository.deleteById(id);
    }
    
    public List<OrderRequestDTO> getPendingOrders() {
        return orderRequestRepository.findByStatus(OrderStatus.PENDENTE).stream()
                .map(orderRequestMapper::toDTO)
                .collect(Collectors.toList());
    }
}