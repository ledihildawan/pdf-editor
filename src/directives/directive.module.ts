import { NgModule } from '@angular/core';
import { PannableDirective } from './pannable.directive';

@NgModule({
  exports: [PannableDirective],
  imports: [],
  declarations: [PannableDirective],
})
export class DirectiveModule {}
