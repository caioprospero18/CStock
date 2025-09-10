package com.cstock.resource;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cstock.domain.model.Enterprise;
import com.cstock.service.EnterpriseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/enterprises")
public class EnterpriseResource {
    
    @Autowired
    private EnterpriseService enterpriseService;
    
    @GetMapping
    public List<Enterprise> list(){
        return enterpriseService.findAll();
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Enterprise create(@Valid @RequestBody Enterprise enterprise) {
        return enterpriseService.save(enterprise);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Enterprise> findById(@PathVariable Long id){
        try {
            Enterprise enterprise = enterpriseService.findEnterpriseById(id);
            return ResponseEntity.ok(enterprise);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long id) {
        enterpriseService.delete(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Enterprise> update(@PathVariable Long id, @Valid @RequestBody Enterprise enterprise) {
        try {
            Enterprise enterpriseSaved = enterpriseService.update(id, enterprise);
            return ResponseEntity.ok(enterpriseSaved);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}