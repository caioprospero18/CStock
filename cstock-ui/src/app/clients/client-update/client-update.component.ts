import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { Client } from '../../core/models';
import { ClientService } from '../client.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { Subscription } from 'rxjs';
import { ClientStateService } from '../../core/services/client-state.service';

@Component({
  selector: 'app-client-update',
  templateUrl: './client-update.component.html',
  styleUrls: ['./client-update.component.css']
})
export class ClientUpdateComponent implements OnDestroy {
  @Output() onUpdate = new EventEmitter<Client>();
  @Output() onCancel = new EventEmitter<void>();
  @Input() isOpen = false;

  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;
  loading = false;

  searchId = '';
  searchName = '';

  private subscription = new Subscription();

  constructor(
    private clientService: ClientService,
    private errorHandler: ErrorHandlerService,
    private clientStateService: ClientStateService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.subscribeToClientUpdates();
  }

  private subscribeToClientUpdates(): void {
    this.subscription.add(
      this.clientStateService.clientListUpdated$.subscribe(() => {
        this.loadClients();
      })
    );
  }

  async loadClients(): Promise<void> {
    this.loading = true;
    try {
      this.clients = await this.clientService.findAll();
      this.filteredClients = [...this.clients];
    } catch (error: any) {
      this.errorHandler.handle(error);
    } finally {
      this.loading = false;
    }
  }

  filterClients(): void {
    this.filteredClients = this.clients.filter((client: Client) => {
      const matchesId = !this.searchId ||
        client.id?.toString().includes(this.searchId);

      const matchesName = !this.searchName ||
        client.clientName?.toLowerCase().includes(this.searchName.toLowerCase());

      return matchesId && matchesName;
    });

    if ((this.searchId || this.searchName) && this.filteredClients.length > 0) {
      this.autoSelectFromSearch();
    } else {
      this.selectedClient = null;
    }
  }

  autoSelectFromSearch(): void {
    if (this.filteredClients.length === 0) return;

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

  clearFilters(): void {
    this.searchId = '';
    this.searchName = '';
    this.filteredClients = [...this.clients];
    this.selectedClient = null;
  }

  selectClient(): void {
    if (this.selectedClient) {
      this.onUpdate.emit(this.selectedClient);
      this.resetComponent();
    }
  }

  cancel(): void {
    this.resetComponent();
    this.onCancel.emit();
  }

  private resetComponent(): void {
    this.selectedClient = null;
    this.searchId = '';
    this.searchName = '';
    this.filteredClients = [...this.clients];
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
