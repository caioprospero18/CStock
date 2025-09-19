import { Component, EventEmitter, Output } from '@angular/core';
import { Product } from '../../core/models';
import { ProductService } from '../../products/product.service';
import { OrderRequest, OrderRequestService } from '../order-request.service';

@Component({
  selector: 'app-order-request',
  templateUrl: './order-request.component.html',
  styleUrl: './order-request.component.css',
  standalone: false
})
export class OrderRequestComponent {
  products: Product[] = [];
  selectedProduct: Product | null = null;
  quantity: number = 1;
  observation: string = '';
  supplierEmail: string = 'compras@empresa.com';
  @Output() onCancel = new EventEmitter<void>();


  constructor(
    private productService: ProductService,
    private orderRequestService: OrderRequestService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.findAll()
      .then(products => this.products = products)
      .catch(error => console.error('Erro ao carregar produtos:', error));
  }

  generateEmail(): { subject: string, body: string } | null {
    if (!this.selectedProduct) return null;

    const subject = `Pedido de Compra - ${this.selectedProduct.productName}`;
    const body = `
Prezados,

Solicito o pedido do seguinte produto:

• Produto: ${this.selectedProduct.productName}
• Marca: ${this.selectedProduct.brand || 'Não especificada'}
• Quantidade: ${this.quantity} unidades
• Observações: ${this.observation || 'Nenhuma'}

Atenciosamente,
Setor de Estoque
    `;

    return { subject, body };
  }

  async saveOrderRequest(): Promise<OrderRequest | null> {
    if (!this.selectedProduct) return null;

    const order: OrderRequest = {
      productId: this.selectedProduct.id!,
      productName: this.selectedProduct.productName,
      quantity: this.quantity,
      supplierEmail: this.supplierEmail,
      observation: this.observation,
      status: 'PENDENTE'
    };

    try {
      const savedOrder = await this.orderRequestService.createOrderRequest(order).toPromise();
      console.log('Pedido salvo:', savedOrder);
      return savedOrder || null;
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      return null;
    }
  }

  openEmailClient() {
    const emailData = this.generateEmail();
    if (!emailData) return;

    const mailtoLink = `mailto:${this.supplierEmail}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.location.href = mailtoLink;
  }

  async sendEmail() {
    const orderSaved = await this.saveOrderRequest();
    if (!orderSaved) return;

    this.openEmailClient();
  }

  cancel() {
    this.onCancel.emit();
  }
}
