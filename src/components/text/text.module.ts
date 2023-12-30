import { Text } from './text.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DirectiveModule } from 'src/directives/directive.module';

@NgModule({
  exports: [Text],
  imports: [FormsModule, CommonModule, DirectiveModule],
  declarations: [Text],
})
export class TextModule {}
