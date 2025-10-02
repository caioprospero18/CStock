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
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  findByProductId(productId: number): Promise<StockMovement[]> {
    return this.http.get<any[]>(`${this.stockMovementsUrl}/product/${productId}`)
      .toPromise()
      .then(response => {
        if (!response) {
          throw new Error(`Nenhuma movimentação encontrada para o produto ID ${productId}`);
        }
        // Converte as datas string para Date
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
        // Converte as datas string para Date
        return response.map(movement => ({
          ...movement,
          movementDate: this.convertToDate(movement.movementDate)
        } as StockMovement));
      });
  }

  async findAll(): Promise<StockMovement[]> {
    if (!this.auth.isAuthenticated()) {
      console.warn('🔐 Usuário não autenticado - token inválido ou expirado');
      return [];
    }

    const token = this.auth.getAccessToken();

    if (!token) {
      console.warn('🔐 Token não disponível após verificação de autenticação');
      return [];
    }

    console.log('🔐 Token disponível, fazendo requisição...');

    const headers = new HttpHeaders()
      .append('Authorization', `Bearer ${token}`)
      .append('Content-Type', 'application/json');

    try {
      const response = await this.http.get<any[]>(this.stockMovementsUrl, { headers })
        .toPromise();

      if (!response || response.length === 0) {
        console.log('ℹ️ Nenhuma movimentação encontrada');
        return [];
      }

      console.log('🔧 Convertendo dados do backend...');

      const movementsWithDates = response.map(movement => ({
        ...movement,
        movementDate: this.convertToDate(movement.movementDate)
      } as StockMovement));

      console.log('✅ Dados convertidos com sucesso');
      return movementsWithDates;

    } catch (error: any) {
      console.error('❌ Erro ao buscar movimentações:', error);

      if (error.status === 401 || error.status === 403) {
        console.warn('🔐 Erro de autenticação - limpando token e retornando vazio');
        this.auth.logout();
        return [];
      }

      return [];
    }
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
      console.log('🔄 Convertendo para Date:', dateString);

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

        console.log('✅ Data convertida:', {
          original: dateString,
          convertida: parsedDate,
          legivel: parsedDate.toLocaleString('pt-BR')
        });

        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }

      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate;
      }

      console.warn('❌ Não foi possível converter a data:', dateString);
      return new Date();

    } catch (error) {
      console.error('❌ Erro na conversão da data:', dateString, error);
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
}
