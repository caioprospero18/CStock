import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { EnterpriseService } from '../enterprise.service';
import { Enterprise } from '../../core/models';
import { ErrorHandlerService } from '../../core/error-handler.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../security/auth.service';
import { NgForm } from '@angular/forms';
import { EnterpriseStateService } from '../../core/services/enterprise-state.service';

@Component({
  selector: 'app-enterprise-register',
  templateUrl: './enterprise-register.component.html',
  styleUrl: './enterprise-register.component.css'
})
export class EnterpriseRegisterComponent {
    @Output() onSave = new EventEmitter<any>();
    @Output() onCancel = new EventEmitter<void>();
    @Output() onUpdateRequest  = new EventEmitter<void>();
    @Output() onDelete = new EventEmitter<number>();
    @Input() enterpriseInput: any;
    enterprise = new Enterprise();
    isEditing = false;
    showDeleteConfirm = false;


    constructor(
      private enterpriseService: EnterpriseService,
      private errorHandler: ErrorHandlerService,
      private messageService: MessageService,
      private route: ActivatedRoute,
      private authService: AuthService,
      private enterpriseStateService: EnterpriseStateService
    ){}

    ngOnInit(): void {
      const id = this.route.snapshot.params['id'];
      if (id && id !== 'new') {
        this.loadEnterprise(Number(id));
      }
    }

     ngOnChanges(changes: SimpleChanges) {
      if (changes['enterpriseInput'] && this.enterpriseInput) {
        if (this.enterpriseInput.id) {
          this.enterprise = { ...this.enterpriseInput };
          this.isEditing = true;
        } else {
          this.enterprise = new Enterprise();
          this.isEditing = false;
        }
      }
    }


    get editing(): boolean {
      return this.isEditing;
    }


    loadEnterprise(id: number) {
      this.enterpriseService.findById(id)
        .then((enterprise: Enterprise) => {
          this.enterprise = enterprise;
          this.isEditing = true;
        })
        .catch((error: any) => this.errorHandler.handle(error));
    }

    save(enterpriseForm: NgForm) {
      if (enterpriseForm.invalid) {
        Object.keys(enterpriseForm.controls).forEach(key => {
          enterpriseForm.controls[key].markAsTouched();
        });
        return;
      }

      if (this.isEditing) {
        this.updateEnterprise();
      } else {
        this.addEnterprise();
      }
    }

    addEnterprise() {
      this.enterpriseService.add(this.enterprise)
        .then((enterpriseUser: any) => {
          this.messageService.add({
            severity: 'success',
            detail: 'Empresa cadastrada com sucesso!'
          });
          this.onSave.emit(enterpriseUser);
          this.resetForm();
          this.enterpriseStateService.notifyEnterpriseListUpdate();
        })
        .catch((error: any) => {
          if (error.status === 409 ||
              error.error?.message?.includes('CNPJ') ||
              error.message?.includes('CNPJ')) {
            this.messageService.add({
              severity: 'error',
              detail: 'CNPJ já cadastrado no sistema. Verifique os dados.'
            });
          } else {
            this.errorHandler.handle(error);
          }
        });
    }

    updateEnterprise() {
      this.enterpriseService.update(this.enterprise)
        .then((updatedEnterprise: any) => {
          this.messageService.add({
            severity: 'success',
            detail: 'Empresa atualizado com sucesso!'
          });
          this.onSave.emit(updatedEnterprise);
          this.resetForm();
          this.enterpriseStateService.notifyEnterpriseListUpdate();
        })
        .catch((error: any) => {
          this.errorHandler.handle(error);
        });
    }

    private resetForm() {
      this.enterprise = new Enterprise();
      this.isEditing = false;
    }

    cancel() {
      this.resetForm();
      this.onCancel.emit();
    }

    showUpdateEnterpriseForm(){
      this.onUpdateRequest.emit();
    }

    confirmDelete() {
      this.showDeleteConfirm = true;
    }

    deleteEnterprise() {
      if (!this.enterprise.id) return;

      this.enterpriseService.remove(this.enterprise.id)
        .then(() => {
          this.messageService.add({
            severity: 'success',
            detail: 'Empresa excluído com sucesso!'
          });
          this.onDelete.emit(this.enterprise.id);
          this.resetForm();
          this.showDeleteConfirm = false;
          this.enterpriseStateService.notifyEnterpriseListUpdate();
        })
        .catch((error: any) => {
          this.errorHandler.handle(error);
          this.showDeleteConfirm = false;
        });
    }

    cancelDelete() {
      this.showDeleteConfirm = false;
    }
}
