package com.cstock.repository.stockmovement;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;

import com.cstock.domain.model.Product;
import com.cstock.domain.model.StockMovement;
import com.cstock.repository.filter.StockMovementFilter;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public class StockMovementRepositoryImpl implements StockMovementRepositoryQuery{
	
	@PersistenceContext
	private EntityManager manager;
	
	@Override
	public List<StockMovement> filter(StockMovementFilter stockMovementFilter, Sort sort) {
		CriteriaBuilder builder = manager.getCriteriaBuilder();
		CriteriaQuery<StockMovement> criteria = builder.createQuery(StockMovement.class);
		Root<StockMovement> root = criteria.from(StockMovement.class);
		
		Predicate[] predicates = createConstraints(stockMovementFilter, builder, root);
		criteria.where(predicates);
		
		//ordenar pela data mais atual
		if (sort != null) {
            List<Order> orderList = sort.stream()
                .map(order -> order.isAscending() ? builder.asc(root.get(order.getProperty()))
                                                  : builder.desc(root.get(order.getProperty())))
                .toList();
            criteria.orderBy(orderList);
        }
		
		TypedQuery<StockMovement> query = manager.createQuery(criteria);
		return query.getResultList();
	}

	private Predicate[] createConstraints(StockMovementFilter stockMovementFilter, CriteriaBuilder builder, Root<StockMovement> root) {
		List<Predicate> predicates = new ArrayList<>();
		
		if(stockMovementFilter.getMovementType() != null) {
			predicates.add(builder.equal(
					root.get("productName"), stockMovementFilter.getMovementType()));
		}
		if(stockMovementFilter.getMovementDate() != null) {
			predicates.add(builder.equal(
					root.get("brand"), stockMovementFilter.getMovementDate()));
		}
		if(stockMovementFilter.getProduct() != null) {
			predicates.add(builder.equal(
					root.get("brand"), stockMovementFilter.getProduct()));
		}
		
		
		return predicates.toArray(new Predicate[predicates.size()]);
	}

}


