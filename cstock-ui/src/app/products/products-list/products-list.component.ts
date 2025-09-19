import { Component } from '@angular/core';
import { ProductFilter, ProductService } from '../product.service';
import { AuthService } from '../../security/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { Title } from '@angular/platform-browser';
import { Product } from '../../core/models';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css',
  standalone: false
})
export class ProductsListComponent {

  showProductForm = false;
  showEntryForm = false;
  showExitForm = false;
  showOrderForm = false;
  showUserForm = false;
  productName ? : string
  brand ? : string
  products = [];


  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private errorHandler: ErrorHandlerService,
    private title: Title)
  { }

  ngOnInit(): void {
    this.title.setTitle('Produtos');
    this.search();
  }



      search(): void {
        const filter: ProductFilter = {
          productName: this.productName,
          brand: this.brand,
        }

        this.productService.search(filter)
          .then(result => {
            this.products = result;
          })
          .catch(error => this.errorHandler.handle(error));

      }

  listEnterpriseProducts(): void {
    this.productService.listByEnterprise()
      .then(result => {
        this.products = result;
      })
      .catch(error => this.errorHandler.handle(error));
  }

  confirmRemoval(product: any): void {
    this.confirmation.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.remove(product);
      }
    });
  }

  remove(product: any): void {
    this.productService.remove(product.id)
      .then(() => {
        this.search();
        this.messageService.add({ severity: 'success', detail: 'Atividade excluída com sucesso!' });
      })
      .catch(error => this.errorHandler.handle(error));
  }

  onProductSaved(savedProduct: any) {
    this.showProductForm = false;
    this.search();
  }

  showRegisterForm() {
    this.showProductForm = true;
  }

  showStockEntryForm(){
    this.showEntryForm = true;
  }

  onEntrySaved(savedStockMovement: any) {
    this.showEntryForm = false;
    this.search();
  }

  showStockExitForm(){
    this.showExitForm = true;
  }

  onExitSaved(savedStockMovement: any) {
    this.showExitForm = false;
    this.search();
  }

  showOrderRequestForm(){
    this.showOrderForm = true;
  }

  onOrderRequestSaved(savedOrderRequest: any) {
    this.showOrderForm = false;
    this.search();
  }

  showRegisterUserForm(){
    this.showUserForm = true;
  }

  onRegisterUserSaved(savedRegisterUser: any) {
    this.showUserForm = false;
    this.search();
  }
}
