import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Enterprise } from '../../core/models';
import { EnterpriseService } from '../enterprise.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { Subscription } from 'rxjs';
import { EnterpriseStateService } from '../../core/services/enterprise-state.service';

@Component({
  selector: 'app-enterprise-update',
  templateUrl: './enterprise-update.component.html',
  styleUrl: './enterprise-update.component.css'
})
export class EnterpriseUpdateComponent {
  @Output() onUpdate = new EventEmitter<Enterprise>();
  @Output() onCancel = new EventEmitter<void>();
  @Input() isOpen: boolean = false;

  enterprises: Enterprise[] = [];
  filteredEnterprises: Enterprise[] = [];
  selectedEnterprise: Enterprise | null = null;
  loading = false;

  searchCnpj: string = '';
  searchName: string = '';

  private subscription = new Subscription();
  constructor(
    private enterpriseService: EnterpriseService,
    private errorHandler: ErrorHandlerService,
    private enterpriseStateService: EnterpriseStateService
  ) {}

  ngOnInit(): void {
    this.loadEnterprises();
    this.subscription.add(
      this.enterpriseStateService.enterpriseListUpdated$.subscribe(() => {
        this.loadEnterprises();
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.resetComponent();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async loadEnterprises() {
  this.loading = true;

  try {
    const enterprises = await this.enterpriseService.findAll();

    this.enterprises = enterprises;
    this.filteredEnterprises = [...enterprises];

    this.loading = false;
  } catch (error: any) {
    this.errorHandler.handle(error);
    this.loading = false;
  }
}


  autoSelectFromSearch() {
    if (this.filteredEnterprises.length === 0) {
      return;
    }

    if (this.filteredEnterprises.length === 1) {
      this.selectedEnterprise = this.filteredEnterprises[0];
      return;
    }

    if (this.searchCnpj) {
      const exactMatch = this.filteredEnterprises.find(enterprise =>
        enterprise.id?.toString() === this.searchCnpj
      );
      if (exactMatch) {
        this.selectedEnterprise = exactMatch;
        return;
      }
    }

    if (this.searchName && this.filteredEnterprises.length > 0) {
      this.selectedEnterprise = this.filteredEnterprises[0];
    }
  }

  filterEnterprises() {
    this.filteredEnterprises = this.enterprises.filter((enterprise: Enterprise) => {
      const matchesId = this.searchCnpj ?
        enterprise.id?.toString().includes(this.searchCnpj) : true;

      const matchesName = this.searchName ?
        enterprise.enterpriseName?.toLowerCase().includes(this.searchName.toLowerCase()) : true;

      return matchesId && matchesName;
    });

    if ((this.searchCnpj || this.searchName) && this.filteredEnterprises.length > 0) {
      setTimeout(() => this.autoSelectFromSearch(), 100);
    }
  }

  clearFilters() {
    this.searchCnpj = '';
    this.searchName = '';
    this.filteredEnterprises = [...this.enterprises];
    this.selectedEnterprise= null;
  }


  selectEnterprise() {
    if (this.selectedEnterprise) {
      this.onUpdate.emit(this.selectedEnterprise);
    }
  }

  cancel() {
    this.onCancel.emit();
  }

  resetComponent() {
    this.selectedEnterprise = null;
    this.searchCnpj = '';
    this.searchName = '';
    if (this.enterprises.length > 0) {
      this.filteredEnterprises = [...this.enterprises];
    }
  }
}
