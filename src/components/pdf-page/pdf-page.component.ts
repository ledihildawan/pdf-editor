import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'pdf-page',
  templateUrl: './pdf-page.component.html',
})
export class PDFPage implements OnInit, AfterViewInit, OnDestroy {
  @Input() page!: any;
  @Input() width!: number;
  @Input() height!: number;

  @Output() measure: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('pdfPageCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  public mounted: any;
  public clientWidth: any;
  public listenerOnResize: any;

  constructor(private renderer: Renderer2) {}

  public async render(): Promise<void> {
    const _page: any = await this.page;

    const viewport = _page.getViewport({ scale: 1, rotation: 0 });
    const canvasContext = this.canvas.nativeElement.getContext('2d');

    this.width = viewport.width;
    this.height = viewport.height;

    await _page.render({ canvasContext, viewport }).promise;

    this.renderer.listen(window, 'resize', () => this.onMeasure());
  }

  public onMeasure(): void {
    this.measure.emit(this.canvas.nativeElement.clientWidth / this.width);
  }

  public ngOnInit(): void {}

  public ngAfterViewInit(): void {
    this.render();
  }

  public ngOnDestroy(): void {
    this.listenerOnResize();
  }
}
