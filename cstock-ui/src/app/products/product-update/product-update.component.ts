import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Enterprise, Product } from '../../core/models';
import { ProductService } from '../product.service';
import { AuthService } from '../../security/auth.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-update',
  templateUrl: './product-update.component.html',
  styleUrl: './product-update.component.css',
  standalone: false
})
export class ProductUpdateComponent {
  @Input() productInput: Product | null = null;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();
  product: Product;

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService
  ){
    this.product = new Product();
  }

  ngOnInit(): void {
    console.log('=== DEBUG ProductUpdateComponent ===');
    console.log('productInput recebido:', this.productInput);

    if (this.productInput) {
      console.log('Carregando dados do produto...');
      // Copiar os dados do productInput para o product existente
      Object.assign(this.product, this.productInput);

      // Garantir que enterprise existe
      if (!this.product.enterprise) {
        this.product.enterprise = new Enterprise();
      }

      console.log('Produto após carregamento:', this.product);
    } else {
      console.log('Nenhum produto recebido, usando produto vazio');
    }
  }


  updateProduct() {
    if (!this.product?.id) {
      this.messageService.add({
        severity: 'error',
        detail: 'ID do produto não encontrado'
      });
      return;
    }

    this.productService.update(this.product)
      .then((updatedProduct: any) => {
        this.onSave.emit(updatedProduct);
      })
      .catch((error: any) => {
        this.errorHandler.handle(error);
      });
  }
  cancel() {
    this.onCancel.emit();
  }

}
