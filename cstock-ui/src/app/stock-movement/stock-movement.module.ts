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




@NgModule({
  declarations: [
    StockEntryComponent,
    StockExitComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule,
    AutoCompleteModule,
    CardModule,
    ButtonModule,
    InputTextModule
  ],
  exports:[
    StockEntryComponent,
    StockExitComponent,

  ]
})
export class StockMovementModule { }
