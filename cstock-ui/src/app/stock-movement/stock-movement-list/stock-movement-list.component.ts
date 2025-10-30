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
    } catch (error) {
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
    this.filteredMovements = this.stockMovementService.filterMovements(
      this.movements,
      {
        productName: this.productName,
        movementType: this.movementType,
        clientName: this.clientName,
        period: this.selectedPeriod
      }
    );
  }

  onPeriodChange() {
    this.applyFilters();
  }

  getPeriodLabel(): string {
    const period = this.periodOptions.find(p => p.value === this.selectedPeriod);
    return period ? period.label : '';
  }

  getMovementValue(movement: StockMovement): string {
    return this.stockMovementService.getMovementValue(movement);
  }

  formatDate(date: Date): string {
    return this.stockMovementService.formatMovementDate(date);
  }

  getClientName(movement: StockMovement): string {
    return this.stockMovementService.getClientName(movement);
  }

  getMovementTypeLabel(type: string): string {
    return this.stockMovementService.getMovementTypeLabel(type);
  }

  getMovementTypeClass(type: string): string {
    return this.stockMovementService.getMovementTypeClass(type);
  }

  getQuantityDisplay(movement: StockMovement): string {
    return this.stockMovementService.getQuantityDisplay(movement);
  }

  getQuantityClass(movement: StockMovement): string {
    return this.stockMovementService.getQuantityClass(movement);
  }
}
