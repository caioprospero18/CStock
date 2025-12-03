package com.cstock.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cstock.domain.model.Enterprise;
import com.cstock.domain.model.User;

public interface UserRepository extends JpaRepository<User, Long>{

	Optional<User> findByEmail(String email);
	List<User> findByPositionIn(List<String> positions);
	List<User> findByPositionInAndEnterprise(List<String> positions, Enterprise enterprise);
	List<User> findByEnterpriseId(Long enterpriseId);
    List<User> findAll();
    Optional<User> findByIdAndEnterpriseId(Long id, Long enterpriseId);
    Optional<User> findByIdAndActiveTrue(Long id);
    Optional<User> findByEmailAndActiveTrue(String email);
    List<User> findByActiveTrue();
    List<User> findByEnterpriseIdAndActiveTrue(Long enterpriseId);
}
