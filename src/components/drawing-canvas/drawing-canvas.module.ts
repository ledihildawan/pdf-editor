import { NgModule } from '@angular/core';
import { DrawingCanvas } from './drawing-canvas.component';
import { DirectiveModule } from 'src/directives/directive.module';

@NgModule({
  exports: [DrawingCanvas],
  imports: [DirectiveModule, DirectiveModule],
  declarations: [DrawingCanvas],
})
export class DrawingCanvasModule {}
