package com.cstock.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cstock.domain.model.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Long>{

	Optional<Permission> findById(long id);

}
