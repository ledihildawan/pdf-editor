import { NgModule } from '@angular/core';
import { Drawing } from './drawing.component';
import { CommonModule } from '@angular/common';
import { DirectiveModule } from 'src/directives/directive.module';

@NgModule({
  exports: [Drawing],
  imports: [CommonModule, DirectiveModule],
  declarations: [Drawing],
})
export class DrawingModule {}
