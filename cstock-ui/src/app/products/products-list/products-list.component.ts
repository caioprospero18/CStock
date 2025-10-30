import { Component } from '@angular/core';
import { ProductFilter, ProductService } from '../product.service';
import { RevenueService } from '../revenue.service';
import { AuthService } from '../../security/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { Enterprise, Product, Client } from '../../core/models';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent {
  showProductForm = false;
  showEntryForm = false;
  showExitForm = false;
  showOrderForm = false;
  showUserForm = false;
  showUpdateForm = false;
  showProductUForm = false;
  showEnterpriseForm = false;
  showUpdateEForm = false;
  showClientForm = false;
  showClientUForm = false;

  selectedProduct: Product | null = null;
  selectedUserForUpdate: any = null;
  selectedEnterprise: Enterprise | null = null;
  selectedEnterpriseForUpdate: any = null;
  selectedClientForUpdate: any | null = null;

  productName?: string;
  brand?: string;
  products: Product[] = [];
  isAdmin = false;
  loading = false;

  productRevenues: { [productId: number]: number } = {};
  totalSystemRevenue = 0;
  revenuePeriod = '30D';
  loadingRevenue = false;

  periodOptions = [
    { label: '24 Horas', value: '24H' },
    { label: '7 Dias', value: '7D' },
    { label: '30 Dias', value: '30D' },
    { label: '90 Dias', value: '90D' }
  ];

  constructor(
    private productService: ProductService,
    private revenueService: RevenueService,
    private auth: AuthService,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private errorHandler: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.loading = true;

    try {
      if (this.isAdmin) {
        await this.searchAllProducts();
      } else {
        await this.listEnterpriseProducts();
      }
      await this.loadRevenueData();
    } catch (error) {
      this.errorHandler.handle(error);
    } finally {
      this.loading = false;
    }
  }

  private async searchAllProducts(): Promise<void> {
    const filter: ProductFilter = {
      productName: this.productName,
      brand: this.brand,
    };

    this.products = await this.productService.search(filter);
  }

  private async listEnterpriseProducts(): Promise<void> {
    this.products = await this.productService.listByEnterprise();

    if (this.hasActiveFilters()) {
      const filter: ProductFilter = {
        productName: this.productName,
        brand: this.brand,
      };
      this.products = this.productService.filterProductsLocally(this.products, filter);
    }
  }

  private async loadRevenueData(): Promise<void> {
    if (this.products.length === 0) return;

    this.loadingRevenue = true;

    try {
      const revenueData = await this.revenueService.loadRevenueData(
        this.revenuePeriod,
        this.products
      );

      this.totalSystemRevenue = revenueData.totalRevenue;
      this.productRevenues = revenueData.productRevenues;
    } catch (error) {
    } finally {
      this.loadingRevenue = false;
    }
  }

  getProductRevenue(productId: number): number {
    return this.productRevenues[productId] || 0;
  }

  async onPeriodChange(): Promise<void> {
    await this.loadRevenueData();
  }

  async search(): Promise<void> {
    await this.loadProducts();
  }

  clearFilters(): void {
    this.productName = '';
    this.brand = '';
    this.loadProducts();
  }

  hasActiveFilters(): boolean {
    return !!(this.productName || this.brand);
  }

  editProduct(product: Product): void {
    if (product.id) {
      this.selectedProduct = product;
      this.showProductUForm = true;
    } else {
      this.showMessage('error', 'ID do produto não encontrado');
    }
  }

  confirmRemoval(product: Product): void {
    this.confirmation.confirm({
      message: `Tem certeza que deseja excluir "${product.productName}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      accept: () => this.remove(product)
    });
  }

  async remove(product: Product): Promise<void> {
    if (!product.id) return;

    try {
      await this.productService.remove(product.id);
      this.products = this.products.filter(p => p.id !== product.id);
      this.showMessage('success', 'Produto excluído com sucesso!');
    } catch (error: any) {
      if (error.status === 404) {
        this.showMessage('error', 'Produto não encontrado');
      } else {
        this.errorHandler.handle(error);
      }
    }
  }


  onProductSaved(savedProduct?: any): void {
    this.showProductForm = false;
    this.loadProducts();
  }

  onProductUpdateSaved(updatedProduct?: any): void {
    this.showProductUForm = false;
    this.selectedProduct = null;
    this.loadProducts();
    this.showMessage('success', 'Produto atualizado com sucesso!');
  }

  onProductDeleted(deletedProductId: number): void {
    this.products = this.products.filter(product => product.id !== deletedProductId);
    this.showProductUForm = false;
  }

  onEntrySaved(savedStockMovement?: any): void {
    this.showEntryForm = false;
    this.loadProducts();
  }

  onExitSaved(savedStockMovement?: any): void {
    this.showExitForm = false;
    this.loadProducts();
  }

  onOrderRequestSaved(savedOrderRequest?: any): void {
    this.showOrderForm = false;
    this.loadProducts();
  }

  onRegisterUserSaved(savedUser?: any): void {
    this.showUserForm = false;
    this.loadProducts();
  }

  onUserDeleted(deletedUserId: number): void {
    this.showUserForm = false;
    this.loadProducts();
  }

  onUserFormCancel(): void {
    this.showUserForm = false;
    this.selectedUserForUpdate = null;
  }

  onUserSelectedForUpdate(selectedUser: any): void {
    this.selectedUserForUpdate = selectedUser;
    this.showUpdateForm = false;
    this.showUserForm = true;
  }

  onUpdateUserCancel(): void {
    this.showUpdateForm = false;
  }

  onRegisterEnterpriseSaved(savedEnterprise?: any): void {
    this.showEnterpriseForm = false;
    this.loadProducts();
  }

  onEnterpriseDeleted(deletedEnterpriseId: number): void {
    this.showEnterpriseForm = false;
    this.loadProducts();
  }

  onEnterpriseFormCancel(): void {
    this.showEnterpriseForm = false;
    this.selectedEnterpriseForUpdate = null;
  }

  onEnterpriseSelectedForUpdate(selectedEnterprise: any): void {
    this.selectedEnterpriseForUpdate = selectedEnterprise;
    this.showUpdateEForm = false;
    this.showEnterpriseForm = true;
  }

  onUpdateEnterpriseCancel(): void {
    this.showUpdateEForm = false;
  }

  onRegisterClientSaved(savedClient?: Client): void {
    this.showClientForm = false;
    this.loadProducts();
  }

  onClientDeleted(deletedClientId: number): void {
    this.showClientForm = false;
    this.loadProducts();
  }

  onClientFormCancel(): void {
    this.showClientForm = false;
    this.selectedClientForUpdate = null;
  }

  onClientSelectedForUpdate(selectedClient: any): void {
    this.selectedClientForUpdate = selectedClient;
    this.showClientUForm = false;
    this.showClientForm = true;
  }

  onUpdateClientCancel(): void {
    this.showClientUForm = false;
  }

  showRegisterForm(): void {
    this.showProductForm = true;
  }

  showStockEntryForm(): void {
    this.showEntryForm = true;
  }

  showStockExitForm(): void {
    this.showExitForm = true;
  }

  showOrderRequestForm(): void {
    this.showOrderForm = true;
  }

  showRegisterUserForm(): void {
    this.showUserForm = true;
    this.showUpdateForm = false;
    this.selectedUserForUpdate = null;
  }

  showUpdateUserForm(): void {
    this.showUpdateForm = true;
    this.showUserForm = false;
  }

  showProductUpdateForm(product: Product): void {
    if (product && product.id) {
      this.selectedProduct = product;
      this.showProductUForm = true;
    } else {
      this.showMessage('error', 'Erro ao carregar dados do produto');
    }
  }

  showRegisterEnterpriseForm(): void {
    this.showEnterpriseForm = true;
    this.showUpdateEForm = false;
    this.selectedEnterpriseForUpdate = null;
  }

  showUpdateEnterpriseForm(): void {
    this.showUpdateEForm = true;
    this.showEnterpriseForm = false;
  }

  showRegisterClientForm(): void {
    this.showClientForm = true;
    this.showClientUForm = false;
    this.selectedClientForUpdate = null;
  }

  showUpdateClientForm(): void {
    this.showClientUForm = true;
    this.showClientForm = false;
  }

  private showMessage(severity: string, detail: string): void {
    this.messageService.add({ severity, detail });
  }
}
