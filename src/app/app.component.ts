import { Component, OnInit } from '@angular/core';
import {
  readAsDataURL,
  readAsImage,
  readAsPDF,
} from 'src/utils/async-reader.util';
import { ggID } from 'src/utils/helper.util';
import { save } from 'src/utils/pdf.util';
import { ajax } from 'rxjs/ajax';
import { forkJoin } from 'rxjs';

const endpointURL = 'http://192.168.1.10:8080/nuxeo';
const headerOptions = {
  Authorization: `Basic ${btoa('Administrator:Administrator')}`,
};

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
  public batchId: string = '';
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

  public async onSavePDF(): Promise<any> {
    if (!this.pdfFile || this.saving || !this.pages.length) {
      return;
    }

    this.saving = true;

    try {
      const res: number[] = await save(
        this.pdfFile,
        this.allObjects,
        this.pdfName
      );

      console.log(btoa(String.fromCharCode(...new Uint8Array(res))));

      const test = forkJoin({
        uploadDocument: ajax({
          method: 'POST',
          url: `${endpointURL}/api/v1/upload/${this.batchId}/0`,
          headers: {
            ...headerOptions,
            Accept: 'application/octet-stream',
            'Content-Type': 'application/octet-stream',
          },
          body: res,
        }),
        saveDocument: ajax({
          method: 'PUT',
          url: `${endpointURL}/api/v1/id/c77a9e52-789a-4a55-9fc7-d2527ac7598d`,
          headers: {
            ...headerOptions,
            'X-NXproperties': '*',
          },
          body: {
            'entity-type': 'document',
            repository: 'default',
            properties: {
              'file:content': {
                'upload-batch': this.batchId,
                'upload-fileId': '0',
              },
            },
          },
        }),
      });

      test.subscribe({
        next: (val) => {
          console.log(val);
        },
      });
    } catch (e) {
      console.log(e);
    } finally {
      this.saving = false;
    }
  }

  public getStyleObjects(idx: number): object {
    return {
      'touch-action': 'none',
      transform: `scale(${this.pagesScale[idx]})`,
    };
  }

  public async ngOnInit(): Promise<void> {
    const res = forkJoin({
      batchId: ajax.post(
        `${endpointURL}/site/api/v1/upload`,
        null,
        headerOptions
      ),
      documentInfo: ajax.get(
        `${endpointURL}/api/v1/id/c77a9e52-789a-4a55-9fc7-d2527ac7598d`,
        headerOptions
      ),
      documentFile: ajax({
        url: `${endpointURL}/api/v1/id/c77a9e52-789a-4a55-9fc7-d2527ac7598d/@blob/file:content`,
        // url: `http://localhost:4200/assets/documents/sample.pdf`,
        headers: headerOptions,
        responseType: 'blob',
      }),
    });

    res.subscribe({
      next: async (value) => {
        const data: {
          batchId: string;
          documentInfo: any;
          documentFile: any;
        } = {
          batchId: (value.batchId.response as { batchId: string }).batchId,
          documentInfo: value.documentInfo.response,
          documentFile: value.documentFile.response,
        };

        this.batchId = data.batchId;

        await this.addPDF(data.documentFile);

        this.selectedPageIndex = 0;
      },
    });
  }
}
