import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StockMovementChartExitComponent } from './stock-movement-chart-exit/stock-movement-chart-exit.component';
import { StockMovementChartEntryComponent } from './stock-movement-chart-entry/stock-movement-chart-entry.component';


@NgModule({
  declarations: [
    StockMovementChartExitComponent,
    StockMovementChartEntryComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TableModule,
    ProgressSpinnerModule
  ],
  exports: [
    StockMovementChartExitComponent,
    StockMovementChartEntryComponent,
  ]
})
export class StockMovementChartsModule { }
