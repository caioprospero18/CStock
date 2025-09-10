package com.cstock.service;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

import com.cstock.domain.model.Enterprise;
import com.cstock.repository.EnterpriseRepository;
import com.cstock.service.exception.BusinessException;


@Service
public class EnterpriseService {
	
	@Autowired
	private EnterpriseRepository enterpriseRepository;
	

	public Enterprise save(Enterprise enterprise) {
		if (enterpriseRepository.existsByCnpj(enterprise.getCnpj())) {
	        throw new BusinessException("CNPJ já cadastrado");
	    }
		return enterpriseRepository.save(enterprise);
	}
	
	
	public Enterprise update(Long id, Enterprise enterprise) {
		Enterprise enterpriseSaved = findEnterpriseById(id);
		BeanUtils.copyProperties(enterprise, enterpriseSaved, "id");
		return enterpriseRepository.save(enterpriseSaved);
	}
	
	public Enterprise findEnterpriseById(Long id) {
		Enterprise enterpriseSaved = enterpriseRepository.findById(id).orElseThrow(() -> new EmptyResultDataAccessException(1));
		return enterpriseSaved;
	}
	
	public List<Enterprise> findAll() {
	    return enterpriseRepository.findAll();
	}

	public void delete(Long id) {
	    Enterprise enterprise = findEnterpriseById(id);
	    enterpriseRepository.delete(enterprise);
	}

}
