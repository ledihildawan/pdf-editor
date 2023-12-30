import { NgModule } from '@angular/core';
import { TapoutDirective } from './tapout.directive';
import { PannableDirective } from './pannable.directive';

@NgModule({
  exports: [TapoutDirective, PannableDirective],
  imports: [],
  declarations: [TapoutDirective, PannableDirective],
})
export class DirectiveModule {}
