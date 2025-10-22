import { Component, OnInit } from '@angular/core';
import { StockMovementService } from '../stock-movement.service';
import { StockMovement } from '../../core/models';

@Component({
  selector: 'app-stock-movement-list',
  templateUrl: './stock-movement-list.component.html',
  styleUrls: ['./stock-movement-list.component.css']
})
export class StockMovementListComponent implements OnInit {
  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];
  loading = false;

  productName: string = '';
  movementType: string = '';
  clientName: string = '';
  selectedPeriod: string = '';

  movementTypes = [
    { label: 'Todos os Tipos', value: '' },
    { label: 'Entrada', value: 'ENTRY' },
    { label: 'Saída', value: 'EXIT' }
  ];

  periodOptions = [
    { label: 'Todos os Períodos', value: '' },
    { label: 'Últimas 24 Horas', value: '24h' },
    { label: 'Últimos 7 Dias', value: '7d' },
    { label: 'Últimos 30 Dias', value: '30d' }
  ];

  constructor(private stockMovementService: StockMovementService) {}

  ngOnInit() {
    this.loadMovements();
  }

  async loadMovements() {
    this.loading = true;
    try {
      this.movements = await this.stockMovementService.findAll();
      this.applyFilters();
      console.log('Movimentações carregadas:', this.movements);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
      this.movements = [];
      this.filteredMovements = [];
    } finally {
      this.loading = false;
    }
  }

  search() {
    this.applyFilters();
  }

  clearFilters() {
    this.productName = '';
    this.movementType = '';
    this.clientName = '';
    this.selectedPeriod = '';
    this.filteredMovements = [...this.movements];
  }

  applyFilters() {
    this.filteredMovements = this.movements.filter((movement: StockMovement) => {
      const matchesProduct = this.productName ?
        movement.product?.productName?.toLowerCase().includes(this.productName.toLowerCase()) : true;

      const matchesType = this.movementType ?
        movement.movementType === this.movementType : true;

      const matchesClient = this.clientName ?
        movement.client?.clientName?.toLowerCase().includes(this.clientName.toLowerCase()) : true;

      const matchesPeriod = this.filterByPeriod(movement);

      return matchesProduct && matchesType && matchesClient && matchesPeriod;
    });
  }

  private filterByPeriod(movement: StockMovement): boolean {
    if (!this.selectedPeriod || !movement.movementDate) {
      return true;
    }

    const movementDate = new Date(movement.movementDate);
    const now = new Date();

    switch (this.selectedPeriod) {
      case '24h':
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        return movementDate >= twentyFourHoursAgo;

      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        return movementDate >= sevenDaysAgo;

      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        return movementDate >= thirtyDaysAgo;

      default:
        return true;
    }
  }

  onPeriodChange() {
    this.applyFilters();
  }

  getPeriodLabel(): string {
    const period = this.periodOptions.find(p => p.value === this.selectedPeriod);
    return period ? period.label : '';
  }

  getMovementValue(movement: StockMovement): string {
    if (movement.movementValue !== undefined && movement.movementValue !== null) {
      return `R$ ${movement.movementValue.toFixed(2)}`;
    }

    if (movement.product?.salePrice && movement.movementType === 'EXIT') {
      return `R$ ${(movement.quantity * movement.product.salePrice).toFixed(2)}`;
    } else if (movement.product?.purchasePrice && movement.movementType === 'ENTRY') {
      return `R$ ${(movement.quantity * movement.product.purchasePrice).toFixed(2)}`;
    }

    return '-';
  }

  formatDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR');
  }

  getClientName(movement: StockMovement): string {
    return movement.client?.clientName || '-';
  }

  getMovementTypeLabel(type: string): string {
    return type === 'ENTRY' ? 'Entrada' : 'Saída';
  }

  getMovementTypeClass(type: string): string {
    return type === 'ENTRY' ? 'movement-entry' : 'movement-exit';
  }

  getQuantityDisplay(movement: StockMovement): string {
    const quantity = movement.quantity || 0;
    return movement.movementType === 'ENTRY' ? `+${quantity}` : `-${quantity}`;
  }

  getQuantityClass(movement: StockMovement): string {
    return movement.movementType === 'ENTRY' ? 'quantity-positive' : 'quantity-negative';
  }
}
