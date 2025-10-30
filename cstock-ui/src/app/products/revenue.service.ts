import { Injectable } from '@angular/core';
import { Product } from '../core/models';
import { StockMovementService } from '../stock-movement/stock-movement.service';

@Injectable({
  providedIn: 'root'
})
export class RevenueService {

  constructor(private stockMovementService: StockMovementService) { }

  async loadRevenueData(period: string, products: Product[]): Promise<{
    totalRevenue: number;
    productRevenues: { [productId: number]: number };
  }> {
    try {
      const [totalRevenue, topProducts] = await Promise.all([
        this.stockMovementService.getTotalRevenue(period).toPromise(),
        this.stockMovementService.getTopProducts(period, 100).toPromise()
      ]);

      return {
        totalRevenue: totalRevenue || 0,
        productRevenues: this.convertProductRevenues(topProducts || {}, products)
      };

    } catch (error) {
      return { totalRevenue: 0, productRevenues: {} };
    }
  }

  private convertProductRevenues(
    topProducts: { [productName: string]: number },
    products: Product[]
  ): { [productId: number]: number } {
    const revenues: { [productId: number]: number } = {};
    const productMap = new Map<string, number>();

    products.forEach(product => {
      if (product.id && product.productName) {
        productMap.set(product.productName.toLowerCase(), product.id);
      }
    });

    Object.keys(topProducts).forEach(productName => {
      const productId = productMap.get(productName.toLowerCase());
      if (productId) {
        revenues[productId] = topProducts[productName];
      }
    });

    return revenues;
  }
}
