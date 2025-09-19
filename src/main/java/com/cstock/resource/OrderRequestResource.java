package com.cstock.resource;

import com.cstock.dto.OrderRequestDTO;
import com.cstock.service.OrderRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/order-requests")
public class OrderRequestResource {
    
    @Autowired
    private OrderRequestService orderRequestService;
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderRequestDTO createOrderRequest(@Valid @RequestBody OrderRequestDTO orderRequestDTO) {
        return orderRequestService.createOrderRequest(orderRequestDTO);
    }
    
    @GetMapping
    public List<OrderRequestDTO> getAllOrderRequests() {
        return orderRequestService.getAllOrderRequests();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderRequestDTO> getOrderRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(orderRequestService.getOrderRequestById(id));
    }
    
    @PatchMapping("/{id}/status")
    public OrderRequestDTO updateOrderStatus(@PathVariable Long id, 
                                           @RequestParam String status) {
        return orderRequestService.updateOrderStatus(id, status);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrderRequest(@PathVariable Long id) {
        orderRequestService.deleteOrderRequest(id);
    }
    
    @GetMapping("/pending")
    public List<OrderRequestDTO> getPendingOrders() {
        return orderRequestService.getPendingOrders();
    }
}