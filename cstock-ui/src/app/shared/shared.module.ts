import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { HasRolePipe } from '../pipes/has-role.pipe';



@NgModule({
  declarations: [
    MessageComponent,
    HasRolePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MessageComponent,
    HasRolePipe
  ]
})
export class SharedModule { }
