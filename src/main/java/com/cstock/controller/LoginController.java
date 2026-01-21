package com.cstock.controller;

import java.net.URLEncoder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping("/login")
    public String login(
            @RequestParam(required = false) String error,
            HttpSession session,
            Model model) {

        if (error != null) {
            model.addAttribute("error", "Usuário ou senha inválidos");
        }
        return "login";
    }

    @PostMapping("/login")
    public String processLogin(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String code_challenge,
            @RequestParam(defaultValue = "S256") String code_challenge_method,
            HttpSession session) {

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            SecurityContextHolder.getContext().setAuthentication(auth);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            return "redirect:/oauth2/authorize?" +
                    "response_type=code&client_id=cstock-ui" +
                    "&scope=openid%20profile%20read%20write" +
                    "&code_challenge=" + URLEncoder.encode(code_challenge, "UTF-8") +
                    "&code_challenge_method=" + code_challenge_method +
                    "&redirect_uri=" + URLEncoder.encode(frontendUrl + "/callback", "UTF-8");

        } catch (Exception e) {
            return "redirect:" + frontendUrl + "?error=true";
        }
    }
}