package com.cstock.security;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import com.cstock.domain.model.User;

public class SystemUser extends org.springframework.security.core.userdetails.User implements OidcUser {

    private static final long serialVersionUID = 1L;

    private User usuario;
    private OidcIdToken idToken;
    private OidcUserInfo userInfo;
    
    public SystemUser(User usuario, Collection<? extends GrantedAuthority> authorities) {
        super(usuario.getEmail(), usuario.getPassword(), authorities);
        this.usuario = usuario;
    }

    public User getUser() {
        return usuario;
    }
    
    @Override
    public Map<String, Object> getClaims() {
        return getAttributes();
    }
    
    @Override
    public OidcUserInfo getUserInfo() {
        if (this.userInfo == null) {
            
            Map<String, Object> claims = new HashMap<>();
            claims.put("sub", usuario.getEmail());
            claims.put("name", usuario.getUserName()); 
            claims.put("email", usuario.getEmail());
            claims.put("preferred_username", usuario.getEmail());
            this.userInfo = new OidcUserInfo(claims);
        }
        return this.userInfo;
    }
    
    @Override
    public OidcIdToken getIdToken() {
        return this.idToken;
    }
    
    public void setUserInfo(OidcUserInfo userInfo) {
        this.userInfo = userInfo;
    }
    
    public void setIdToken(OidcIdToken idToken) {
        this.idToken = idToken;
    }
    
    @Override
    public String getName() {
        return usuario.getEmail();
    }
    
    @Override
    public Map<String, Object> getAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", usuario.getEmail());
        attributes.put("name", usuario.getUserName()); 
        attributes.put("email", usuario.getEmail());
        attributes.put("preferred_username", usuario.getEmail());
        
        attributes.put("roles", getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .toList());
            
        return attributes;
    }
}