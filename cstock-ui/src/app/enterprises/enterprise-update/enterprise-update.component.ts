import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { Enterprise } from '../../core/models';
import { EnterpriseService } from '../enterprise.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { Subscription } from 'rxjs';
import { EnterpriseStateService } from '../../core/services/enterprise-state.service';

@Component({
  selector: 'app-enterprise-update',
  templateUrl: './enterprise-update.component.html',
  styleUrls: ['./enterprise-update.component.css']
})
export class EnterpriseUpdateComponent implements OnDestroy {
  @Output() onUpdate = new EventEmitter<Enterprise>();
  @Output() onCancel = new EventEmitter<void>();
  @Input() isOpen = false;

  enterprises: Enterprise[] = [];
  filteredEnterprises: Enterprise[] = [];
  selectedEnterprise: Enterprise | null = null;
  loading = false;

  searchCnpj = '';
  searchName = '';

  private subscription = new Subscription();

  constructor(
    private enterpriseService: EnterpriseService,
    private errorHandler: ErrorHandlerService,
    private enterpriseStateService: EnterpriseStateService
  ) {}

  ngOnInit(): void {
    this.loadEnterprises();
    this.subscribeToEnterpriseUpdates();
  }

  private subscribeToEnterpriseUpdates(): void {
    this.subscription.add(
      this.enterpriseStateService.enterpriseListUpdated$.subscribe(() => {
        this.loadEnterprises();
      })
    );
  }

  async loadEnterprises(): Promise<void> {
    this.loading = true;
    try {
      this.enterprises = await this.enterpriseService.findAll();
      this.filteredEnterprises = [...this.enterprises];
    } catch (error: any) {
      this.errorHandler.handle(error);
    } finally {
      this.loading = false;
    }
  }

  filterEnterprises(): void {
    this.filteredEnterprises = this.enterprises.filter((enterprise: Enterprise) => {
      const matchesId = !this.searchCnpj ||
        enterprise.id?.toString().includes(this.searchCnpj);

      const matchesName = !this.searchName ||
        enterprise.enterpriseName?.toLowerCase().includes(this.searchName.toLowerCase());

      return matchesId && matchesName;
    });

    if ((this.searchCnpj || this.searchName) && this.filteredEnterprises.length > 0) {
      this.autoSelectFromSearch();
    } else {
      this.selectedEnterprise = null;
    }
  }

  autoSelectFromSearch(): void {
    if (this.filteredEnterprises.length === 0) return;

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

  clearFilters(): void {
    this.searchCnpj = '';
    this.searchName = '';
    this.filteredEnterprises = [...this.enterprises];
    this.selectedEnterprise = null;
  }

  selectEnterprise(): void {
    if (this.selectedEnterprise) {
      this.onUpdate.emit(this.selectedEnterprise);
      this.resetComponent();
    }
  }

  cancel(): void {
    this.resetComponent();
    this.onCancel.emit();
  }

  private resetComponent(): void {
    this.selectedEnterprise = null;
    this.searchCnpj = '';
    this.searchName = '';
    this.filteredEnterprises = [...this.enterprises];
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
