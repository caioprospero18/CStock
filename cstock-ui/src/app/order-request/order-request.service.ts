import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderRequest {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  supplierEmail: string;
  observation: string;
  status: 'PENDENTE' | 'ENVIADO' | 'RECEBIDO';
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderRequestService {
  private apiUrl = 'http://localhost:8080/order-requests';

  constructor(private http: HttpClient) { }

  createOrderRequest(order: OrderRequest): Observable<OrderRequest> {
    return this.http.post<OrderRequest>(this.apiUrl, order);
  }

  getOrderRequests(): Observable<OrderRequest[]> {
    return this.http.get<OrderRequest[]>(this.apiUrl);
  }

  getOrderRequestById(id: number): Observable<OrderRequest> {
    return this.http.get<OrderRequest>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: number, status: OrderRequest['status']): Observable<OrderRequest> {
    return this.http.patch<OrderRequest>(`${this.apiUrl}/${id}`, { status });
  }

  deleteOrderRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
