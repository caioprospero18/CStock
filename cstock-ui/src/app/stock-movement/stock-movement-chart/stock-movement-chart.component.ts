import { Component, OnInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { StockMovementChartService, ProductSummary } from '../stock-movement-chart.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-stock-movement-charts',
  templateUrl: './stock-movement-chart.component.html',
  styleUrls: ['./stock-movement-chart.component.scss']
})
export class StockMovementChartComponent implements OnInit {
  @ViewChild('entryChart') entryChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('exitChart') exitChartCanvas!: ElementRef<HTMLCanvasElement>;

  selectedPeriod: '24h' | '1week' | '1month' = '24h';
  topEntries: ProductSummary[] = [];
  topExits: ProductSummary[] = [];
  loading = false;
  chartsInitialized = false;

  // Opções do dropdown
  periodOptions = [
    { label: 'Últimas 24 Horas', value: '24h' },
    { label: 'Última Semana', value: '1week' },
    { label: 'Último Mês', value: '1month' }
  ];

  constructor(
    private stockMovementChartService: StockMovementChartService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    console.log('🚀 Componente de gráficos inicializado');
    this.loadCharts();
  }

  async onPeriodChange() {
    console.log('🔄 Período alterado para:', this.selectedPeriod);
    await this.loadCharts();
  }

  async loadCharts() {
    console.log('📈 Carregando gráficos...');
    this.loading = true;

    try {
      const [entries, exits] = await Promise.all([
        this.stockMovementChartService.getTopProductsByPeriod(this.selectedPeriod, 'ENTRY'),
        this.stockMovementChartService.getTopProductsByPeriod(this.selectedPeriod, 'EXIT')
      ]);

      this.topEntries = entries;
      this.topExits = exits;

      // Marca que os gráficos podem ser inicializados
      this.chartsInitialized = true;

      // Aguarda o próximo ciclo para garantir que o DOM está pronto
      setTimeout(() => {
        this.initializeCharts();
      }, 0);

    } catch (error) {
      console.error('❌ Erro ao carregar gráficos:', error);
    } finally {
      this.loading = false;
    }
  }

  initializeCharts() {
    // Só inicializa os gráficos se estiver no browser
    if (isPlatformBrowser(this.platformId)) {
      console.log('🎨 Inicializando gráficos no browser...');
      this.drawChart('entry');
      this.drawChart('exit');
    } else {
      console.log('⏸️  SSR - Gráficos não inicializados no servidor');
    }
  }

  drawChart(type: 'entry' | 'exit') {
    // Verificação extra de segurança
    if (typeof window === 'undefined' ||
      typeof document === 'undefined' ||
      !isPlatformBrowser(this.platformId)) {
    console.log('⏸️  SSR - Pulando desenho do gráfico');
    return;
  }

    const data = type === 'entry' ? this.topEntries : this.topExits;
    const canvas = type === 'entry' ? this.entryChartCanvas?.nativeElement : this.exitChartCanvas?.nativeElement;

    console.log(`🎨 Desenhando gráfico ${type}:`, data.length, 'itens');

    if (!canvas) {
      console.warn('⚠️ Canvas não encontrado para:', type);
      return;
    }

    if (data.length === 0) {
      console.log('ℹ️  Sem dados para desenhar no gráfico:', type);
      return;
    }

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Contexto 2D não disponível');
        return;
      }

      // Limpa o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const padding = 40;
      const chartWidth = canvas.width - (padding * 2);
      const chartHeight = canvas.height - (padding * 2);

      const maxValue = Math.max(...data.map(item => item.totalQuantity));
      const barWidth = chartWidth / data.length * 0.7;

      console.log(`📊 Configurações do gráfico ${type}:`, { maxValue, barWidth, chartWidth, chartHeight });

      // Desenha os eixos
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, canvas.height - padding);
      ctx.lineTo(canvas.width - padding, canvas.height - padding);
      ctx.stroke();

      // Desenha as barras
      data.forEach((item, index) => {
        const x = padding + (index * (chartWidth / data.length)) + (chartWidth / data.length - barWidth) / 2;
        const barHeight = (item.totalQuantity / maxValue) * chartHeight;
        const y = canvas.height - padding - barHeight;

        // Cor da barra
        ctx.fillStyle = type === 'entry' ? '#4CAF50' : '#F44336';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Valor no topo da barra
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.totalQuantity.toString(), x + barWidth / 2, y - 5);

        // Nome do produto
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const productName = this.truncateProductName(item.productName, 10);
        ctx.fillText(productName, x + barWidth / 2, canvas.height - padding + 15);
      });

      // Título do eixo Y
      ctx.save();
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.translate(15, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Quantidade', 0, 0);
      ctx.restore();

      // Título do gráfico
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Top ${data.length} ${type === 'entry' ? 'Entradas' : 'Saídas'} - ${this.getPeriodLabel()}`,
        canvas.width / 2,
        20
      );

      console.log(`✅ Gráfico ${type} desenhado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao desenhar gráfico ${type}:`, error);
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
    return this.topEntries.length > 0 || this.topExits.length > 0;
  }
}
