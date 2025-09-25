import { Component } from '@angular/core';
import { ProductFilter, ProductService } from '../product.service';
import { AuthService } from '../../security/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorHandlerService } from '../../core/error-handler.service';
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
  showUpdateForm = false;
  showProductUForm = false;
  selectedProduct: Product | null = null;
  selectedUserForUpdate: any = null;
  productName?: string;
  brand?: string;
  products: Product[] = [];
  isAdmin = false;
  loading = false;

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private errorHandler: ErrorHandlerService

  ) { }

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;

    if (this.isAdmin) {
      this.searchAllProducts();
    } else {
      this.listEnterpriseProducts();
    }
  }

  searchAllProducts(): void {
    const filter: ProductFilter = {
      productName: this.productName,
      brand: this.brand,
    }

    this.productService.search(filter)
      .then(result => {
        this.products = result;
        this.loading = false;
      })
      .catch(error => {
        this.errorHandler.handle(error);
        this.loading = false;
      });
  }

  listEnterpriseProducts(): void {
    this.productService.listByEnterprise()
      .then(result => {
        this.products = result;

        if (this.productName || this.brand) {
          this.products = this.products.filter(product =>
            (!this.productName ||
             product.productName.toLowerCase().includes(this.productName!.toLowerCase())) &&
            (!this.brand ||
             product.brand.toLowerCase().includes(this.brand!.toLowerCase()))
          );
        }

        this.loading = false;
      })
      .catch(error => {
        this.errorHandler.handle(error);
        this.loading = false;
      });
  }

  search(): void {
    this.loading = true;

    if (this.isAdmin) {
      this.searchAllProducts();
    } else {
      this.listEnterpriseProducts();
    }
  }

  clearFilters(): void {
    this.productName = '';
    this.brand = '';
    this.loadProducts();
  }

  hasActiveFilters(): boolean {
    return !!(this.productName || this.brand);
  }

  editProduct(product: Product) {
    if (product.id) {
      this.showProductUpdateForm(product);
    } else {
      this.messageService.add({
        severity: 'error',
        detail: 'ID do produto não encontrado'
      });
    }
  }

  confirmRemoval(product: Product): void {
    this.confirmation.confirm({
      message: `Tem certeza que deseja excluir o produto "${product.productName}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.remove(product);
      }
    });
  }

  remove(product: Product): void {
    if (!product.id) {
      console.error('ID do produto não encontrado');
      return;
    }

    this.productService.remove(product.id)
      .then(() => {
        this.loadProducts();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto excluído com sucesso!'
        });
      })
      .catch(error => this.errorHandler.handle(error));
  }

  onProductSaved(savedProduct: any) {
    this.showProductForm = false;
    this.loadProducts();
  }

  showRegisterForm() {
    this.showProductForm = true;
  }

  showStockEntryForm(){
    this.showEntryForm = true;
  }

  onEntrySaved(savedStockMovement: any) {
    this.showEntryForm = false;
    this.loadProducts();
  }

  showStockExitForm(){
    this.showExitForm = true;
  }

  onExitSaved(savedStockMovement: any) {
    this.showExitForm = false;
    this.loadProducts();
  }

  showOrderRequestForm(){
    this.showOrderForm = true;
  }

  onOrderRequestSaved(savedOrderRequest: any) {
    this.showOrderForm = false;
    this.loadProducts();
  }

  showRegisterUserForm(){
    this.showUserForm = true;
    this.showUpdateForm = false;
    this.selectedUserForUpdate = null;
  }

  onRegisterUserSaved(savedRegisterUser: any) {
    this.showUserForm = false;
    this.loadProducts();
  }

  showUpdateUserForm() {
    this.showUpdateForm = true;
    this.showUserForm = false;
  }

  onRegisterUserUpdated(updatedUser: any) {
    this.showUpdateForm = false;
    this.loadProducts();
  }

  onUserFormCancel() {
    this.showUserForm = false;
    this.selectedUserForUpdate = null;
  }

  onUserSelectedForUpdate(selectedUser: any) {
    this.selectedUserForUpdate = selectedUser;
    this.showUpdateForm = false;
    this.showUserForm = true;
  }

  onUpdateUserCancel() {
    this.showUpdateForm = false;
  }

  onUserDeleted(deletedUserId: number) {
    this.showUserForm = false;
    this.loadProducts();
    this.messageService.add({
      severity: 'success',
      detail: 'Usuário excluído com sucesso!'
    });
  }

  showProductUpdateForm(product: Product) {
  console.log('=== DEBUG showProductUForm ===');
  console.log('Produto recebido:', product);
  console.log('ID do produto:', product?.id);

  if (product && product.id) {
    this.selectedProduct = product;
    this.showProductUForm = true;
    console.log('Modal aberto com produto:', this.selectedProduct);
  } else {
    console.error('Produto inválido recebido');
    this.messageService.add({
      severity: 'error',
      detail: 'Erro ao carregar dados do produto'
    });
  }
}

  onProductUpdateSaved(updatedProduct: any) {
    this.showProductUForm = false;
    this.selectedProduct = null;
    this.loadProducts();
    this.messageService.add({
      severity: 'success',
      detail: 'Produto atualizado com sucesso!'
    });
  }
}
