import { Component, OnInit, ElementRef, ViewChild, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { StockMovementChartService, ProductSummary } from '../stock-movement-chart.service';
import { ChartDrawingService } from '../chart-drawing.service';
import { StockMovementService } from '../stock-movement.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-stock-movement-chart-entry',
  templateUrl: './stock-movement-chart-entry.component.html',
  styleUrls: ['./stock-movement-chart-entry.component.css']
})
export class StockMovementChartEntryComponent implements OnInit, OnDestroy {
  @ViewChild('entryChart') entryChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('expenseChart') expenseChartCanvas!: ElementRef<HTMLCanvasElement>;

  selectedPeriod: '24h' | '1week' | '1month' = '24h';
  topEntries: ProductSummary[] = [];
  topExpenses: any[] = [];
  loading = false;

  private refreshInterval: any;
  private readonly REFRESH_INTERVAL = 30000;

  periodOptions = [
    { label: 'Últimas 24 Horas', value: '24h' },
    { label: 'Última Semana', value: '1week' },
    { label: 'Último Mês', value: '1month' }
  ];

  constructor(
    private stockMovementChartService: StockMovementChartService,
    private chartDrawingService: ChartDrawingService,
    private stockMovementService: StockMovementService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    this.loadCharts();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  private startAutoRefresh() {
    if (isPlatformBrowser(this.platformId)) {
      this.refreshInterval = setInterval(() => {
        this.loadCharts();
      }, this.REFRESH_INTERVAL);
    }
  }

  private stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  async onPeriodChange() {
    await this.loadCharts();
  }

  async loadCharts() {
    if (this.loading) return;

    this.loading = true;
    try {
      const [entries, expenses] = await Promise.all([
        this.stockMovementChartService.getTopProductsByPeriod(this.selectedPeriod, 'ENTRY'),
        this.stockMovementChartService.getTopExpensesByPeriod(this.selectedPeriod)
      ]);

      this.topEntries = entries || [];
      this.topExpenses = expenses || [];

      this.updateCharts();
    } catch (error) {
    } finally {
      this.loading = false;
    }
  }

  private updateCharts() {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      this.ensureCanvasSize();
      try {
        this.drawEntryChart();
        this.drawExpenseChart();
      } catch (err) {
      }
    }, 100);
  }

  private ensureCanvasSize() {
    const canvases = [
      this.entryChartCanvas,
      this.expenseChartCanvas
    ];

    canvases.forEach(canvasRef => {
      if (canvasRef?.nativeElement) {
        const canvas = canvasRef.nativeElement;
        const container = canvas.parentElement;

        if (container) {
          const width = container.clientWidth;
          const height = container.clientHeight;

          if (width > 0 && height > 0) {
            canvas.width = width;
            canvas.height = height;
          }
        }
      }
    });
  }

  getPeriodLabel(): string {
    return this.stockMovementChartService.getPeriodLabel(this.selectedPeriod);
  }

  drawEntryChart() {
    const canvas = this.entryChartCanvas?.nativeElement;
    if (!canvas) return;

    if (this.topEntries.length === 0) {
      this.chartDrawingService.clearCanvas(canvas, 'Sem dados de entrada');
      return;
    }

    this.chartDrawingService.drawBarChart(
      canvas,
      this.topEntries,
      '#4CAF50',
      `Top ${this.topEntries.length} Entradas - ${this.getPeriodLabel()}`,
      false,
      'totalQuantity',
      'productName'
    );
  }

  drawExpenseChart() {
    const canvas = this.expenseChartCanvas?.nativeElement;
    if (!canvas) return;

    if (this.topExpenses.length === 0) {
      this.chartDrawingService.clearCanvas(canvas, 'Sem dados de gastos');
      return;
    }

    this.chartDrawingService.drawBarChart(
      canvas,
      this.topExpenses,
      '#FF9800',
      `Top ${this.topExpenses.length} Gastos - ${this.getPeriodLabel()}`,
      true,
      'totalValue',
      'productName'
    );
  }

  hasData(): boolean {
    return this.topEntries.length > 0 || this.topExpenses.length > 0;
  }

  forceRefresh() {
    this.loadCharts();
  }

  getCurrentTime(): string {
    return this.stockMovementChartService.getCurrentTime();
  }
}
