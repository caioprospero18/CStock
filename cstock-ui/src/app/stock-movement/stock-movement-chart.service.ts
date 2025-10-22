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

  async getTopProductsByPeriod(period: '24h' | '1week' | '1month', movementType: 'ENTRY' | 'EXIT'): Promise<ProductSummary[]> {
    try {
      const allMovements = await this.stockMovementService.findAll();

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

      const filteredMovements = allMovements.filter((movement: StockMovement) => {
        if (!movement.movementDate) {
          return false;
        }

        const movementDate = movement.movementDate;
        const isInPeriod = movementDate >= startDate;
        const isCorrectType = movement.movementType === movementType;

        return isInPeriod && isCorrectType;
      });

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

  async getTopClientsByPeriod(period: '24h' | '1week' | '1month'): Promise<ClientSummary[]> {
    try {
      const allMovements = await this.stockMovementService.findAll();
      const allClients = await this.clientService.findAll();

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

      const salesMovements = allMovements.filter((movement: StockMovement) => {
        if (!movement.movementDate || movement.movementType !== 'EXIT') {
          return false;
        }

        const movementDate = movement.movementDate;
        return movementDate >= startDate;
      });

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

      // Clientes que fizeram compras nos últimos 30 dias
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
}
