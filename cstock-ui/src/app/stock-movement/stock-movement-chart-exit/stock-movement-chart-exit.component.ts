import { Component, OnInit, ElementRef, ViewChild, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { StockMovementChartService, ProductSummary } from '../stock-movement-chart.service';
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

  selectedPeriod: '24h' | '1week' | '1month' = '24h';
  topExits: ProductSummary[] = [];
  topRevenue: any[] = []; 
  loading = false;
  chartsInitialized = false;

  private refreshInterval: any;
  private readonly REFRESH_INTERVAL = 30000;

  periodOptions = [
    { label: 'Últimas 24 Horas', value: '24h' },
    { label: 'Última Semana', value: '1week' },
    { label: 'Último Mês', value: '1month' }
  ];

  constructor(
    private stockMovementChartService: StockMovementChartService,
    private stockMovementService: StockMovementService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    console.log('🚀 Componente de gráficos de SAÍDA inicializado');
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

    console.log('📈 Carregando gráficos de SAÍDA...');
    this.loading = true;

    try {
      const [exits, topProducts] = await Promise.all([
        this.stockMovementChartService.getTopProductsByPeriod(this.selectedPeriod, 'EXIT'),
        this.stockMovementService.getTopProducts(this.selectedPeriod, 100).toPromise()
      ]);

      console.log('📊 Dados recebidos - Saídas:', exits.length);
      this.topExits = exits;

      this.calculateTopRevenue(topProducts || {});

      this.updateCharts();

    } catch (error) {
      console.error('❌ Erro ao carregar gráficos de SAÍDA:', error);
    } finally {
      this.loading = false;
    }
  }

  private calculateTopRevenue(topProducts: { [productName: string]: number }) {
    this.topRevenue = Object.keys(topProducts)
      .map(productName => ({
        productName,
        totalValue: topProducts[productName]
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  }

  private updateCharts() {
    this.chartsInitialized = true;

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.drawExitChart();
        this.drawRevenueChart();
      }, 0);
    }
  }

  drawExitChart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const data = this.topExits;
    const canvas = this.exitChartCanvas?.nativeElement;

    if (!canvas) {
      console.warn('⚠️ Canvas não encontrado para SAÍDA');
      return;
    }

    if (data.length === 0) {
      this.clearCanvas(canvas, 'Sem dados de saída');
      return;
    }

    this.drawBarChart(canvas, data, '#F44336', `Top ${data.length} Saídas - ${this.getPeriodLabel()}`);
  }

  drawRevenueChart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const data = this.topRevenue;
    const canvas = this.revenueChartCanvas?.nativeElement;

    if (!canvas) {
      console.warn('⚠️ Canvas não encontrado para LUCRO');
      return;
    }

    if (data.length === 0) {
      this.clearCanvas(canvas, 'Sem dados de lucro');
      return;
    }

    this.drawBarChart(canvas, data, '#4CAF50', `Top ${data.length} Lucro - ${this.getPeriodLabel()}`, true);
  }

  private drawBarChart(canvas: HTMLCanvasElement, data: any[], color: string, title: string, isValueChart: boolean = false) {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const padding = 40;
      const chartWidth = canvas.width - (padding * 2);
      const chartHeight = canvas.height - (padding * 2);

      const maxValue = Math.max(...data.map(item => isValueChart ? item.totalValue : item.totalQuantity));
      const barWidth = chartWidth / data.length * 0.7;

      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, canvas.height - padding);
      ctx.lineTo(canvas.width - padding, canvas.height - padding);
      ctx.stroke();

      data.forEach((item, index) => {
        const value = isValueChart ? item.totalValue : item.totalQuantity;
        const x = padding + (index * (chartWidth / data.length)) + (chartWidth / data.length - barWidth) / 2;
        const barHeight = (value / maxValue) * chartHeight;
        const y = canvas.height - padding - barHeight;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const displayValue = isValueChart ? `R$ ${value.toFixed(2)}` : value.toString();
        ctx.fillText(displayValue, x + barWidth / 2, y - 5);

        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const productName = this.truncateProductName(item.productName, 10);
        ctx.fillText(productName, x + barWidth / 2, canvas.height - padding + 15);
      });

      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(title, canvas.width / 2, 20);

      ctx.save();
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.translate(15, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(isValueChart ? 'Valor (R$)' : 'Quantidade', 0, 0);
      ctx.restore();

      ctx.fillStyle = '#999';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Atualizado: ${new Date().toLocaleTimeString()}`, canvas.width - 10, canvas.height - 10);

    } catch (error) {
      console.error('❌ Erro ao desenhar gráfico:', error);
    }
  }

  private clearCanvas(canvas: HTMLCanvasElement, message: string) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#999';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }
  }

  truncateProductName(name: string, maxLength: number = 10): string {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  }

  getPeriodLabel(): string {
    switch (this.selectedPeriod) {
      case '24h': return '24 Horas';
      case '1week': return '1 Semana';
      case '1month': return '1 Mês';
      default: return '24 Horas';
    }
  }

  hasData(): boolean {
    return this.topExits.length > 0 || this.topRevenue.length > 0;
  }

  forceRefresh() {
    this.loadCharts();
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
