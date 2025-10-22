package com.cstock.repository;

import com.cstock.domain.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    
    List<Client> findByEnterpriseId(Long enterpriseId);
    Optional<Client> findByEmail(String email);
    Optional<Client> findByIdentificationNumber(String identificationNumber);
    Optional<Client> findByIdAndEnterpriseId(Long id, Long enterpriseId);
}