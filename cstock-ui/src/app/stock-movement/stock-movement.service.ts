import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StockMovement } from '../core/models';
import { AuthService } from '../security/auth.service';

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
    console.log('📤 JSON FINAL para backend:', movementToSend);
    const response = await this.http.post<StockMovement>(
      this.stockMovementsUrl,
      movementToSend,
      { headers }
    ).toPromise();

    if (!response) {
      throw new Error('Resposta vazia do servidor');
    }

    console.log('Movimentação salva com sucesso:', response);
    return response;

  } catch (error) {
    console.error('Erro ao salvar movimentação:', error);
    throw error;
  }
}


 private async prepareMovementData(stockMovement: StockMovement): Promise<any> {
  const userEmail = this.auth.jwtPayload?.['sub'];
  if (!userEmail) throw new Error('Usuário não autenticado');
  if (!stockMovement.product?.id) throw new Error('ID do produto é obrigatório');

  const userId = await this.getUserIdByEmail(userEmail);

  const movementType = stockMovement.movementType?.toUpperCase();

  const formattedDate = this.formatDateForBackend(stockMovement.movementDate);

  return {
    movementType,
    movementDate: formattedDate,
    quantity: stockMovement.quantity,
    observation: stockMovement.observation || '',
    user: { id: userId },
    product: { id: stockMovement.product.id }
  };
}

private formatDateForBackend(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

  findByProductId(productId: number): Promise<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.stockMovementsUrl}/product/${productId}`)
      .toPromise()
      .then(response => {
      if (!response) {
        throw new Error(`Nenhuma movimentação encontrada para o produto ID ${productId}`);
      }
      return response;
    });
  }

  findByUserId(userId: number): Promise<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.stockMovementsUrl}/user/${userId}`)
      .toPromise()
      .then(response => {
      if (!response) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }
      return response;
    });
  }

  findAll(): Promise<StockMovement[]> {
    return this.http.get<StockMovement[]>(this.stockMovementsUrl)
      .toPromise()
      .then(response => {
      if (!response || response.length === 0) {
        throw new Error(`Nenhuma movimentação encontrada`);
      }
      return response;
    });
  }

  findById(id: number): Promise<StockMovement> {
  return this.http.get<StockMovement>(`${this.stockMovementsUrl}/${id}`)
    .toPromise()
    .then(response => {
      if (!response) {
        throw new Error(`Movimentação com ID ${id} não encontrada`);
      }
      return response;
    });
}

     remove(id: number): Promise<any> {
       return this.http.delete(`${this.stockMovementsUrl}/${id}`)
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
    console.error('Erro ao buscar ID do usuário:', error);
    throw new Error('Não foi possível obter o ID do usuário');
  }
}
}
