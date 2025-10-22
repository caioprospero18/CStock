package com.cstock.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cstock.domain.model.Enterprise;
import com.cstock.domain.model.StockMovement;
import com.cstock.repository.stockmovement.StockMovementRepositoryQuery;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long>, StockMovementRepositoryQuery{
	List<StockMovement> findById(long id);
	List<StockMovement> findByMovementDateBetween(LocalDateTime startDate, LocalDateTime endDate);
	List<StockMovement> findByMovementDateBetweenAndProduct_Enterprise(
		    LocalDateTime startDate, LocalDateTime endDate, Enterprise enterprise);
	List<StockMovement> findByProductEnterpriseId(Long enterpriseId);
}
