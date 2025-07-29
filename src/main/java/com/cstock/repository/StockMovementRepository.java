package com.cstock.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cstock.domain.model.StockMovement;
import com.cstock.repository.stockmovement.StockMovementRepositoryQuery;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long>, StockMovementRepositoryQuery{
	List<StockMovement> findById(long id);
}
