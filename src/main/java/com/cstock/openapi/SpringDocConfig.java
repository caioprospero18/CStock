package com.cstock.openapi;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SpringDocConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("CStock API").version("1.0"))
                .components(new Components()
                        .addSecuritySchemes("oauth2", new SecurityScheme()
                                .type(SecurityScheme.Type.OAUTH2)
                                .flows(new OAuthFlows()
                                        .authorizationCode(new OAuthFlow()
                                                .authorizationUrl("http://localhost:8080/oauth2/authorize") // URL de autorização do seu servidor OAuth2
                                                .tokenUrl("http://localhost:8080/oauth2/token") // URL do token do seu servidor OAuth2
                                                .scopes(new Scopes().addString("read", "Permissão de leitura").addString("write", "Permissão de escrita"))
                                        )
                                )
                        )
                )
                .security(List.of(new SecurityRequirement().addList("oauth2")));
    }
}
