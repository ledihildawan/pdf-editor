import { Component, OnInit } from '@angular/core';
import {
  readAsDataURL,
  readAsImage,
  readAsPDF,
} from 'src/utils/async-reader.util';
import { ggID } from 'src/utils/helper.util';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private genID = ggID();

  public pdfFile!: any;

  public pdfName: string = '';
  public pages: any = [];
  public pagesScale: any[] = [];
  public allObjects: any[] = [];
  public currentFont = 'Times-Roman';
  public focusId = null;
  public selectedPageIndex = -1;
  public saving = false;
  public addingDrawing = false;

  constructor() {}

  public async addPDF(file: any): Promise<any> {
    try {
      const pdf = await readAsPDF(file);
      const numPages = pdf.numPages;

      this.pages = Array(numPages)
        .fill(numPages)
        .map((_, i) => pdf.getPage(i + 1));
      this.pdfFile = file;
      this.pdfName = file.name;
      this.allObjects = this.pages.map(() => []);
      this.pagesScale = Array(numPages).fill(1);
    } catch (e) {
      console.log('Failed to add pdf.');
      throw e;
    }
  }

  public async addImage(file: any): Promise<any> {
    try {
      const id: number = this.genID();
      const url: any = await readAsDataURL(file);
      const img: any = await readAsImage(url);

      const { width, height } = img;

      const objectOptions = {
        id,
        file,
        width,
        height,
        x: 0,
        y: 0,
        type: 'image',
        payload: img,
      };

      this.allObjects = this.allObjects.map((objects, pIndex) =>
        pIndex === this.selectedPageIndex
          ? [...objects, objectOptions]
          : objects
      );
    } catch (e) {
      console.log(`Fail to add image.`, e);
    }
  }

  public deleteObject(objectId: number) {
    this.allObjects = this.allObjects.map((objects, pIndex) =>
      pIndex == this.selectedPageIndex
        ? objects.filter((object: any) => object.id !== objectId)
        : objects
    );
  }

  public updateObject(objectId: number, payload: any): void {
    console.log(payload);
    this.allObjects = this.allObjects.map((objects, pIndex) =>
      pIndex == this.selectedPageIndex
        ? objects.map((object: any) =>
            object.id === objectId ? { ...object, ...payload } : object
          )
        : objects
    );
  }

  public addDrawing(): void {
    if (this.selectedPageIndex >= 0) {
      this.addingDrawing = true;
    }
  }

  public onMeasure(scale: any, idx: number) {
    this.pagesScale[idx] = scale;
  }

  public onFinishDrawing({ originWidth, originHeight, path }: any): void {
    let scale = 1;

    if (originWidth > 500) {
      scale = 500 / originWidth;
    }

    this.onAddDrawing(originWidth, originHeight, path, scale);

    this.addingDrawing = false;
  }

  public onAddDrawing(
    originWidth: number,
    originHeight: number,
    path: string,
    scale = 1
  ): void {
    const object = {
      path,
      scale,
      originWidth,
      originHeight,
      x: 0,
      y: 0,
      id: this.genID(),
      type: 'drawing',
      width: originWidth * scale,
    };

    this.allObjects = this.allObjects.map((objects, pIndex) =>
      pIndex === this.selectedPageIndex ? [...objects, object] : objects
    );
  }

  public async onUploadPDF(event: any): Promise<any> {
    const files =
      event.target.files || (event.dataTransfer && event.dataTransfer.files);
    const file = files[0];

    if (!file || file.type !== 'application/pdf') {
      return;
    }

    this.selectedPageIndex = -1;

    try {
      await this.addPDF(file);

      this.selectedPageIndex = 0;
    } catch (e) {
      console.log(e);
    }
  }

  public async onUploadImage(event: any): Promise<any> {
    const file = event.target.files[0];

    if (file && this.selectedPageIndex >= 0) {
      this.addImage(file);
    }

    event.target.value = null;
  }

  public getStyleObjects(idx: number): object {
    return {
      'touch-action': 'none',
      transform: `scale(${this.pagesScale[idx]})`,
    };
  }

  public async ngOnInit(): Promise<void> {
    try {
      const res = await fetch('/assets/documents/c4611_sample_explain.pdf');
      const pdfBlob = await res.blob();

      await this.addPDF(pdfBlob);

      this.selectedPageIndex = 0;
    } catch (e) {
      console.log(e);
    }
  }
}
