package com.cstock.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {

    private final AuthenticationManager authenticationManager;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${oauth.client-id}")
    private String clientId;

    public LoginController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @GetMapping("/login")
    public String login(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam("code_challenge") String codeChallenge,
            @RequestParam(defaultValue = "S256") String codeChallengeMethod,
            HttpSession session) {
    	System.out.println("FRONTEND URL: " + frontendUrl);

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            SecurityContextHolder.getContext().setAuthentication(auth);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            String redirectUri = URLEncoder.encode(
                    frontendUrl + "/callback",
                    StandardCharsets.UTF_8
            );

            return "redirect:/oauth2/authorize" +
                    "?response_type=code" +
                    "&client_id=" + clientId +
                    "&scope=openid%20profile%20read%20write" +
                    "&code_challenge=" + URLEncoder.encode(codeChallenge, StandardCharsets.UTF_8) +
                    "&code_challenge_method=" + codeChallengeMethod +
                    "&redirect_uri=" + redirectUri;

        } catch (Exception ex) {
            return "redirect:" + frontendUrl + "?error=true";
        }
    }
}