import { Component, EventEmitter, Output } from '@angular/core';
import { Product } from '../../core/models';
import { ProductService } from '../product.service';
import { AuthService } from '../../security/auth.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-product-register',
  templateUrl: './product-register.component.html',
  styleUrl: './product-register.component.css',
  standalone: false
})
export class ProductRegisterComponent {
  @Output() onSave = new EventEmitter<Product>(); 
  @Output() onCancel = new EventEmitter<void>();
  product = new Product(this.auth.jwtPayload?.['enterprise_id'] || 0);

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id !== undefined && id !== "new") {
      this.loadProduct(Number(id));
    }
  }

  get editing(): boolean {
    return Boolean(this.product.id);
  }

  async loadProduct(id: number): Promise<void> {
    try {
      this.product = await this.productService.findById(id);
    } catch (error) {
      this.errorHandler.handle(error);
    }
  }

  async save(productForm: NgForm): Promise<void> {
    this.product.calculateTotals();

    try {
      if (this.editing) {
        await this.updateProduct();
      } else {
        await this.addProduct();
      }
    } catch (error) {
      this.errorHandler.handle(error);
    }
  }

  private async updateProduct(): Promise<void> {
    const updatedProduct = await this.productService.update(this.product);
    this.messageService.add({
      severity: 'success',
      detail: 'Produto editado com sucesso!'
    });
    this.onSave.emit(updatedProduct);
  }

  private async addProduct(): Promise<void> {
    const addedProduct = await this.productService.add(this.product);
    this.messageService.add({
      severity: 'success',
      detail: 'Produto adicionado com sucesso!'
    });
    this.onSave.emit(addedProduct);
  }

  new(productForm: NgForm): void {
    this.product = new Product(this.auth.jwtPayload?.['enterprise_id'] || 0);
    productForm.reset();
    this.router.navigate(['/products/new']);
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
