package com.cstock.resource;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cstock.domain.model.Product;
import com.cstock.repository.ProductRepository;
import com.cstock.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/products")
public class ProductResource {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductService productService;    
    
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_SEARCH_PRODUCT') and hasAuthority('SCOPE_read')")
    public List<Product> list(){
        return productRepository.findByActiveTrue();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_SEARCH_PRODUCT') and hasAuthority('SCOPE_read')")
    public ResponseEntity<Product> findById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findByIdAndActiveTrue(id);
        if(product.isPresent()) {
            return ResponseEntity.ok(product.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/enterprise/{enterpriseId}")
    public List<Product> listByEnterprise(@PathVariable Long enterpriseId) {
        return productRepository.findByEnterpriseIdAndActiveTrue(enterpriseId);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ROLE_REGISTER_PRODUCT') and hasAuthority('SCOPE_write')")
    public Product create(@Valid @RequestBody Product product) {
        return productService.save(product);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_REMOVE_PRODUCT') and hasAuthority('SCOPE_write')")
    public void delete(@PathVariable Long id) {
        productService.deactivateProduct(id);
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('ROLE_REGISTER_PRODUCT') and hasAuthority('SCOPE_write')")
    public ResponseEntity<Product> activate(@PathVariable Long id) {
        Product activatedProduct = productService.activateProduct(id);
        return ResponseEntity.ok(activatedProduct);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_REGISTER_PRODUCT') and hasAuthority('SCOPE_write')")
    public ResponseEntity<Product> update(@PathVariable Long id, @Valid @RequestBody Product product) {
        Product productSaved = productService.update(id, product);
        return ResponseEntity.ok(productSaved);
    }
    
}