package com.cstock.repository;

import com.cstock.domain.model.OrderRequest;
import com.cstock.domain.model.OrderStatus; 
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRequestRepository extends JpaRepository<OrderRequest, Long> {
    List<OrderRequest> findByStatus(OrderStatus status); 
    List<OrderRequest> findByProductId(Long productId);
}
