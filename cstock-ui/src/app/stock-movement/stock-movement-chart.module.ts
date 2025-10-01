import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StockMovementChartComponent } from './stock-movement-chart/stock-movement-chart.component';


@NgModule({
  declarations: [
    StockMovementChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TableModule,
    ProgressSpinnerModule
  ],
  exports: [
    StockMovementChartComponent
  ]
})
export class StockMovementChartsModule { }
