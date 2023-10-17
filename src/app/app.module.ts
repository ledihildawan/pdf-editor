import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PDFPageModule } from 'src/components/pdf-page/pdf-page.module';
import { HttpClientModule } from '@angular/common/http';
import { ImageModule } from 'src/components/image/image.module';
import { DrawingCanvasModule } from 'src/components/drawing-canvas/drawing-canvas.module';
import { DrawingModule } from 'src/components/drawing/drawing.module';
import { DirectiveModule } from 'src/directives/directive.module';

@NgModule({
  exports: [],
  imports: [
    FormsModule,
    ImageModule,
    CommonModule,
    BrowserModule,
    DrawingModule,
    PDFPageModule,
    DirectiveModule,
    HttpClientModule,
    DrawingCanvasModule,
  ],
  bootstrap: [AppComponent],
  providers: [],
  declarations: [AppComponent],
})
export class AppModule {}
