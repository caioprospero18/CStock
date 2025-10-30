import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StockMovement } from '../core/models';
import { AuthService } from '../security/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {

  private stockMovementsUrl = 'http://localhost:8080/stockmovements';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  async add(stockMovement: StockMovement): Promise<StockMovement> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');

    const movementToSend = await this.prepareMovementData(stockMovement);

    try {
      const response = await this.http.post<StockMovement>(
        this.stockMovementsUrl,
        movementToSend,
        { headers }
      ).toPromise();

      if (!response) {
        throw new Error('Resposta vazia do servidor');
      }

      return response;

    } catch (error) {
      throw error;
    }
  }

  private async prepareMovementData(stockMovement: StockMovement): Promise<any> {
    const userEmail = this.auth.jwtPayload?.['sub'];
    if (!userEmail) throw new Error('Usuário não autenticado');
    if (!stockMovement.product?.id) throw new Error('ID do produto é obrigatório');

    const userId = await this.getUserIdByEmail(userEmail);

    const movementType = stockMovement.movementType;
    const formattedDate = this.formatDateForBackend(stockMovement.movementDate);

    const data: any = {
      movementType,
      movementDate: formattedDate,
      quantity: stockMovement.quantity,
      observation: stockMovement.observation || '',
      user: { id: userId },
      product: { id: stockMovement.product.id }
    };

    if (stockMovement.client?.id && movementType === 'EXIT') {
      data.client = { id: stockMovement.client.id };
    }

    return data;
  }

  private formatDateForBackend(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  createStockMovement(movementType: 'ENTRY' | 'EXIT', productId?: number): StockMovement {
    const userId = this.auth.jwtPayload?.['user_id'];
    const enterpriseId = this.auth.jwtPayload?.['enterprise_id'];

    const movement = new StockMovement(productId, userId, enterpriseId);
    movement.movementType = movementType;
    return movement;
  }

  validateStockMovement(movement: StockMovement, requireClient: boolean = false): string | null {
    if (!movement.quantity || movement.quantity <= 0) {
      return 'Quantidade deve ser maior que zero!';
    }

    if (!movement.product?.id) {
      return 'Produto não selecionado!';
    }

    if (requireClient && !movement.client?.id) {
      return 'Cliente não selecionado!';
    }

    return null;
  }

  async findAll(): Promise<StockMovement[]> {
    if (!this.auth.isAuthenticated()) {
      return [];
    }

    const token = this.auth.getAccessToken();

    if (!token) {
      return [];
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const isAdmin = this.auth.isAdmin();
      let url = this.stockMovementsUrl;

      if (!isAdmin) {
        const enterpriseId = this.auth.jwtPayload?.['enterprise_id'];
        if (enterpriseId) {
          url = `${this.stockMovementsUrl}/enterprise/${enterpriseId}`;
        }
      }

      const response = await this.http.get<any[]>(url, { headers }).toPromise();

      if (!response || response.length === 0) {
        return [];
      }

      const movementsWithDates = response.map(movement => ({
        ...movement,
        movementDate: this.convertToDate(movement.movementDate)
      } as StockMovement));

      return movementsWithDates;

    } catch (error: any) {
      if (error.status === 401 || error.status === 403) {
        this.auth.logout();
        return [];
      }
      return [];
    }
  }

  findByProductId(productId: number): Promise<StockMovement[]> {
    return this.http.get<any[]>(`${this.stockMovementsUrl}/product/${productId}`)
      .toPromise()
      .then(response => {
        if (!response) {
          throw new Error(`Nenhuma movimentação encontrada para o produto ID ${productId}`);
        }
        return response.map(movement => ({
          ...movement,
          movementDate: this.convertToDate(movement.movementDate)
        } as StockMovement));
      });
  }

  findByUserId(userId: number): Promise<StockMovement[]> {
    return this.http.get<any[]>(`${this.stockMovementsUrl}/user/${userId}`)
      .toPromise()
      .then(response => {
        if (!response) {
          throw new Error(`Usuário com ID ${userId} não encontrado`);
        }
        return response.map(movement => ({
          ...movement,
          movementDate: this.convertToDate(movement.movementDate)
        } as StockMovement));
      });
  }

  findById(id: number): Promise<StockMovement> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    return this.http.get<any>(`${this.stockMovementsUrl}/${id}`, { headers })
      .toPromise()
      .then(response => {
        if (!response) {
          throw new Error(`Movimentação com ID ${id} não encontrada`);
        }
        return {
          ...response,
          movementDate: this.convertToDate(response.movementDate)
        } as StockMovement;
      });
  }

  remove(id: number): Promise<any> {
    const token = this.auth.getAccessToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    return this.http.delete(`${this.stockMovementsUrl}/${id}`, { headers })
      .toPromise()
      .then(() => null);
  }

  private async getUserIdByEmail(email: string): Promise<number> {
    try {
      const user = await this.http.get<any>(
        `http://localhost:8080/users/by-email/${encodeURIComponent(email)}`
      ).toPromise();

      if (!user || !user.id) {
        throw new Error('Usuário não encontrado');
      }

      return user.id;

    } catch (error) {
      throw new Error('Não foi possível obter o ID do usuário');
    }
  }

  private convertToDate(dateString: any): Date {
    try {
      if (dateString instanceof Date) {
        return dateString;
      }

      if (typeof dateString === 'string' && dateString.includes('/')) {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);

        let hours = 0, minutes = 0, seconds = 0;
        if (timePart) {
          [hours, minutes, seconds] = timePart.split(':').map(Number);
        }

        const parsedDate = new Date(year, month - 1, day, hours, minutes, seconds);

        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }

      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate;
      }

      return new Date();

    } catch (error) {
      return new Date();
    }
  }

  getTotalRevenue(period: string = '30D'): Observable<number> {
    return this.http.get<number>(`${this.stockMovementsUrl}/revenue/total?period=${period}`);
  }

  getProductRevenue(productId: number, period: string = '30D'): Observable<number> {
    return this.http.get<number>(
      `${this.stockMovementsUrl}/revenue/product/${productId}?period=${period}`
    );
  }

  getTopProducts(period: string = '30D', limit: number = 10): Observable<{ [productName: string]: number }> {
    return this.http.get<{ [productName: string]: number }>(
      `${this.stockMovementsUrl}/revenue/top-products?period=${period}&limit=${limit}`
    );
  }

  filterByPeriod(movements: StockMovement[], period: string): StockMovement[] {
    if (!period) {
      return movements;
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        break;
      case '7d':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case '30d':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      default:
        return movements;
    }

    return movements.filter(movement => {
      if (!movement.movementDate) return false;
      const movementDate = new Date(movement.movementDate);
      return movementDate >= startDate;
    });
  }

  filterMovements(
    movements: StockMovement[],
    filters: {
      productName?: string;
      movementType?: string;
      clientName?: string;
      period?: string;
    }
  ): StockMovement[] {
    let filtered = movements;

    if (filters.productName) {
      filtered = filtered.filter(movement =>
        movement.product?.productName?.toLowerCase().includes(filters.productName!.toLowerCase())
      );
    }

    if (filters.movementType) {
      filtered = filtered.filter(movement => movement.movementType === filters.movementType);
    }

    if (filters.clientName) {
      filtered = filtered.filter(movement =>
        movement.client?.clientName?.toLowerCase().includes(filters.clientName!.toLowerCase())
      );
    }

    if (filters.period) {
      filtered = this.filterByPeriod(filtered, filters.period);
    }

    return filtered;
  }

  getMovementValue(movement: StockMovement): string {
    if (movement.movementValue !== undefined && movement.movementValue !== null) {
      return `R$ ${movement.movementValue.toFixed(2)}`;
    }

    if (movement.product?.salePrice && movement.movementType === 'EXIT') {
      const value = movement.quantity * movement.product.salePrice;
      return `R$ ${value.toFixed(2)}`;
    } else if (movement.product?.purchasePrice && movement.movementType === 'ENTRY') {
      const value = movement.quantity * movement.product.purchasePrice;
      return `R$ ${value.toFixed(2)}`;
    }

    return '-';
  }

  formatMovementDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR');
  }

  getClientName(movement: StockMovement): string {
    return movement.client?.clientName || '-';
  }

  getMovementTypeLabel(type: string): string {
    return type === 'ENTRY' ? 'Entrada' : 'Saída';
  }

  getMovementTypeClass(type: string): string {
    return type === 'ENTRY' ? 'movement-entry' : 'movement-exit';
  }

  getQuantityDisplay(movement: StockMovement): string {
    const quantity = movement.quantity || 0;
    return movement.movementType === 'ENTRY' ? `+${quantity}` : `-${quantity}`;
  }

  getQuantityClass(movement: StockMovement): string {
    return movement.movementType === 'ENTRY' ? 'quantity-positive' : 'quantity-negative';
  }
}
