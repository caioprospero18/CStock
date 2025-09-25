package com.cstock.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
public class ResourceServerConfig {

    private final CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;
    private final JwtAuthenticationConverter jwtAuthenticationConverter;
    
    public ResourceServerConfig(CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler, JwtAuthenticationConverter jwtAuthenticationConverter) {
        this.customAuthenticationSuccessHandler = customAuthenticationSuccessHandler;
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
    }

    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/home", "/login", "/assets/**", "/public/**", 
                               "/actuator/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .requestMatchers("/api/**", "/products/**", "/admin/**").authenticated() 
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .successHandler(customAuthenticationSuccessHandler) 
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2 
                .jwt(jwt -> jwt
                		.jwtAuthenticationConverter(jwtAuthenticationConverter)
                )
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"))
            );

        return http.build();
    }

}