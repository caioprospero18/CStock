package com.cstock.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class SecurityBeansConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder bcryptEncoder = new BCryptPasswordEncoder();
        
        Map<String, PasswordEncoder> encoders = new HashMap<>();
        encoders.put("bcrypt", bcryptEncoder);
        
        DelegatingPasswordEncoder delegatingEncoder = new DelegatingPasswordEncoder(
            "bcrypt", encoders);
        
        delegatingEncoder.setDefaultPasswordEncoderForMatches(bcryptEncoder);
        
        return delegatingEncoder;
    }
    
    @Bean
    public CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler() {
        return new CustomAuthenticationSuccessHandler();
    }
}