import { Image } from './image.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectiveModule } from 'src/directives/directive.module';

@NgModule({
  exports: [Image],
  imports: [CommonModule, DirectiveModule],
  declarations: [Image],
})
export class ImageModule {}
