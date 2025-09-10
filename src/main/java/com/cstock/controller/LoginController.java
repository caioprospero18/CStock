package com.cstock.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {

    private final AuthenticationManager authenticationManager;

    @Autowired
    public LoginController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @GetMapping("/login")
    public String login(@RequestParam(value = "error", required = false) String error,
                       @RequestParam(value = "logout", required = false) String logout,
                       @RequestParam(value = "code_challenge", required = false) String codeChallenge,
                       @RequestParam(value = "code_challenge_method", required = false) String codeChallengeMethod,
                       @RequestParam(value = "username", required = false) String username, // ⬅️ NOVO
                       @RequestParam(value = "password", required = false) String password, // ⬅️ NOVO
                       HttpSession session,
                       Model model) {
        
        System.out.println("=== GET LOGIN ===");
        System.out.println("Code challenge from URL: " + codeChallenge);
        System.out.println("Username from URL: " + username);
        
        if (username != null && password != null && codeChallenge != null) {
            try {
                System.out.println("Processando login automático via GET");
                
                UsernamePasswordAuthenticationToken token = 
                    new UsernamePasswordAuthenticationToken(username, password);
                
                Authentication authentication = authenticationManager.authenticate(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

                String encodedChallenge = java.net.URLEncoder.encode(codeChallenge, "UTF-8");
                String encodedRedirect = java.net.URLEncoder.encode("http://localhost:4200/callback", "UTF-8");
                
                String redirectUrl = "/oauth2/authorize?" +
                        "response_type=code&" +
                        "client_id=cstock-ui&" +
                        "scope=openid%20profile%20read%20write&" +
                        "code_challenge=" + encodedChallenge + "&" +
                        "code_challenge_method=" + (codeChallengeMethod != null ? codeChallengeMethod : "S256") + "&" +
                        "redirect_uri=" + encodedRedirect;
                
                System.out.println("🔗 Redirect URL: " + redirectUrl);
                
                return "redirect:" + redirectUrl;
                
            } catch (Exception e) {
                System.out.println("❌ Login error: " + e.getMessage());
                model.addAttribute("error", "Usuário ou senha inválidos");
            }
        }
        
        if (codeChallenge != null) {
            session.setAttribute("pkce_code_challenge", codeChallenge);
            session.setAttribute("pkce_code_challenge_method", codeChallengeMethod);
            System.out.println("Stored in session: " + codeChallenge);
        } else {
            System.out.println("⚠️ Code challenge não veio na URL");
        }
        
        if (error != null) {
            model.addAttribute("error", "Usuário ou senha inválidos");
        }
        
        if (logout != null) {
            model.addAttribute("message", "Logout realizado com sucesso");
        }
        
        return "login";
    }

    @PostMapping("/login")
    public String processLogin(@RequestParam String username,
                              @RequestParam String password,
                              @RequestParam(value = "code_challenge", required = false) String codeChallenge,
                              @RequestParam(value = "code_challenge_method", required = false) String codeChallengeMethod,
                              HttpSession session) {
        
        try {
            System.out.println("=== PROCESS LOGIN POST ===");
            System.out.println("Username: " + username);
            System.out.println("Code challenge from form: " + codeChallenge);
            
            UsernamePasswordAuthenticationToken token = 
                new UsernamePasswordAuthenticationToken(username, password);
            
            Authentication authentication = authenticationManager.authenticate(token);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            // ⬇️ Tenta recuperar da sessão se não veio no form
            String finalChallenge = codeChallenge;
            String finalMethod = codeChallengeMethod;
            
            if (finalChallenge == null) {
                finalChallenge = (String) session.getAttribute("pkce_code_challenge");
                finalMethod = (String) session.getAttribute("pkce_code_challenge_method");
                System.out.println("Using challenge from session: " + finalChallenge);
            }
            
            if (finalChallenge == null) {
                System.out.println("❌ ERRO: Code challenge não encontrado!");
                return "redirect:/login?error=true";
            }
            
            String encodedChallenge = java.net.URLEncoder.encode(finalChallenge, "UTF-8");
            String encodedRedirect = java.net.URLEncoder.encode("http://localhost:4200/callback", "UTF-8");
            
            String redirectUrl = "/oauth2/authorize?" +
                    "response_type=code&" +
                    "client_id=cstock-ui&" +
                    "scope=openid%20profile%20read%20write&" +
                    "code_challenge=" + encodedChallenge + "&" +
                    "code_challenge_method=" + (finalMethod != null ? finalMethod : "S256") + "&" +
                    "redirect_uri=" + encodedRedirect;
            
            System.out.println("🔗 Redirect URL: " + redirectUrl);
            
            return "redirect:" + redirectUrl;
            
        } catch (Exception e) {
            System.out.println("❌ Login error: " + e.getMessage());
            return "redirect:/login?error=true";
        }
    }
}