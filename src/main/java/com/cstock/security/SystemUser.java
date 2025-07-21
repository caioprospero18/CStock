package com.cstock.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;

import com.cstock.domain.model.User;



public class SystemUser extends org.springframework.security.core.userdetails.User{

	private static final long serialVersionUID = 1L;

	private User usuario;

	public SystemUser(User usuario, Collection<? extends GrantedAuthority> authorities) {
		super(usuario.getEmail(), usuario.getPassword(), authorities);
		this.usuario = usuario;
	}

	public User getUser() {
		return usuario;
	}
	
}
