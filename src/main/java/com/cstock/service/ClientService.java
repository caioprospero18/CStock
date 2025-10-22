package com.cstock.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cstock.domain.model.Client;
import com.cstock.domain.model.Enterprise;
import com.cstock.repository.ClientRepository;
import com.cstock.repository.EnterpriseRepository;

@Service
public class ClientService {
    
    @Autowired
    private ClientRepository clientRepository;
    
    @Autowired
    private EnterpriseRepository enterpriseRepository;
    
    public List<Client> findByCurrentUserEnterprise() {
        Long enterpriseId = getCurrentUserEnterpriseId();
        return clientRepository.findByEnterpriseId(enterpriseId);
    }
    
    public List<Client> findAll() {
        return clientRepository.findAll();
    }
    
    public Client findById(Long id) {
        Long enterpriseId = getCurrentUserEnterpriseId();
        return clientRepository.findByIdAndEnterpriseId(id, enterpriseId)
            .orElseThrow(() -> new EmptyResultDataAccessException("Cliente não encontrado", 1));
    }
    
    @Transactional
    public Client save(Client client) {
        if (client.getClientName() == null || client.getClientName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do cliente é obrigatório");
        }
        
        Long enterpriseId = getCurrentUserEnterpriseId();
        Enterprise enterprise = enterpriseRepository.findById(enterpriseId)
            .orElseThrow(() -> new EmptyResultDataAccessException("Empresa não encontrada", 1));
        
        client.setEnterprise(enterprise);
        
        return clientRepository.save(client);
    }
    
    @Transactional
    public Client update(Long id, Client client) {
        Client existingClient = findById(id);
        
        existingClient.setClientName(client.getClientName());
        existingClient.setEmail(client.getEmail());
        existingClient.setPhone(client.getPhone());
        existingClient.setIdentificationNumber(client.getIdentificationNumber());
        
        
        return clientRepository.save(existingClient);
    }
    
    @Transactional
    public void delete(Long id) {
        Client client = findById(id);
        clientRepository.delete(client);
    }
    
    private Long getCurrentUserEnterpriseId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            
            if (authentication instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
                Jwt jwt = jwtAuth.getToken();
                
                Object enterpriseIdClaim = jwt.getClaim("enterprise_id");
                
                if (enterpriseIdClaim != null) {
                    try {
                        return Long.valueOf(enterpriseIdClaim.toString());
                    } catch (NumberFormatException e) {
                        throw new SecurityException("Enterprise ID inválido no token JWT: " + enterpriseIdClaim);
                    }
                } else {
                    throw new SecurityException("Enterprise ID não encontrado no token JWT");
                }
            } 
            else if (authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                Object enterpriseIdClaim = jwt.getClaim("enterprise_id");
                
                if (enterpriseIdClaim != null) {
                    return Long.valueOf(enterpriseIdClaim.toString());
                } else {
                    throw new SecurityException("Enterprise ID não encontrado no token JWT");
                }
            }
            else {
                throw new SecurityException("Tipo de autenticação não suportado: " + authentication.getClass().getName());
            }
        }
        
        throw new SecurityException("Usuário não autenticado");
    }
    
    public boolean emailExists(String email) {
        Long enterpriseId = getCurrentUserEnterpriseId();
        return clientRepository.findByEmail(email)
            .map(client -> client.getEnterprise().getId().equals(enterpriseId))
            .orElse(false);
    }
    
    public boolean identificationNumberExists(String identificationNumber) {
        Long enterpriseId = getCurrentUserEnterpriseId();
        return clientRepository.findByIdentificationNumber(identificationNumber)
            .map(client -> client.getEnterprise().getId().equals(enterpriseId))
            .orElse(false);
    }
    
    public Client findByIdWithoutEnterpriseCheck(Long id) {
        return clientRepository.findById(id)
            .orElseThrow(() -> new EmptyResultDataAccessException("Cliente não encontrado", 1));
    }
    
    public boolean belongsToCurrentUserEnterprise(Long clientId) {
        try {
            Long enterpriseId = getCurrentUserEnterpriseId();
            return clientRepository.findByIdAndEnterpriseId(clientId, enterpriseId).isPresent();
        } catch (Exception e) {
            return false;
        }
    }
}