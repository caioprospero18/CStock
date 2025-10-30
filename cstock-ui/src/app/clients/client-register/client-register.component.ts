import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Client, Enterprise } from '../../core/models';
import { ClientService } from '../client.service';
import { AuthService } from '../../security/auth.service';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientStateService } from '../../core/services/client-state.service';

@Component({
  selector: 'app-client-register',
  templateUrl: './client-register.component.html',
  styleUrls: ['./client-register.component.css']
})
export class ClientRegisterComponent {
  @Output() onSave = new EventEmitter<Client>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onUpdateRequest = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<number>();

  @Input() clientInput: Client | null = null;

  client = new Client();
  showDeleteConfirm = false;
  loading = false; 
  isEditing = false;

  constructor(
    private clientService: ClientService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private clientStateService: ClientStateService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.loadClient(Number(id));
    } else {
      this.setDefaultEnterprise();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientInput']?.currentValue) {
      this.client = { ...changes['clientInput'].currentValue };
      this.isEditing = Boolean(this.client.id);
    }
  }

  get editing(): boolean {
    return this.isEditing;
  }

  private setDefaultEnterprise(): void {
    const enterpriseId = this.authService.jwtPayload?.['enterprise_id'];
    if (enterpriseId && !this.client.enterprise?.id) {
      this.client.enterprise = { id: enterpriseId } as Enterprise;
    }
  }

  async loadClient(id: number): Promise<void> {
    this.loading = true;
    try {
      this.client = await this.clientService.findById(id);
      this.isEditing = true;
    } catch (error: any) {
      this.errorHandler.handle(error);
    } finally {
      this.loading = false;
    }
  }

  async save(clientForm: NgForm): Promise<void> {
    if (clientForm.invalid) {
      this.markFormAsTouched(clientForm);
      return;
    }

    this.loading = true;
    try {
      if (this.editing) {
        await this.updateClient();
      } else {
        await this.addClient();
      }
    } catch (error: any) {
      this.errorHandler.handle(error);
    } finally {
      this.loading = false;
    }
  }

  private async addClient(): Promise<void> {
    const savedClient = await this.clientService.add(this.client);
    this.showSuccessMessage('Cliente cadastrado com sucesso!');
    this.handleSaveSuccess(savedClient);
  }

  private async updateClient(): Promise<void> {
    const updatedClient = await this.clientService.update(this.client);
    this.showSuccessMessage('Cliente atualizado com sucesso!');
    this.handleSaveSuccess(updatedClient);
  }

  private handleSaveSuccess(client: Client): void {
    this.onSave.emit(client);
    this.resetForm();
    this.clientStateService.notifyClientListUpdate();
  }

  private markFormAsTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
  }

  private showSuccessMessage(detail: string): void {
    this.messageService.add({ severity: 'success', detail });
  }

  private resetForm(): void {
    this.client = new Client();
    this.isEditing = false;
    this.setDefaultEnterprise();
  }

  cancel(): void {
    this.resetForm();
    this.onCancel.emit();
  }

  showUpdateClientForm(): void {
    this.onUpdateRequest.emit();
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  async deleteClient(): Promise<void> {
    if (!this.client.id) return;

    this.loading = true;
    try {
      await this.clientService.remove(this.client.id);
      this.showSuccessMessage('Cliente excluído com sucesso!');
      this.onDelete.emit(this.client.id);
      this.resetForm();
      this.showDeleteConfirm = false;
      this.clientStateService.notifyClientListUpdate();
    } catch (error: any) {
      this.errorHandler.handle(error);
      this.showDeleteConfirm = false;
    } finally {
      this.loading = false;
    }
  }
}
