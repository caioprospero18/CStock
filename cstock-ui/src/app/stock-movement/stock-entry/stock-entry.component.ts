import { Component, EventEmitter, Output } from '@angular/core';
import { Product, StockMovement } from '../../core/models';
import { StockMovementService } from '../stock-movement.service';
import { AuthService } from '../../security/auth.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ProductService } from '../../products/product.service';

@Component({
  selector: 'app-stock-entry',
  templateUrl: './stock-entry.component.html',
  styleUrl: './stock-entry.component.css',
  standalone: false
})
export class StockEntryComponent {
  stockMovement!: StockMovement;
  product: Product | null = null;
  @Output() onSave = new EventEmitter<StockMovement>();
  @Output() onCancel = new EventEmitter<void>();
  productId?: number;
  selectedProduct: Product | null = null;
  filteredProducts: Product[] = [];
  allProducts: Product[] = [];

  constructor(
    private stockMovementService: StockMovementService,
    private productService: ProductService,
    private auth: AuthService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.params['id'];

    this.stockMovement = this.stockMovementService.createStockMovement('ENTRY', productId ? Number(productId) : undefined);

    if (productId && productId !== "new") {
      this.loadProduct(Number(productId));
    }
    this.loadAllProducts();
  }

  loadAllProducts() {
    this.productService.findAll()
      .then(products => {
        this.allProducts = products;
      })
      .catch(error => this.errorHandler.handle(error));
  }

  searchProduct() {
    if (this.productId) {
      this.productService.findById(this.productId)
        .then(product => {
          this.setSelectedProduct(product);
        })
        .catch(error => {
          this.clearProductSelection();
          this.messageService.add({ severity: 'warn', detail: 'Produto não encontrado' });
        });
    }
  }

  searchProductByName(event: any) {
    const query = event.query.toLowerCase();
    this.filteredProducts = this.allProducts.filter(product =>
      product.productName?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.id?.toString().includes(query)
    );
  }

  onProductSelect(event: any) {
    this.setSelectedProduct(event.value as Product);
  }

  private setSelectedProduct(product: Product) {
    this.product = product;
    this.productId = product.id as number;
    this.stockMovement.product = product;
    this.selectedProduct = product;
  }

  private clearProductSelection() {
    this.product = null;
    this.selectedProduct = null;
    this.productId = undefined;
  }

  loadProduct(id: number) {
    this.productService.findById(id)
      .then(product => {
        this.setSelectedProduct(product);
      })
      .catch(error => this.errorHandler.handle(error));
  }

  save(stockMovementForm: NgForm) {
    this.addStockMovement();
  }

  addStockMovement() {
    const validationError = this.stockMovementService.validateStockMovement(this.stockMovement, false);
    if (validationError) {
      this.messageService.add({ severity: 'error', detail: validationError });
      return;
    }

    this.stockMovementService.add(this.stockMovement)
      .then(addedStockMovement => {
        this.messageService.add({ severity: 'success', detail: 'Entrada de estoque registrada com sucesso!' });
        this.onSave.emit(addedStockMovement);

        if (this.product) {
          this.product.quantity += this.stockMovement.quantity;
        }

        this.resetForm();
      })
      .catch(error => this.errorHandler.handle(error));
  }

  private resetForm() {
    const currentProductId = this.product?.id;
    this.stockMovement = this.stockMovementService.createStockMovement('ENTRY', currentProductId);

    if (this.product) {
      this.stockMovement.product = this.product;
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}
