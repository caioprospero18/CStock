import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockEntryComponent } from './stock-entry/stock-entry.component';
import { StockExitComponent } from './stock-exit/stock-exit.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from 'primeng/api';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    StockEntryComponent,
    StockExitComponent
  ],
  imports: [
    CommonModule,
    ConfirmDialogModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    SharedModule,
    RouterModule
  ]
})
export class StockMovementModule { }
