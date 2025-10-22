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
  client: Client = new Client();
  @Output() onSave = new EventEmitter<Client>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onUpdateRequest  = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<number>();
  @Input() clientInput: any;

  isEditing = false;
  showDeleteConfirm = false;
  loading = false;

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clientInput'] && this.clientInput) {
      if (this.clientInput.id) {
        this.client = { ...this.clientInput };
        this.isEditing = true;
      } else {
        this.client = new Client();
        this.isEditing = false;
        this.setDefaultEnterprise();
      }
    }
  }

  private setDefaultEnterprise() {
    const enterpriseId = this.authService.jwtPayload?.['enterprise_id'];
    if (enterpriseId && !this.client.enterprise?.id) {
      this.client.enterprise = new Enterprise();
      this.client.enterprise.id = enterpriseId;
    }
  }

  loadClient(id: number) {
    this.clientService.findById(id)
      .then((client: Client) => {
        this.client = client;
        this.isEditing = true;
      })
      .catch((error: any) => this.errorHandler.handle(error));
  }

  save(clientForm: NgForm) {
    if (clientForm.invalid) {
      Object.keys(clientForm.controls).forEach(key => {
        clientForm.controls[key].markAsTouched();
      });
      return;
    }

    if (this.isEditing) {
      this.updateClient();
    } else {
      this.addClient();
    }
  }

  addClient() {
    const clientToSave = Client.toJson(this.client);

    this.clientService.add(clientToSave)
      .then((savedClient: any) => {
        this.messageService.add({
          severity: 'success',
          detail: 'Cliente cadastrado com sucesso!'
        });
        this.onSave.emit(savedClient);
        this.resetForm();
      })
      .catch((error: any) => {
        this.errorHandler.handle(error);
      });
  }

  updateClient() {
    const clientToUpdate = Client.toJson(this.client);

    this.clientService.update(clientToUpdate)
      .then((updatedClient: any) => {
        this.messageService.add({
          severity: 'success',
          detail: 'Cliente atualizado com sucesso!'
        });
        this.onSave.emit(updatedClient);
        this.resetForm();
      })
      .catch((error: any) => {
        this.errorHandler.handle(error);
      });
  }

  private resetForm() {
    this.client = new Client();
    this.isEditing = false;
    this.setDefaultEnterprise();
  }

  cancel() {
    this.resetForm();
    this.onCancel.emit();
  }

  showUpdateClientForm(){
    this.onUpdateRequest.emit();
  }

  confirmDelete() {
    this.showDeleteConfirm = true;
  }

  deleteClient() {
    if (!this.client.id) return;

    this.clientService.remove(this.client.id)
        .then(() => {
            this.messageService.add({
                severity: 'success',
                detail: 'Cliente excluído com sucesso!'
            });
            this.onDelete.emit(this.client.id);
            this.resetForm();
            this.showDeleteConfirm = false;
            this.clientStateService.notifyClientListUpdate();
        })
        .catch((error: any) => {
            this.errorHandler.handle(error);
            this.showDeleteConfirm = false;
        });
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  get editing(): boolean {
    return this.isEditing;
  }
}
