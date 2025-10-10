package com.cstock.service;

import com.cstock.dto.ReportDTO;
import com.cstock.domain.model.StockMovement;
import com.cstock.domain.model.User;
import com.cstock.domain.model.MovementType;
import com.cstock.domain.model.Enterprise;
import com.cstock.repository.StockMovementRepository;
import com.cstock.repository.UserRepository;
import com.cstock.repository.EnterpriseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {
    
    private final StockMovementRepository stockMovementRepository;
    private final UserRepository userRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final EmailService emailService;
    
    public ReportService(StockMovementRepository stockMovementRepository, 
                        UserRepository userRepository,
                        EnterpriseRepository enterpriseRepository,
                        EmailService emailService) {
        this.stockMovementRepository = stockMovementRepository;
        this.userRepository = userRepository;
        this.enterpriseRepository = enterpriseRepository;
        this.emailService = emailService;
    }
    
    public void generateDailyReport() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        generateEnterpriseReports(yesterday, yesterday, "DIARIO");
    }
    
    public void generateMonthlyReport() {
        LocalDate lastDayOfMonth = LocalDate.now().minusMonths(1).withDayOfMonth(1).plusMonths(1).minusDays(1);
        LocalDate firstDayOfMonth = lastDayOfMonth.withDayOfMonth(1);
        generateEnterpriseReports(firstDayOfMonth, lastDayOfMonth, "MENSAL");
    }
    
    private void generateEnterpriseReports(LocalDate startDate, LocalDate endDate, String reportType) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        List<Enterprise> enterprises = enterpriseRepository.findAll();
        
        for (Enterprise enterprise : enterprises) {
            System.out.println("🏢 Gerando relatório para empresa: " + enterprise.getEnterpriseName());
            
            List<StockMovement> movements = stockMovementRepository
                .findByMovementDateBetweenAndProduct_Enterprise(
                    startDateTime, endDateTime, enterprise);
            
            if (!movements.isEmpty()) {
                ReportDTO report = buildReportDTO(movements, startDate, endDate, reportType, enterprise);
                sendReportToEnterpriseManagers(report, enterprise);
            } else {
                System.out.println("ℹ️  Nenhuma movimentação encontrada para empresa: " + enterprise.getEnterpriseName());
            }
        }
    }
    
    private ReportDTO buildReportDTO(List<StockMovement> movements, LocalDate startDate, 
                                   LocalDate endDate, String reportType, Enterprise enterprise) {
        ReportDTO report = new ReportDTO();
        report.setReportDate(LocalDate.now());
        report.setReportType(reportType);
        
        List<ReportDTO.StockMovementReport> movementReports = movements.stream()
            .map(this::convertToMovementReport)
            .collect(Collectors.toList());
        
        report.setMovements(movementReports);
        
        BigDecimal totalRevenue = movements.stream()
            .filter(m -> m.getMovementType() == MovementType.EXIT)
            .map(m -> BigDecimal.valueOf(m.getProduct().getUnitValue() * m.getQuantity()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalExpenses = movements.stream()
            .filter(m -> m.getMovementType() == MovementType.ENTRY)
            .map(m -> BigDecimal.valueOf(m.getProduct().getUnitValue() * m.getQuantity()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        report.setTotalRevenue(totalRevenue);
        report.setTotalExpenses(totalExpenses);
        report.setNetProfit(totalRevenue.subtract(totalExpenses));
        report.setTotalEntries((int) movements.stream().filter(m -> m.getMovementType() == MovementType.ENTRY).count());
        report.setTotalExits((int) movements.stream().filter(m -> m.getMovementType() == MovementType.EXIT).count());
        
        return report;
    }
    
    private void sendReportToEnterpriseManagers(ReportDTO report, Enterprise enterprise) {
        List<User> managers = userRepository.findByPositionInAndEnterprise(
            List.of("MANAGER", "CEO"), enterprise);
                
        for (User manager : managers) {
            if (manager.getEmail() != null && !manager.getEmail().isEmpty()) {
                System.out.println("📧 Enviando para: " + manager.getEmail());
                emailService.sendReportEmail(manager.getEmail(), report, enterprise);
            }
        }
    }
    
    private ReportDTO.StockMovementReport convertToMovementReport(StockMovement movement) {
        ReportDTO.StockMovementReport report = new ReportDTO.StockMovementReport();
        report.setProductName(movement.getProduct().getProductName());
        
        String movementTypeString = movement.getMovementType() == MovementType.ENTRY ? "ENTRADA" : "SAÍDA";
        report.setMovementType(movementTypeString);
        
        report.setQuantity(movement.getQuantity());
        report.setUnitPrice(BigDecimal.valueOf(movement.getProduct().getUnitValue()));
        report.setTotalValue(BigDecimal.valueOf(movement.getProduct().getUnitValue() * movement.getQuantity()));
        report.setMovementDate(movement.getMovementDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        report.setUserName(movement.getUser().getUserName());
        return report;
    }
}