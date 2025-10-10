package com.cstock.scheduler;

import com.cstock.service.ReportService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReportScheduler {
    
    private final ReportService reportService;
    
    public ReportScheduler(ReportService reportService) {
        this.reportService = reportService;
    }
    
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendDailyReport() {
        reportService.generateDailyReport();
        
        if (isLastDayOfMonth()) {
            reportService.generateMonthlyReport();
        }
    }
    
    private boolean isLastDayOfMonth() {
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate lastDay = today.withDayOfMonth(today.lengthOfMonth());
        return today.equals(lastDay);
    }
}
