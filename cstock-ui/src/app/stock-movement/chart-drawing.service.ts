import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ChartDrawingService {

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  drawBarChart(
    canvas: HTMLCanvasElement,
    data: any[],
    color: string,
    title: string,
    isValueChart: boolean = false,
    valueField: string = 'totalQuantity',
    nameField: string = 'productName'
  ): void {
    if (!isPlatformBrowser(this.platformId) || !canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const padding = 60;
      const chartWidth = canvas.width - (padding * 2);
      const chartHeight = canvas.height - (padding * 2);

      if (data.length === 0) {
        this.drawNoDataMessage(ctx, canvas, 'Sem dados disponíveis');
        return;
      }

      const maxValue = Math.max(...data.map(item => item[valueField]));
      const barWidth = chartWidth / data.length * 0.6;

      this.drawAxes(ctx, canvas, padding, chartWidth, chartHeight);

      data.forEach((item, index) => {
        this.drawBar(
          ctx,
          canvas,
          item,
          index,
          data.length,
          padding,
          chartWidth,
          chartHeight,
          barWidth,
          maxValue,
          color,
          isValueChart,
          valueField,
          nameField
        );
      });

      this.drawChartTitle(ctx, canvas, title);
      this.drawYAxisLabel(ctx, canvas, isValueChart ? 'Valor (R$)' : 'Quantidade');
      this.drawUpdateTime(ctx, canvas);

    } catch (error) {
    }
  }

  private drawAxes(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, padding: number, chartWidth: number, chartHeight: number): void {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
  }

  private drawBar(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    item: any,
    index: number,
    totalItems: number,
    padding: number,
    chartWidth: number,
    chartHeight: number,
    barWidth: number,
    maxValue: number,
    color: string,
    isValueChart: boolean,
    valueField: string,
    nameField: string
  ): void {
    const value = item[valueField];

    const safeMaxValue = maxValue > 0 ? maxValue : 1;
    const barHeight = (value / safeMaxValue) * chartHeight;

    const x = padding + (index * (chartWidth / totalItems)) + ((chartWidth / totalItems - barWidth) / 2);
    const y = padding + (chartHeight - barHeight);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    const displayValue = isValueChart ? `R$ ${value.toFixed(2)}` : value.toString();
    ctx.fillText(displayValue, x + barWidth / 2, y - 10);

    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    const displayName = this.truncateText(item[nameField], 12);

    ctx.fillText(displayName, x + barWidth / 2, canvas.height - padding + 20);
  }

  private drawChartTitle(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, title: string): void {
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 25);
  }

  private drawYAxisLabel(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, label: string): void {
    ctx.save();
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }

  private drawUpdateTime(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.fillStyle = '#999';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    const time = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    ctx.fillText(`Atualizado: ${time}`, canvas.width - 10, canvas.height - 10);
  }

  private drawNoDataMessage(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, message: string): void {
    ctx.fillStyle = '#999';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  clearCanvas(canvas: HTMLCanvasElement, message: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawNoDataMessage(ctx, canvas, message);
    }
  }

  truncateText(text: string, maxLength: number = 10): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
