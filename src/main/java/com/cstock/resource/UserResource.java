package com.cstock.resource;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
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
import com.cstock.domain.model.User;
import com.cstock.dto.UserUpdateDTO;
import com.cstock.repository.EnterpriseRepository;
import com.cstock.repository.UserRepository;
import com.cstock.service.UserService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserResource {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EnterpriseRepository enterpriseRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_SEARCH_USER') and hasAuthority('SCOPE_read')")
    public List<User> list(){
        return userRepository.findAll();
    }
    
    @GetMapping("/by-email/{email}")
    @PreAuthorize("hasAuthority('ROLE_SEARCH_USER') and hasAuthority('SCOPE_read')")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ROLE_REGISTER_USER') and hasAuthority('SCOPE_write')")
    public User create(@Valid @RequestBody User user, HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        
        boolean admin = isAdmin(authentication);
        
        if (admin) {
            if (user.getEnterprise() != null && user.getEnterprise().getId() != null) {
                Long enterpriseId = user.getEnterprise().getId();
                
                Enterprise selectedEnterprise = enterpriseRepository.findById(enterpriseId)
                        .orElseThrow(() -> new RuntimeException("Empresa selecionada não encontrada: " + enterpriseId));
                
                user.setEnterprise(selectedEnterprise);
            } else {
                throw new RuntimeException("Empresa é obrigatória para cadastro por administrador");
            }
        } else {
            Long enterpriseId = jwt.getClaim("enterprise_id");
            Enterprise userEnterprise = enterpriseRepository.findById(enterpriseId)
                    .orElseThrow(() -> new RuntimeException("Empresa do usuário logado não encontrada"));
            user.setEnterprise(userEnterprise);
        }
        
        return userService.save(user);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_REGISTER_ENTERPRISE"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SEARCH_USER') and hasAuthority('SCOPE_read')")
    public ResponseEntity<User> findById(@PathVariable Long id){
        Optional<User> user = userRepository.findById(id);
        if(user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_REMOVE_USER') and hasAuthority('SCOPE_write')")
    public void remove(@PathVariable Long id) {
        userService.delete(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_REGISTER_USER') and hasAuthority('SCOPE_write')")
    public ResponseEntity<User> update(@PathVariable Long id, @Valid @RequestBody UserUpdateDTO userDTO) {
        try {
            User updatedUser = userService.update(id, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}