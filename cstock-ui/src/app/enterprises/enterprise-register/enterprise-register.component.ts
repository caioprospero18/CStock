import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { EnterpriseService } from '../enterprise.service';
import { Enterprise } from '../../core/models';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { EnterpriseStateService } from '../../core/services/enterprise-state.service';

@Component({
  selector: 'app-enterprise-register',
  templateUrl: './enterprise-register.component.html',
  styleUrls: ['./enterprise-register.component.css']
})
export class EnterpriseRegisterComponent {
  @Output() onSave = new EventEmitter<Enterprise>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onUpdateRequest = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<number>();

  @Input() enterpriseInput: Enterprise | null = null;

  enterprise = new Enterprise();
  showDeleteConfirm = false;
  isEditing = false; 

  constructor(
    private enterpriseService: EnterpriseService,
    private errorHandler: ErrorHandlerService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private enterpriseStateService: EnterpriseStateService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'new') {
      this.loadEnterprise(Number(id));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enterpriseInput']?.currentValue) {
      this.enterprise = { ...changes['enterpriseInput'].currentValue };
      this.isEditing = Boolean(this.enterprise.id);
    }
  }

  get editing(): boolean {
    return this.isEditing;
  }

  async loadEnterprise(id: number): Promise<void> {
    try {
      this.enterprise = await this.enterpriseService.findById(id);
      this.isEditing = true;
    } catch (error: any) {
      this.errorHandler.handle(error);
    }
  }

  async save(enterpriseForm: NgForm): Promise<void> {
    if (enterpriseForm.invalid) {
      this.markFormAsTouched(enterpriseForm);
      return;
    }

    try {
      if (this.editing) {
        await this.updateEnterprise();
      } else {
        await this.addEnterprise();
      }
    } catch (error: any) {
      this.handleSaveError(error);
    }
  }

  private async addEnterprise(): Promise<void> {
    const savedEnterprise = await this.enterpriseService.add(this.enterprise);
    this.showSuccessMessage('Empresa cadastrada com sucesso!');
    this.handleSaveSuccess(savedEnterprise);
  }

  private async updateEnterprise(): Promise<void> {
    const updatedEnterprise = await this.enterpriseService.update(this.enterprise);
    this.showSuccessMessage('Empresa atualizada com sucesso!');
    this.handleSaveSuccess(updatedEnterprise);
  }

  private handleSaveSuccess(enterprise: Enterprise): void {
    this.onSave.emit(enterprise);
    this.resetForm();
    this.enterpriseStateService.notifyEnterpriseListUpdate();
  }

  private handleSaveError(error: any): void {
    if (error.status === 409 ||
        error.error?.message?.includes('CNPJ') ||
        error.message?.includes('CNPJ')) {
      this.showErrorMessage('CNPJ já cadastrado no sistema. Verifique os dados.');
    } else {
      this.errorHandler.handle(error);
    }
  }

  private markFormAsTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
  }

  private showSuccessMessage(detail: string): void {
    this.messageService.add({ severity: 'success', detail });
  }

  private showErrorMessage(detail: string): void {
    this.messageService.add({ severity: 'error', detail });
  }

  private resetForm(): void {
    this.enterprise = new Enterprise();
    this.isEditing = false;
  }

  cancel(): void {
    this.resetForm();
    this.onCancel.emit();
  }

  showUpdateEnterpriseForm(): void {
    this.onUpdateRequest.emit();
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  async deleteEnterprise(): Promise<void> {
    if (!this.enterprise.id) return;

    try {
      await this.enterpriseService.remove(this.enterprise.id);
      this.showSuccessMessage('Empresa excluída com sucesso!');
      this.onDelete.emit(this.enterprise.id);
      this.resetForm();
      this.showDeleteConfirm = false;
      this.enterpriseStateService.notifyEnterpriseListUpdate();
    } catch (error: any) {
      this.errorHandler.handle(error);
      this.showDeleteConfirm = false;
    }
  }
}
