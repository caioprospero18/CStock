package com.cstock.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;

import com.cstock.security.SystemUser;

@Configuration
public class TokenCustomizerConfig {

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer() {
        return context -> {
            if (context.getPrincipal().getPrincipal() instanceof SystemUser) {
                SystemUser systemUser = (SystemUser) context.getPrincipal().getPrincipal();
                
                List<String> roles = systemUser.getAuthorities().stream()
                    .map(auth -> "ROLE_" + auth.getAuthority()) 
                    .toList();
                
                context.getClaims().claim("name", systemUser.getUser().getUserName());
                context.getClaims().claim("email", systemUser.getUser().getEmail());
                context.getClaims().claim("preferred_username", systemUser.getUser().getEmail());
                context.getClaims().claim("roles", roles);
                
                if (systemUser.getUser().getEnterprise() != null) {
                    context.getClaims().claim("enterprise_id", systemUser.getUser().getEnterprise().getId());
                    context.getClaims().claim("enterprise_name", systemUser.getUser().getEnterprise().getEnterpriseName());
                }
            }
        };
    }
}