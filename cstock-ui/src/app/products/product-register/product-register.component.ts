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
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();
  product = new Product(this.auth.jwtPayload?.['enterprise_id'] || 0);

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router){}

    ngOnInit(): void {
      const id = this.route.snapshot.params[`id`];
      if(id !== undefined && id !== "new"){
        this.loadProduct(id);
      }
    }

    get editing(): boolean {
      return Boolean(this.product.id);
    }

    loadProduct(id: number) {
      this.productService.findById(id)
        .then(product => {
          this.product = product;
        })
        .catch(error => this.errorHandler.handle(error));
    }

    save(productForm: NgForm){
      this.product.calculateTotals();

      if(this.editing){
        this.updateProduct(productForm);
      }else{
        this.addProduct(productForm);
      }
    }

    updateProduct(productForm: NgForm) {
      this.productService.update(this.product)
        .then( product => {
          this.messageService.add({ severity: 'success', detail: 'Produto editado com sucesso!' });
          this.product = product;
          this.onSave.emit(product);
        })
        .catch(error => this.errorHandler.handle(error));
    }

    addProduct(productForm: NgForm) {
      this.productService.add(this.product)
        .then(addedProduct => {
          this.messageService.add({ severity: 'success', detail: 'Produto adicionado com sucesso!' });
          this.onSave.emit(addedProduct);
        })
        .catch(error => this.errorHandler.handle(error));
    }

    new(productForm: NgForm){
      this.product = new Product(this.auth.jwtPayload?.user_id || 0);
      productForm.reset();
      this.router.navigate(['/products/new']);
    }

    cancel() {
    this.onCancel.emit();
  }
}
