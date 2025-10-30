import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Enterprise, Product } from '../../core/models';
import { ProductService } from '../product.service';
import { AuthService } from '../../security/auth.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-update',
  templateUrl: './product-update.component.html',
  styleUrl: './product-update.component.css',
  standalone: false
})
export class ProductUpdateComponent {
  private _productInput: Product | null = null;

  @Input()
  set productInput(value: Product | null) {
    this._productInput = value;
    if (value) {
      this.loadProductData(value);
    }
  }
  get productInput(): Product | null {
    return this._productInput;
  }
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Product>();
  @Output() onDelete = new EventEmitter<number>();
  product: Product;
  showDeleteConfirm = false;

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService
  ){
    this.product = new Product();
  }

  private loadProductData(productData: Product): void {
    Object.assign(this.product, productData);

    if (!this.product.enterprise) {
      this.product.enterprise = new Enterprise();
    }
  }

  ngOnInit(): void {
    if (this.productInput) {
      Object.assign(this.product, this.productInput);

      if (!this.product.enterprise) {
        this.product.enterprise = new Enterprise();
      }
    }
  }

  async updateProduct(): Promise<void> {
    if (!this.product?.id) {
      this.messageService.add({
        severity: 'error',
        detail: 'ID do produto não encontrado'
      });
      return;
    }

    this.product.calculateTotals();

    try {
      const updatedProduct = await this.productService.update(this.product);
      this.onSave.emit(updatedProduct);
    } catch (error) {
      this.errorHandler.handle(error);
    }
  }

  cancel(): void {
    this.onCancel.emit();
  }

  async deleteProduct(): Promise<void> {
    if (!this.product.id) return;

    try {
      await this.productService.remove(this.product.id);
      this.messageService.add({
        severity: 'success',
        detail: 'Produto excluído com sucesso!'
      });
      this.onDelete.emit(this.product.id);
      this.showDeleteConfirm = false;
    } catch (error: any) {
      if (error.status === 404) {
        this.messageService.add({
          severity: 'error',
          detail: 'Produto não encontrado'
        });
      } else {
        this.errorHandler.handle(error);
      }
      this.showDeleteConfirm = false;
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }
}
