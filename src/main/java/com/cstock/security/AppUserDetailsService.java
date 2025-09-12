package com.cstock.security;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.stereotype.Service;

import com.cstock.domain.model.User;
import com.cstock.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class AppUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user = userOptional.orElseThrow(() -> new UsernameNotFoundException("Usuário e/ou senha incorretos"));
        
        if (user.getEnterprise() != null) {
            Hibernate.initialize(user.getEnterprise()); 
            System.out.println("Enterprise carregada: " + user.getEnterprise().getId());
        }
        
        return new SystemUser(user, getPermissions(user));
    }

    private Collection<? extends GrantedAuthority> getPermissions(User user) {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        user.getPermission().forEach(p -> authorities.add(
                new SimpleGrantedAuthority(p.getDescription().toUpperCase())));
        return authorities;
    }
    
    public OidcUserInfo loadUserInfo(SystemUser systemUser) {
    	System.out.println("=== 🎯 LOAD USER INFO CHAMADO ===");
        User user = systemUser.getUser();
        System.out.println("User: " + user.getEmail());
        System.out.println("Enterprise: " + (user.getEnterprise() != null ? user.getEnterprise().getId() : "null")); 
        Map<String, Object> claims = new HashMap<>();
        
        claims.put(StandardClaimNames.SUB, user.getEmail());
        claims.put(StandardClaimNames.NAME, user.getUserName()); 
        claims.put(StandardClaimNames.EMAIL, user.getEmail());
        claims.put(StandardClaimNames.PREFERRED_USERNAME, user.getEmail());
        
        claims.put("user_id", user.getId());
        claims.put("full_name", user.getUserName());
        
        if (user.getEnterprise() != null) {
            claims.put("enterprise_id", user.getEnterprise().getId());
            claims.put("enterprise_name", user.getEnterprise().getEnterpriseName());
        }
        
        return new OidcUserInfo(claims);
    }
}