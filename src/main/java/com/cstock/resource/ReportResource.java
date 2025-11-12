package com.cstock.resource;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cstock.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportResource {
    
    private final ReportService reportService;
    
    public ReportResource(ReportService reportService) {
        this.reportService = reportService;
    }
    
    @PostMapping("/test-daily")
    public ResponseEntity<String> testDailyReport() {
        try {
            reportService.generateDailyReport();
            return ResponseEntity.ok("Relatório diário gerado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body("Erro ao gerar relatório: " + e.getMessage());
        }
    }
    
    @PostMapping("/test-monthly")
    public ResponseEntity<String> testMonthlyReport() {
        try {
            reportService.generateMonthlyReport();
            return ResponseEntity.ok("Relatório mensal gerado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body("Erro ao gerar relatório: " + e.getMessage());
        }
    }
}