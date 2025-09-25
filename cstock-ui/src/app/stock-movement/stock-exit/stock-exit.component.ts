import { Component, EventEmitter, Output } from '@angular/core';
import { Product, StockMovement } from '../../core/models';
import { StockMovementService } from '../stock-movement.service';
import { ProductService } from '../../products/product.service';
import { AuthService } from '../../security/auth.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-stock-exit',
  templateUrl: './stock-exit.component.html',
  styleUrl: './stock-exit.component.css',
  standalone: false
})
export class StockExitComponent {
  stockMovement!: StockMovement;
    product: Product | null = null;
    @Output() onSave = new EventEmitter<StockMovement>();
    @Output() onCancel = new EventEmitter<void>();
    productId!: number;
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
      const userId = this.auth.jwtPayload?.['user_id'];

      this.initializeStockMovement(productId, userId);
      this.stockMovement.movementType = 'ENTRY'

      if (productId && productId !== "new") {
        this.loadProduct(productId);
      }
      this.loadAllProducts();

    }

    initializeStockMovement(productId?: number, userId?: number) {
    this.stockMovement = new StockMovement();

    this.stockMovement.movementType = 'EXIT' as any;

    this.stockMovement.movementDate = new Date();

    this.stockMovement.quantity = 1;

    if (productId) {
      this.stockMovement.product = { id: productId } as Product;
    }
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
            this.product = product;
            this.stockMovement.product = product;
            this.selectedProduct = product;
          })
          .catch(error => {
            this.product = null;
            this.selectedProduct = null;
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
    this.product = event.value as Product;
    this.productId = this.product.id as number;
    this.stockMovement.product = this.product;

    this.selectedProduct = this.product;
  }

    loadProduct(id: number) {
      this.productService.findById(id)
        .then(product => {
          this.product = product;
          this.stockMovement.product = product;
          this.productId = product.id;
          this.selectedProduct = product;
        })
        .catch(error => this.errorHandler.handle(error));
    }

    save(stockMovementForm: NgForm) {
      this.addStockMovement(stockMovementForm);
    }

    addStockMovement(stockMovementForm: NgForm) {
      if (!this.stockMovement.quantity || this.stockMovement.quantity <= 0) {
        this.messageService.add({ severity: 'error', detail: 'Quantidade deve ser maior que zero!' });
        return;
      }

      if (!this.stockMovement.product?.id) {
        this.messageService.add({ severity: 'error', detail: 'Produto não selecionado!' });
        return;
      }

      this.stockMovementService.add(this.stockMovement)
        .then(addedStockMovement => {
          this.messageService.add({ severity: 'success', detail: 'Entrada de estoque registrada com sucesso!' });
          this.onSave.emit(addedStockMovement);

          if (this.product) {
            this.product.quantity += this.stockMovement.quantity;
          }

          this.new(stockMovementForm);
        })
        .catch(error => this.errorHandler.handle(error));
    }

    new(stockMovementForm: NgForm) {
      const currentProductId = this.product?.id;
      const userId = this.auth.jwtPayload?.['user_id'];

      this.initializeStockMovement(currentProductId, userId);

      if (this.product) {
        this.stockMovement.product = this.product;
      }

      stockMovementForm.reset();
    }

    cancel() {
      this.onCancel.emit();
    }

}
