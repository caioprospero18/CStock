package com.cstock.controller;

import java.net.URLEncoder;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
public class DemoAuthController {

    private final AuthenticationManager authenticationManager;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public DemoAuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @GetMapping("/api/auth/demo-login")
    public String demoLogin(
            @RequestParam("code_challenge") String codeChallenge,
            @RequestParam(value = "code_challenge_method", defaultValue = "S256") String method,
            HttpServletRequest request,
            HttpSession session) {

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken("recruiter@demo.com", "123456")
            );

            SecurityContextHolder.getContext().setAuthentication(auth);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            String redirectUri = URLEncoder.encode(frontendUrl + "/callback", "UTF-8");

            return "redirect:/oauth2/authorize?" +
                    "response_type=code&client_id=cstock-ui" +
                    "&scope=openid%20profile%20read%20write" +
                    "&code_challenge=" + URLEncoder.encode(codeChallenge, "UTF-8") +
                    "&code_challenge_method=" + method +
                    "&redirect_uri=" + redirectUri;

        } catch (Exception e) {
            return "redirect:" + frontendUrl + "?error=true";
        }
    }
}