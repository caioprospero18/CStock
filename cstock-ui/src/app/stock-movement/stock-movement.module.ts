import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockEntryComponent } from './stock-entry/stock-entry.component';
import { StockExitComponent } from './stock-exit/stock-exit.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { StockMovementListComponent } from './stock-movement-list/stock-movement-list.component';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';




@NgModule({
  declarations: [
    StockEntryComponent,
    StockExitComponent,
    StockMovementListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule,
    AutoCompleteModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    DropdownModule
  ],
  exports:[
    StockEntryComponent,
    StockExitComponent,

  ]
})
export class StockMovementModule { }
