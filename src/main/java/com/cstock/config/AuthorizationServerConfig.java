package com.cstock.config;

import java.io.InputStream;
import java.security.KeyStore;
import java.util.Enumeration;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.cert.Certificate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Configuration
public class AuthorizationServerConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthorizationServerConfig.class);

    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient cstockUi = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("cstock-ui")
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri("http://localhost:4200/callback")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope("read")
                .scope("write")
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(false)
                        .requireProofKey(true)
                        .build())
                .build();

        RegisteredClient swaggerClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("angular")
                .clientSecret("{noop}@ngul@r0")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri("http://localhost:8080/swagger-ui/oauth2-redirect.html")
                .scope("read")
                .scope("write")
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(false)
                        .requireProofKey(false)
                        .build())
                .build();
        
        RegisteredClient postmanTestClient = RegisteredClient.withId(UUID.randomUUID().toString())
        	    .clientId("postman-test")
        	    .clientSecret("{noop}postman-secret")
        	    .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
        	    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
        	    .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
        	    .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
        	    .redirectUri("https://oidcdebugger.com/debug") 
        	    .redirectUri("http://localhost:4200/callback") 
        	    .scope("read")
        	    .scope("write")
        	    .scope(OidcScopes.OPENID)
        	    .scope(OidcScopes.PROFILE)
        	    .clientSettings(ClientSettings.builder()
        	        .requireAuthorizationConsent(false)
        	        .requireProofKey(false) 
        	        .build())
        	    .build();

        return new InMemoryRegisteredClientRepository(cstockUi, swaggerClient, postmanTestClient);
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityFilterChain asSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
        
        http
            .cors(Customizer.withDefaults())
            .getConfigurer(OAuth2AuthorizationServerConfigurer.class)
            .oidc(Customizer.withDefaults())
            .authorizationEndpoint(authorizationEndpoint ->
                authorizationEndpoint.consentPage(null) 
            );
        
        http
            .exceptionHandling(exceptions ->
                exceptions.authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"))
            );
        
        return http.build();
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE - 10) 
    public Filter debugOAuth2Filter() {
        return (request, response, chain) -> {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            if (httpRequest.getRequestURI().equals("/oauth2/authorize")) {
                System.out.println("=== 🚀 OAUTH2 AUTHORIZE REQUEST DEBUG ===");
                System.out.println("📋 URL: " + httpRequest.getRequestURL());
                System.out.println("🔍 Method: " + httpRequest.getMethod());
                System.out.println("🔗 Query String: " + httpRequest.getQueryString());
                
                System.out.println("📊 Parameters:");
                Enumeration<String> paramNames = httpRequest.getParameterNames();
                while (paramNames.hasMoreElements()) {
                    String paramName = paramNames.nextElement();
                    String paramValue = httpRequest.getParameter(paramName);
                    System.out.println("   " + paramName + " = " + paramValue);
                    
                    if ("code_challenge".equals(paramName)) {
                        System.out.println("   ⚡ CODE_CHALLENGE LENGTH: " + (paramValue != null ? paramValue.length() : "null"));
                        System.out.println("   ⚡ CODE_CHALLENGE VALUE: " + (paramValue != null ? paramValue.substring(0, Math.min(20, paramValue.length())) + "..." : "null"));
                    }
                }
                
                System.out.println("=== 🎯 END DEBUG ===");
            }
            
            chain.doFilter(request, response);
            
            if (httpRequest.getRequestURI().equals("/oauth2/authorize")) {
                System.out.println("=== 📝 OAUTH2 AUTHORIZE RESPONSE ===");
                System.out.println("📋 Status: " + httpResponse.getStatus());
                System.out.println("=====================================");
            }
        };
    }

    @Bean
    public JWKSet jwkSet(
        @Value("${security.oauth2.jwk.keystore.location:classpath:keystore/cstock.jks}") String keystoreLocation,
        @Value("${security.oauth2.jwk.keystore.storepass:cstockkeystorepass}") String storePass,
        @Value("${security.oauth2.jwk.keystore.keyalias:cstock}") String keyAlias,
        @Value("${security.oauth2.jwk.keystore.keypass:cstockkeypass}") String keyPass
    ) throws Exception {
        try {
            logger.info("Tentando carregar keystore para JWK em: {}", keystoreLocation);
            Resource resource;
            if (keystoreLocation.startsWith("classpath:")) {
                resource = new ClassPathResource(keystoreLocation.substring("classpath:".length()));
            } else {
                resource = new org.springframework.core.io.FileSystemResource(keystoreLocation);
            }

            if (!resource.exists()) {
                throw new IllegalStateException("Keystore não encontrado em: " + keystoreLocation);
            }

            try (InputStream is = resource.getInputStream()) {
                KeyStore keyStore = KeyStore.getInstance("JKS");
                keyStore.load(is, storePass.toCharArray());

                KeyStore.PrivateKeyEntry pkEntry = (KeyStore.PrivateKeyEntry) keyStore.getEntry(
                        keyAlias, new KeyStore.PasswordProtection(keyPass.toCharArray()));
                if (pkEntry == null) {
                    throw new IllegalStateException("Alias '" + keyAlias + "' não encontrado no keystore.");
                }
                RSAPrivateKey privateKey = (RSAPrivateKey) pkEntry.getPrivateKey();
                Certificate cert = pkEntry.getCertificate();
                RSAPublicKey publicKey = (RSAPublicKey) cert.getPublicKey();

                String kid = UUID.randomUUID().toString();
                RSAKey rsaKey = new RSAKey.Builder(publicKey)
                        .privateKey(privateKey)
                        .keyID(kid)
                        .build();

                logger.info("Keystore carregado com sucesso. Usando keyId={}", kid);
                return new JWKSet(rsaKey);
            }
        } catch (Exception ex) {
            logger.warn("Falha ao carregar keystore JKS ({}). Gerando RSAKey em memória como fallback. Mensagem: {}",
                    keystoreLocation, ex.getMessage());

            KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
            keyPairGen.initialize(2048);
            KeyPair kp = keyPairGen.generateKeyPair();

            RSAPublicKey publicKey = (RSAPublicKey) kp.getPublic();
            RSAPrivateKey privateKey = (RSAPrivateKey) kp.getPrivate();

            String kid = UUID.randomUUID().toString();
            RSAKey rsaKey = new RSAKey.Builder(publicKey)
                    .privateKey(privateKey)
                    .keyID(kid)
                    .build();

            logger.info("JWK fallback gerado em memória com keyId={}", kid);
            return new JWKSet(rsaKey);
        }
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource(JWKSet jwkSet) {
        return (selector, ctx) -> selector.select(jwkSet);
    }

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }
    
    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer("http://localhost:8080")
                .build();
    }
}