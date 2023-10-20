import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageModule } from 'src/components/image/image.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { PDFPageModule } from 'src/components/pdf-page/pdf-page.module';
import { DrawingModule } from 'src/components/drawing/drawing.module';
import { HttpClientModule } from '@angular/common/http';
import { DrawingCanvasModule } from 'src/components/drawing-canvas/drawing-canvas.module';

@NgModule({
  exports: [],
  imports: [
    FormsModule,
    ImageModule,
    CommonModule,
    BrowserModule,
    DrawingModule,
    PDFPageModule,
    HttpClientModule,
    DrawingCanvasModule,
  ],
  bootstrap: [AppComponent],
  providers: [],
  declarations: [AppComponent],
})
export class AppModule {}
