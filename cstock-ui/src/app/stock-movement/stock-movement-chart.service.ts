import { Injectable } from '@angular/core';
import { StockMovement, Product, Client } from '../core/models';
import { StockMovementService } from './stock-movement.service';
import { ClientService } from '../clients/client.service';

export interface ProductSummary {
  productId: number;
  productName: string;
  totalQuantity: number;
  type: 'ENTRY' | 'EXIT';
}

export interface ExpenseSummary {
  productName: string;
  totalValue: number;
}

export interface ClientSummary {
  clientId: number;
  clientName: string;
  totalPurchases: number;
  totalValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementChartService {

  constructor(
    private stockMovementService: StockMovementService,
    private clientService: ClientService
  ) { }

  private getStartDateForPeriod(period: '24h' | '1week' | '1month'): Date {
    const now = new Date();

    switch (period) {
      case '24h':
        return new Date(now.getTime() - (24 * 60 * 60 * 1000));
      case '1week':
        return new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      case '1month':
        return new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      default:
        return new Date(now.getTime() - (24 * 60 * 60 * 1000));
    }
  }

  private filterMovementsByPeriod(movements: StockMovement[], period: '24h' | '1week' | '1month'): StockMovement[] {
    const startDate = this.getStartDateForPeriod(period);

    return movements.filter((movement: StockMovement) => {
      if (!movement.movementDate) return false;
      return movement.movementDate >= startDate;
    });
  }

  async getTopProductsByPeriod(period: '24h' | '1week' | '1month', movementType: 'ENTRY' | 'EXIT'): Promise<ProductSummary[]> {
    try {
      const allMovements = await this.stockMovementService.findAll();
      const filteredMovements = this.filterMovementsByPeriod(allMovements, period)
        .filter(movement => movement.movementType === movementType);

      if (filteredMovements.length === 0) {
        return [];
      }

      const productMap = new Map<number, ProductSummary>();

      filteredMovements.forEach((movement: StockMovement) => {
        if (!movement.product?.id) return;

        const productId = movement.product.id;
        const productName = movement.product.productName || `Produto ${productId}`;
        const existing = productMap.get(productId);

        if (existing) {
          existing.totalQuantity += movement.quantity;
        } else {
          productMap.set(productId, {
            productId: productId,
            productName: productName,
            totalQuantity: movement.quantity,
            type: movementType
          });
        }
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5);

    } catch (error) {
      return [];
    }
  }

  async getTopExpensesByPeriod(period: '24h' | '1week' | '1month'): Promise<ExpenseSummary[]> {
    try {
      const allMovements = await this.stockMovementService.findAll();
      const entryMovements = this.filterMovementsByPeriod(allMovements, period)
        .filter(movement => movement.movementType === 'ENTRY');

      if (entryMovements.length === 0) {
        return [];
      }

      const expenseMap = new Map<string, number>();

      entryMovements.forEach((movement: StockMovement) => {
        if (!movement.product?.productName) return;

        const productName = movement.product.productName;
        const movementValue = movement.movementValue || 0;

        const currentValue = expenseMap.get(productName) || 0;
        expenseMap.set(productName, currentValue + movementValue);
      });

      return Array.from(expenseMap.entries())
        .map(([productName, totalValue]) => ({
          productName,
          totalValue
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);

    } catch (error) {
      return [];
    }
  }

  async getTopClientsByPeriod(period: '24h' | '1week' | '1month'): Promise<ClientSummary[]> {
    try {
      const allMovements = await this.stockMovementService.findAll();
      const allClients = await this.clientService.findAll();

      const salesMovements = this.filterMovementsByPeriod(allMovements, period)
        .filter(movement => movement.movementType === 'EXIT');

      if (salesMovements.length === 0) {
        return [];
      }

      const clientMap = new Map<number, ClientSummary>();

      salesMovements.forEach((movement: StockMovement) => {
        if (!movement.client?.id) return;

        const clientId = movement.client.id;
        const client = allClients.find((c: Client) => c.id === clientId);
        const clientName = client?.clientName || `Cliente ${clientId}`;

        let movementValue = movement.movementValue || 0;
        if (movementValue === 0 && movement.product?.salePrice) {
          movementValue = movement.quantity * movement.product.salePrice;
        }

        const existing = clientMap.get(clientId);
        if (existing) {
          existing.totalPurchases += movement.quantity;
          existing.totalValue += movementValue;
        } else {
          clientMap.set(clientId, {
            clientId: clientId,
            clientName: clientName,
            totalPurchases: movement.quantity,
            totalValue: movementValue
          });
        }
      });

      return Array.from(clientMap.values())
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);

    } catch (error) {
      return [];
    }
  }

  async getClientStatistics(): Promise<{ totalClients: number; activeClients: number }> {
    try {
      const allClients = await this.clientService.findAll();
      const allMovements = await this.stockMovementService.findAll();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeClientIds = new Set<number>();

      allMovements
        .filter((movement: StockMovement) =>
          movement.movementType === 'EXIT' &&
          movement.client?.id &&
          movement.movementDate >= thirtyDaysAgo
        )
        .forEach((movement: StockMovement) => {
          if (movement.client?.id) {
            activeClientIds.add(movement.client.id);
          }
        });

      return {
        totalClients: allClients.length,
        activeClients: activeClientIds.size
      };

    } catch (error) {
      return { totalClients: 0, activeClients: 0 };
    }
  }

  calculateTopRevenue(topProducts: { [productName: string]: number }): any[] {
    return Object.keys(topProducts)
      .map(productName => ({
        productName,
        totalValue: topProducts[productName]
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  }

  getPeriodLabel(period: '24h' | '1week' | '1month'): string {
    switch (period) {
      case '24h': return '24 Horas';
      case '1week': return '1 Semana';
      case '1month': return '1 Mês';
      default: return '24 Horas';
    }
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
