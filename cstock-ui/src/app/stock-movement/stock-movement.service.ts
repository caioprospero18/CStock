import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../security/auth.service';
import { Observable, lastValueFrom } from 'rxjs';
import { StockMovement } from '../core/models';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {

  private readonly stockMovementsUrl = `${environment.apiUrl}/stockmovements`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.getAccessToken();
    if (!token) throw new Error('Usuário não autenticado');

    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  createStockMovement(
    movementType: 'ENTRY' | 'EXIT',
    productId?: number
  ): StockMovement {
    const movement = new StockMovement();

    movement.movementType = movementType;
    movement.movementDate = new Date();
    movement.quantity = 0;
    movement.observation = '';

    if (productId) {
      movement.product = { id: productId } as any;
    }

    return movement;
  }

  validateStockMovement(
    movement: StockMovement,
    requireClient: boolean = false
  ): string | null {

    if (!movement.product?.id) {
      return 'Produto não selecionado';
    }

    if (!movement.quantity || movement.quantity <= 0) {
      return 'Quantidade deve ser maior que zero';
    }

    if (requireClient && !movement.client?.id) {
      return 'Cliente é obrigatório para saída';
    }

    return null;
  }

  add(movement: StockMovement): Promise<StockMovement> {
    return lastValueFrom(
      this.http.post<StockMovement>(
        this.stockMovementsUrl,
        movement,
        { headers: this.authHeaders() }
      )
    );
  }

  findAll(): Promise<StockMovement[]> {
    return lastValueFrom(
      this.http.get<StockMovement[]>(
        this.stockMovementsUrl,
        { headers: this.authHeaders() }
      )
    ).then(r => r || []);
  }

  findByProductId(productId: number): Promise<StockMovement[]> {
    return lastValueFrom(
      this.http.get<StockMovement[]>(
        `${this.stockMovementsUrl}/product/${productId}`,
        { headers: this.authHeaders() }
      )
    ).then(r => r || []);
  }

  findByUserId(userId: number): Promise<StockMovement[]> {
    return lastValueFrom(
      this.http.get<StockMovement[]>(
        `${this.stockMovementsUrl}/user/${userId}`,
        { headers: this.authHeaders() }
      )
    ).then(r => r || []);
  }

  getTotalRevenue(period: string): Observable<number> {
    return this.http.get<number>(
      `${this.stockMovementsUrl}/revenue/total?period=${period}`,
      { headers: this.authHeaders() }
    );
  }

  getTopProducts(period: string, limit: number): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(
      `${this.stockMovementsUrl}/revenue/top-products?period=${period}&limit=${limit}`,
      { headers: this.authHeaders() }
    );
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

    return movements.filter(m => {

      if (filters.movementType && m.movementType !== filters.movementType) {
        return false;
      }

      if (filters.clientName &&
          !m.client?.clientName?.toLowerCase().includes(filters.clientName.toLowerCase())) {
        return false;
      }

      if (filters.productName &&
          !m.product?.productName?.toLowerCase().includes(filters.productName.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  getMovementValue(movement: StockMovement): string {
    return movement.quantity.toString();
  }

  formatMovementDate(date: Date): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  getClientName(movement: StockMovement): string {
    return movement.client?.clientName || '-';
  }

  getMovementTypeLabel(type: 'ENTRY' | 'EXIT'): string {
    return type === 'ENTRY' ? 'Entrada' : 'Saída';
  }

  getMovementTypeClass(type: 'ENTRY' | 'EXIT'): string {
    return type === 'ENTRY' ? 'movement-entry' : 'movement-exit';
  }

  getQuantityDisplay(movement: StockMovement): string {
    return movement.movementType === 'ENTRY'
      ? `+${movement.quantity}`
      : `-${movement.quantity}`;
  }

  getQuantityClass(movement: StockMovement): string {
    return movement.movementType === 'ENTRY'
      ? 'quantity-positive'
      : 'quantity-negative';
  }
}
