package com.cstock.service;

import java.math.BigDecimal;
import java.util.Locale;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.cstock.domain.model.Enterprise;
import com.cstock.dto.ReportDTO;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }
    
    public void sendReportEmail(String to, ReportDTO report, Enterprise enterprise) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(buildEmailSubject(report, enterprise));
            helper.setText(buildEmailContent(report, enterprise), true);
            
            mailSender.send(message);
            
        } catch (MessagingException e) {
            throw new RuntimeException("Erro ao enviar email para: " + to, e);
        }
    }

    private String buildEmailSubject(ReportDTO report, Enterprise enterprise) {
        if ("MENSAL".equals(report.getReportType())) {
            return "📊 Relatório Mensal - " + enterprise.getEnterpriseName() + " - CStock System";
        } else {
            return "📊 Relatório Diário - " + enterprise.getEnterpriseName() + " - CStock System";
        }
    }

    private String buildEmailContent(ReportDTO report, Enterprise enterprise) {
        Context context = new Context(new Locale("pt", "BR"));
        context.setVariable("report", report);
        context.setVariable("enterprise", enterprise);
        context.setVariable("formatCurrency", new CurrencyFormatter());
        
        return templateEngine.process("email/report-template", context);
    }
    
    public static class CurrencyFormatter {
        public String format(BigDecimal value) {
            if (value == null) return "R$ 0,00";
            return String.format("R$ %.2f", value);
        }
    }
}
