package com.cstock.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.cstock.domain.model.Enterprise;
import com.cstock.domain.model.Permission;
import com.cstock.domain.model.User;
import com.cstock.dto.UserUpdateDTO;
import com.cstock.repository.PermissionRepository;
import com.cstock.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private PermissionRepository permissionRepository;
	
	public User save(User user) {
	    if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
	        throw new IllegalArgumentException("Senha é obrigatória para novo usuário");
	    }
	    user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
	    user.setPermission(addCommonUserPermissions());
	    return userRepository.save(user);
	}
	
	public List<Permission> addCommonUserPermissions(){
		List<Permission> permissions = new ArrayList<>();
		permissions.add(permissionRepository.findById(1L).get());
		permissions.add(permissionRepository.findById(3L).get());
		permissions.add(permissionRepository.findById(4L).get());
		permissions.add(permissionRepository.findById(5L).get());
		permissions.add(permissionRepository.findById(6L).get());
		return permissions;
	}
	
	public User update(Long id, UserUpdateDTO userDTO) {
	    User userSaved = findUserById(id);
	    
	    userSaved.setUserName(userDTO.getUserName());
	    userSaved.setEmail(userDTO.getEmail());
	    userSaved.setPosition(userDTO.getPosition());
	    userSaved.setBirthDate(userDTO.getBirthDate());
	    
	    if (userDTO.getPassword() != null && !userDTO.getPassword().trim().isEmpty()) {
	        if (userDTO.getPassword().length() >= 6) {
	            userSaved.setPassword(new BCryptPasswordEncoder().encode(userDTO.getPassword()));
	        } else {
	            throw new IllegalArgumentException("A senha deve ter pelo menos 6 caracteres");
	        }
	    }
	    
	    return userRepository.save(userSaved);
	}

	
	public User findUserById(Long id) {
		User userSaved = userRepository.findById(id).orElseThrow(() -> new EmptyResultDataAccessException(1));
		return userSaved;
	}
	
	public User findByEmail(String email) {
	    return userRepository.findByEmail(email)
	        .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com email: " + email));
	}
	
	public void delete(Long id) {
	    User user = findUserById(id);
	    userRepository.delete(user);
	}

}




