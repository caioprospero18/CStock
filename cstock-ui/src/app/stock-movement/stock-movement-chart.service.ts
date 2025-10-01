import { Injectable } from '@angular/core';
import { StockMovement } from '../core/models';
import { StockMovementService } from './stock-movement.service';

export interface ProductSummary {
  productId: number;
  productName: string;
  totalQuantity: number;
  type: 'ENTRY' | 'EXIT';
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementChartService {

  constructor(private stockMovementService: StockMovementService) { }

  async getTopProductsByPeriod(period: '24h' | '1week' | '1month', movementType: 'ENTRY' | 'EXIT'): Promise<ProductSummary[]> {
    try {
      console.log('🚀 INICIANDO BUSCA - Período:', period, 'Tipo:', movementType);

      // APENAS DADOS REAIS DO BACKEND
      const allMovements = await this.stockMovementService.findAll();

      console.log('📦 Total de movimentos no banco:', allMovements.length);

      // Log dos primeiros movimentos para ver as datas
      if (allMovements.length > 0) {
        console.log('📅 Primeiros 3 movimentos:');
        allMovements.slice(0, 3).forEach((movement, index) => {
          console.log(`  ${index + 1}. ID: ${movement.id}, Data: ${movement.movementDate}, Tipo: ${movement.movementType}, Produto: ${movement.product?.productName}`);
        });
      }

      const now = new Date();
      let startDate: Date;

      switch (period) {
        case '24h':
          startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
          break;
        case '1week':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
          break;
        case '1month':
          startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          break;
        default:
          startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      }

      console.log('⏰ Data de início do período:', startDate);
      console.log('⏰ Data atual:', now);

      // Filtra movimentos pelo período e tipo
      const filteredMovements = allMovements.filter((movement: StockMovement) => {
        if (!movement.movementDate) {
          console.warn('⚠️ Movimento sem data:', movement);
          return false;
        }

        // Converte a string de data para Date object
        const movementDate = new Date(movement.movementDate);

        const isInPeriod = movementDate >= startDate;
        const isCorrectType = movement.movementType === movementType;

        if (isInPeriod && isCorrectType) {
          console.log(`✅ MOVIMENTO INCLUÍDO - ID: ${movement.id}, Data: ${movementDate}, Tipo: ${movement.movementType}, Qtd: ${movement.quantity}`);
        }

        return isInPeriod && isCorrectType;
      });

      console.log(`🎯 Movimentos filtrados (${movementType}):`, filteredMovements.length);

      if (filteredMovements.length === 0) {
        console.log('❌ NENHUM movimento encontrado para o filtro');
        return [];
      }

      // Agrupa por produto e soma as quantidades
      const productMap = new Map<number, ProductSummary>();

      filteredMovements.forEach((movement: StockMovement) => {
        if (!movement.product?.id) {
          console.warn('⚠️ Movimento sem produto:', movement);
          return;
        }

        const productId = movement.product.id;
        const productName = movement.product.productName || `Produto ${productId}`;
        const existing = productMap.get(productId);

        if (existing) {
          existing.totalQuantity += movement.quantity;
          console.log(`➕ Somando quantidade para ${productName}: +${movement.quantity} = ${existing.totalQuantity}`);
        } else {
          productMap.set(productId, {
            productId: productId,
            productName: productName,
            totalQuantity: movement.quantity,
            type: movementType
          });
          console.log(`🆕 Novo produto: ${productName}, Qtd: ${movement.quantity}`);
        }
      });

      // Converte para array, ordena e pega os top 5
      const result = Array.from(productMap.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5);

      console.log(`🏆 RESULTADO FINAL - Top ${movementType}:`, result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao buscar dados para gráficos:', error);
      return [];
    }
  }
}
