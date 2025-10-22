package com.cstock.resource;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cstock.domain.model.StockMovement;
import com.cstock.repository.StockMovementRepository;
import com.cstock.service.StockMovementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/stockmovements")
public class StockMovementResource {
	@Autowired
	private StockMovementRepository stockMovementRepository;
	
	@Autowired
	private StockMovementService stockMovementService;	
	
	@GetMapping
	@PreAuthorize("hasAuthority('ROLE_SEARCH_PRODUCT') and hasAuthority('SCOPE_read')")
	public List<StockMovement> list(){
		return stockMovementRepository.findAll();
	}
	
	@GetMapping("/{id}")
	@PreAuthorize("hasAuthority('ROLE_SEARCH_PRODUCT') and hasAuthority('SCOPE_read')")
	public ResponseEntity<StockMovement> findById(@PathVariable Long id) {
		Optional<StockMovement> stockMovement = stockMovementRepository.findById(id);
		if(stockMovement.isPresent()) {
			return ResponseEntity.ok(stockMovement.get());
		}
		return ResponseEntity.notFound().build();
	}
	@GetMapping("/enterprise/{enterpriseId}")
	@PreAuthorize("hasAuthority('ROLE_SEARCH_PRODUCT') and hasAuthority('SCOPE_read')")
	public List<StockMovement> findByEnterpriseId(@PathVariable Long enterpriseId) {
	    return stockMovementRepository.findByProductEnterpriseId(enterpriseId);
	}
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasAuthority('ROLE_REGISTER_PRODUCT') and hasAuthority('SCOPE_write')")
	public StockMovement create(@Valid @RequestBody StockMovement stockMovement) {
		return stockMovementService.save(stockMovement);
	}
	
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@PreAuthorize("hasAuthority('ROLE_REMOVE_PRODUCT') and hasAuthority('SCOPE_write')")
	public void delete(@PathVariable Long id) {
		stockMovementRepository.deleteById(id);
	}
	
	@GetMapping("/revenue/total")
    public Double getTotalRevenue(@RequestParam(defaultValue = "30D") String period) {
        return stockMovementService.getTotalRevenue(period);
    }
    
    @GetMapping("/revenue/product/{productId}")
    public Double getProductRevenue(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "30D") String period) {
        return stockMovementService.getProductRevenue(productId, period);
    }
    
    @GetMapping("/revenue/top-products")
    public Map<String, Double> getTopProducts(
            @RequestParam(defaultValue = "30D") String period,
            @RequestParam(defaultValue = "10") int limit) {
        return stockMovementService.getTopProductsByRevenue(period, limit);
    }
}
