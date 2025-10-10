package com.cstock.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cstock.domain.model.Enterprise;

public interface EnterpriseRepository extends JpaRepository<Enterprise, Long>{
	Optional<Enterprise> findById(Long id);
	Optional<Enterprise> findByEnterpriseName(String enterpriseName);
	boolean existsByCnpj(String cnpj);
	List<Enterprise> findAll();
}
