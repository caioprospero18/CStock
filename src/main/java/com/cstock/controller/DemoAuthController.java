package com.cstock.controller;

import java.net.URLEncoder;

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

    public DemoAuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @GetMapping("/api/auth/demo-login")
    public String demoLogin(
            @RequestParam("code_challenge") String codeChallenge,
            @RequestParam(value = "code_challenge_method", defaultValue = "S256") String codeChallengeMethod,
            HttpServletRequest request,
            HttpSession session) {

        try {
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken("recruiter@demo.com", "123456");

            Authentication authentication = authenticationManager.authenticate(authToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());


            String encodedChallenge = URLEncoder.encode(codeChallenge, "UTF-8");
            String encodedRedirect = URLEncoder.encode("http://localhost:4200/callback", "UTF-8");

            return "redirect:/oauth2/authorize?" +
                    "response_type=code&" +
                    "client_id=cstock-ui&" +
                    "scope=openid%20profile%20read%20write&" +
                    "code_challenge=" + encodedChallenge + "&" +
                    "code_challenge_method=" + codeChallengeMethod + "&" +
                    "redirect_uri=" + encodedRedirect;

        } catch (Exception e) {
            return "redirect:http://localhost:4200?error=true";
        }
    }
}
