package com.cstock.repository.stockmovement;

import java.util.List;

import org.springframework.data.domain.Sort;

import com.cstock.domain.model.StockMovement;
import com.cstock.repository.filter.StockMovementFilter;

public interface StockMovementRepositoryQuery {

	public List<StockMovement> filter(StockMovementFilter stockMovementFilter, Sort sort);
}
