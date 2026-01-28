import { Component, OnInit, ElementRef, ViewChild, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { StockMovementChartService, ProductSummary, ClientSummary } from '../stock-movement-chart.service';
import { ChartDrawingService } from '../chart-drawing.service';
import { StockMovementService } from '../stock-movement.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-stock-movement-chart-exit',
  templateUrl: './stock-movement-chart-exit.component.html',
  styleUrls: ['./stock-movement-chart-exit.component.css']
})
export class StockMovementChartExitComponent implements OnInit, OnDestroy {
  @ViewChild('exitChart') exitChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('clientsChart') clientsChartCanvas!: ElementRef<HTMLCanvasElement>;

  selectedPeriod: '24h' | '1week' | '1month' = '24h';
  topExits: ProductSummary[] = [];
  topRevenue: any[] = [];
  topClients: ClientSummary[] = [];
  clientStats: { totalClients: number; activeClients: number } = { totalClients: 0, activeClients: 0 };
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
      const [exits, topProducts, clients, clientStats] = await Promise.all([
        this.stockMovementChartService.getTopProductsByPeriod(this.selectedPeriod, 'EXIT'),
        this.stockMovementService.getTopProducts(this.selectedPeriod, 100).toPromise(),
        this.stockMovementChartService.getTopClientsByPeriod(this.selectedPeriod),
        this.stockMovementChartService.getClientStatistics()
      ]);

      this.topExits = exits || [];
      this.topClients = clients || [];
      this.clientStats = clientStats || { totalClients: 0, activeClients: 0 };
      this.topRevenue = this.stockMovementChartService.calculateTopRevenue(
        (topProducts ?? {}) as { [productName: string]: number }
      );

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
        this.drawExitChart();
        this.drawRevenueChart();
        this.drawClientsChart();
      } catch (err) {
      }
    }, 100);
  }

  private ensureCanvasSize() {
    const canvases = [
      this.exitChartCanvas,
      this.revenueChartCanvas,
      this.clientsChartCanvas
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

  drawExitChart() {
    const canvas = this.exitChartCanvas?.nativeElement;
    if (!canvas) return;

    if (this.topExits.length === 0) {
      this.chartDrawingService.clearCanvas(canvas, 'Sem dados de saída');
      return;
    }

    this.chartDrawingService.drawBarChart(
      canvas,
      this.topExits,
      '#F44336',
      `Top ${this.topExits.length} Saídas - ${this.getPeriodLabel()}`,
      false,
      'totalQuantity',
      'productName'
    );
  }

  drawRevenueChart() {
    const canvas = this.revenueChartCanvas?.nativeElement;
    if (!canvas) return;

    if (this.topRevenue.length === 0) {
      this.chartDrawingService.clearCanvas(canvas, 'Sem dados de lucro');
      return;
    }

    this.chartDrawingService.drawBarChart(
      canvas,
      this.topRevenue,
      '#4CAF50',
      `Top ${this.topRevenue.length} Lucro - ${this.getPeriodLabel()}`,
      true,
      'totalValue',
      'productName'
    );
  }

  drawClientsChart() {
    const canvas = this.clientsChartCanvas?.nativeElement;
    if (!canvas) return;

    if (this.topClients.length === 0) {
      this.chartDrawingService.clearCanvas(canvas, 'Sem dados de clientes');
      return;
    }

    this.chartDrawingService.drawBarChart(
      canvas,
      this.topClients,
      '#2196F3',
      `Top ${this.topClients.length} Clientes - ${this.getPeriodLabel()}`,
      true,
      'totalValue',
      'clientName'
    );
  }

  hasData(): boolean {
    return this.topExits.length > 0 || this.topRevenue.length > 0 || this.topClients.length > 0;
  }

  forceRefresh() {
    this.loadCharts();
  }

  getCurrentTime(): string {
    return this.stockMovementChartService.getCurrentTime();
  }
}
