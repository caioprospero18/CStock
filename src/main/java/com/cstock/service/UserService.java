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
import com.cstock.domain.model.Position;
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
	    user.setPermission(getPermissionsByPosition(user.getPosition()));
	    return userRepository.save(user);
	}
	
	public List<Permission> getPermissionsByPosition(Position position) {
        List<Permission> permissions = new ArrayList<>();
        
        if (position == null) {
            return getViewerPermissions(); 
        }
        
        switch (position) {
            case ADMIN:
                permissions.addAll(getAdminPermissions());
                break;
            case CEO:
                permissions.addAll(getCEOPermissions());
                break;
            case MANAGER:
                permissions.addAll(getManagerPermissions());
                break;
            case OPERATOR:
                permissions.addAll(getOperatorPermissions());
                break;
            case FINANCIAL:
                permissions.addAll(getFinancialPermissions());
                break;
            case VIEWER:
            default:
                permissions.addAll(getViewerPermissions());
                break;
        }
        
        return permissions;
    }
	
	private List<Permission> getAdminPermissions() {
        List<Permission> permissions = new ArrayList<>();
        for (long i = 1; i <= 8; i++) {
            permissionRepository.findById(i).ifPresent(permissions::add);
        }
        return permissions;
    }
	
	private List<Permission> getCEOPermissions() {
        List<Permission> permissions = new ArrayList<>();
        permissions.add(permissionRepository.findById(2L).orElse(null)); 
        permissions.add(permissionRepository.findById(3L).orElse(null));
        permissions.add(permissionRepository.findById(4L).orElse(null)); 
        permissions.add(permissionRepository.findById(5L).orElse(null)); 
        permissions.add(permissionRepository.findById(6L).orElse(null)); 
        permissions.add(permissionRepository.findById(7L).orElse(null)); 
        permissions.add(permissionRepository.findById(8L).orElse(null)); 
        return permissions.stream().filter(p -> p != null).toList();
    }
	
	private List<Permission> getManagerPermissions() {
        List<Permission> permissions = new ArrayList<>();
        permissions.add(permissionRepository.findById(2L).orElse(null));
        permissions.add(permissionRepository.findById(4L).orElse(null));
        permissions.add(permissionRepository.findById(5L).orElse(null)); 
        permissions.add(permissionRepository.findById(6L).orElse(null)); 
        permissions.add(permissionRepository.findById(7L).orElse(null)); 
        permissions.add(permissionRepository.findById(8L).orElse(null)); 
        return permissions.stream().filter(p -> p != null).toList();
    }
	
	private List<Permission> getOperatorPermissions() {
        List<Permission> permissions = new ArrayList<>();
        permissions.add(permissionRepository.findById(5L).orElse(null)); 
        permissions.add(permissionRepository.findById(6L).orElse(null));
        permissions.add(permissionRepository.findById(7L).orElse(null)); 
        permissions.add(permissionRepository.findById(8L).orElse(null)); 
        return permissions.stream().filter(p -> p != null).toList();
    }
	
	private List<Permission> getFinancialPermissions() {
        List<Permission> permissions = new ArrayList<>();
        permissions.add(permissionRepository.findById(4L).orElse(null)); 
        permissions.add(permissionRepository.findById(7L).orElse(null)); 
        return permissions.stream().filter(p -> p != null).toList();
    }
	
	private List<Permission> getViewerPermissions() {
        List<Permission> permissions = new ArrayList<>();
        permissions.add(permissionRepository.findById(4L).orElse(null));
        permissions.add(permissionRepository.findById(7L).orElse(null)); 
        return permissions.stream().filter(p -> p != null).toList();
    }
	
	public User update(Long id, UserUpdateDTO userDTO) {
        User userSaved = findUserById(id);
        
        userSaved.setUserName(userDTO.getUserName());
        userSaved.setEmail(userDTO.getEmail());
        userSaved.setPosition(userDTO.getPosition());
        userSaved.setBirthDate(userDTO.getBirthDate());
        
        if (userDTO.getPosition() != null && !userDTO.getPosition().equals(userSaved.getPosition())) {
            userSaved.setPermission(getPermissionsByPosition(userDTO.getPosition()));
        }
                
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
	
	public List<User> findAll() {
	    return userRepository.findAll();
	}

	public List<User> findByEnterpriseId(Long enterpriseId) {
	    return userRepository.findByEnterpriseId(enterpriseId);
	}

	public User findByIdAndEnterpriseId(Long id, Long enterpriseId) {
	    return userRepository.findByIdAndEnterpriseId(id, enterpriseId)
	        .orElseThrow(() -> new EmptyResultDataAccessException("Usuário não encontrado", 1));
	}

}




