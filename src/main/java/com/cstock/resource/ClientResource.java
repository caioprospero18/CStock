package com.cstock.resource;

import com.cstock.domain.model.Client;
import com.cstock.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/clients")
@CrossOrigin(origins = "http://localhost:4200")
public class ClientResource {
    
	@Autowired
    private ClientService clientService;
    
    @GetMapping
    public ResponseEntity<List<Client>> findByCurrentUserEnterprise() {
        List<Client> clients = clientService.findByCurrentUserEnterprise();
        return ResponseEntity.ok(clients);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Client> findById(@PathVariable Long id) {
        Client client = clientService.findById(id);
        return ResponseEntity.ok(client);
    }
    
    @PostMapping
    public ResponseEntity<Client> create(@Valid @RequestBody Client client) {
        Client savedClient = clientService.save(client);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedClient);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Client> update(@PathVariable Long id, 
                                       @Valid @RequestBody Client client) {
        Client updatedClient = clientService.update(id, client);
        return ResponseEntity.ok(updatedClient);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/validate/email")
    public ResponseEntity<Boolean> validateEmail(@RequestParam String email) {
        boolean exists = clientService.emailExists(email);
        return ResponseEntity.ok(exists);
    }
    
    @GetMapping("/validate/identification")
    public ResponseEntity<Boolean> validateIdentificationNumber(@RequestParam String identificationNumber) {
        boolean exists = clientService.identificationNumberExists(identificationNumber);
        return ResponseEntity.ok(exists);
    }
}
