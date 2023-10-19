import { ImageSignature } from './image-signature.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectiveModule } from 'src/directives/directive.module';

@NgModule({
  exports: [ImageSignature],
  imports: [CommonModule, DirectiveModule],
  declarations: [ImageSignature],
})
export class ImageSignatureModule {}
