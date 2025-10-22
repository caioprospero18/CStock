import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Client } from '../../core/models';
import { Subscription } from 'rxjs';
import { ClientService } from '../client.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { ClientStateService } from '../../core/services/client-state.service';

@Component({
  selector: 'app-client-update',
  templateUrl: './client-update.component.html',
  styleUrl: './client-update.component.css'
})
export class ClientUpdateComponent {
  @Output() onUpdate = new EventEmitter<Client>();
  @Output() onCancel = new EventEmitter<void>();
  @Input() isOpen: boolean = false;

  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;
  loading = false;

  searchId: string = '';
  searchName: string = '';

  private subscription = new Subscription();

  constructor(
    private clientService: ClientService,
    private errorHandler: ErrorHandlerService,
    private clientStateService: ClientStateService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.subscription.add(
      this.clientStateService.clientListUpdated$.subscribe(() => {
        this.loadClients();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.resetComponent();
    }
  }

  async loadClients() {
    this.loading = true;

    try {
      this.clients = await this.clientService.findAll();
      this.filteredClients = [...this.clients];
      this.loading = false;
    } catch (error: any) {
      this.errorHandler.handle(error);
      this.loading = false;
    }
  }

  autoSelectFromSearch() {
    if (this.filteredClients.length === 0) {
      return;
    }

    if (this.filteredClients.length === 1) {
      this.selectedClient = this.filteredClients[0];
      return;
    }

    if (this.searchId) {
      const exactMatch = this.filteredClients.find(client =>
        client.id?.toString() === this.searchId
      );
      if (exactMatch) {
        this.selectedClient = exactMatch;
        return;
      }
    }

    if (this.searchName && this.filteredClients.length > 0) {
      this.selectedClient = this.filteredClients[0];
    }
  }

  filterClients() {
    this.filteredClients = this.clients.filter((client: Client) => {
      const matchesId = this.searchId ?
        client.id?.toString().includes(this.searchId) : true;

      const matchesName = this.searchName ?
        client.clientName?.toLowerCase().includes(this.searchName.toLowerCase()) : true;

      return matchesId && matchesName;
    });

    if ((this.searchId || this.searchName) && this.filteredClients.length > 0) {
      setTimeout(() => this.autoSelectFromSearch(), 100);
    }
  }

  clearFilters() {
    this.searchId = '';
    this.searchName = '';
    this.filteredClients = [...this.clients];
    this.selectedClient = null;
  }

  selectClient() {
    if (this.selectedClient) {
      this.onUpdate.emit(this.selectedClient);
    }
  }

  cancel() {
    this.onCancel.emit();
  }

  resetComponent() {
    this.selectedClient = null;
    this.searchId = '';
    this.searchName = '';
    if (this.clients.length > 0) {
      this.filteredClients = [...this.clients];
    }
  }
}
