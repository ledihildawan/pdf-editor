import {
  Output,
  Component,
  ViewChild,
  ElementRef,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
})
export class DrawingCanvas {
  @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
  @Output() finish: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('drawingCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  public x = 0;
  public y = 0;
  public path = '';
  public minX = Infinity;
  public maxX = 0;
  public minY = Infinity;
  public maxY = 0;
  public paths: any[] = [];
  public drawing = false;

  public onCancel(): void {
    this.cancel.emit();
  }

  public onFinish(): void {
    if (!this.paths.length) {
      return;
    }

    const dx = -(this.minX - 10);
    const dy = -(this.minY - 10);
    const width = this.maxX - this.minX + 20;
    const height = this.maxY - this.minY + 20;

    this.finish.emit({
      path: this.paths.reduce((acc, cur) => {
        return acc + cur[0] + (cur[1] + dx) + ',' + (cur[2] + dy);
      }, ''),
      originWidth: width,
      originHeight: height,
    });
  }

  public handlePanStart(event: any): any {
    if (event.target !== this.canvas.nativeElement) {
      return (this.drawing = false);
    }

    this.drawing = true;
    this.x = event.x;
    this.y = event.y;
    this.minX = Math.min(this.minX, this.x);
    this.maxX = Math.max(this.maxX, this.x);
    this.minY = Math.min(this.minY, this.y);
    this.maxY = Math.max(this.maxY, this.y);

    this.paths.push(['M', this.x, this.y]);

    this.path += `M${this.x},${this.y}`;
  }

  public handlePanMove(event: any): void {
    if (!this.drawing) {
      return;
    }

    this.x = event.x;
    this.y = event.y;
    this.minX = Math.min(this.minX, this.x);
    this.maxX = Math.max(this.maxX, this.x);
    this.minY = Math.min(this.minY, this.y);
    this.maxY = Math.max(this.maxY, this.y);

    this.paths.push(['L', this.x, this.y]);

    this.path += `L${this.x},${this.y}`;
  }

  public handlePanEnd(): void {
    this.drawing = false;
  }
}
