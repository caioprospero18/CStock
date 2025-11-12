package com.cstock.scheduler;


import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.cstock.service.ReportService;

@Component
public class ReportScheduler {
    
    private final ReportService reportService;
    
    public ReportScheduler(ReportService reportService) {
        this.reportService = reportService;
    }
    
    @Scheduled(cron = "0 0 9 * * MON-FRI") 
    public void sendDailyReport() {
        reportService.generateDailyReport();
    }
}