import {
  Input,
  Output,
  ViewChild,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnChanges,
} from '@angular/core';

@Component({
  selector: 'image',
  styleUrls: ['./image.component.scss'],
  templateUrl: './image.component.html',
})
export class Image implements OnInit, OnChanges, AfterViewInit {
  @Input() x: any;
  @Input() y: any;
  @Input() file: any;
  @Input() width: any;
  @Input() height: any;
  @Input() payload: any;
  @Input() pageScale = 1;

  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() update: EventEmitter<object> = new EventEmitter<object>();

  @ViewChild('imageCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  public startX: any;
  public startY: any;

  public dh: number = 0;
  public dw: number = 0;
  public dx: number = 0;
  public dy: number = 0;
  public operation: string = '';
  public direction: string = '';

  public render(): void {
    const limit = 500;

    let scale = 1;

    this.canvas.nativeElement.width = this.width;
    this.canvas.nativeElement.height = this.height;

    this.canvas.nativeElement.getContext('2d')?.drawImage(this.payload, 0, 0);

    if (this.width > limit) {
      scale = limit / this.width;
    }

    if (this.height > limit) {
      scale = Math.min(scale, limit / this.height);
    }

    // this.update.emit({
    //   width: this.width * scale,
    //   height: this.height * scale,
    // });

    if (!['image/png'].includes(this.file.type)) {
      this.canvas.nativeElement.toBlob((blob) => {
        this.update.emit({ file: blob });
      });
    }
  }

  public handlePanMove(event: any): void {
    const _dx = (event.x - this.startX) / this.pageScale;
    const _dy = (event.y - this.startY) / this.pageScale;

    if (this.operation === 'move') {
      this.dx = _dx;
      this.dy = _dy;
    } else if (this.operation === 'scale') {
      if (this.direction.includes('left')) {
        this.dx = _dx;
        this.dw = -_dx;
      }

      if (this.direction.includes('top')) {
        this.dy = _dy;
        this.dh = -_dy;
      }

      if (this.direction.includes('right')) {
        this.dw = _dx;
      }

      if (this.direction.includes('bottom')) {
        this.dh = _dy;
      }
    }
  }

  public handlePanEnd(): void {
    if (this.operation === 'move') {
      this.update.emit({
        x: this.x + this.dx,
        y: this.y + this.dy,
      });

      this.dx = 0;
      this.dy = 0;
    } else if (this.operation === 'scale') {
      this.update.emit({
        x: this.x + this.dx,
        y: this.y + this.dy,
        width: this.width + this.dw,
        height: this.height + this.dh,
      });

      this.dx = 0;
      this.dy = 0;
      this.dw = 0;
      this.dh = 0;
      this.direction = '';
    }

    this.operation = '';
  }

  public handlePanStart(event: any): any {
    this.startX = event.x;
    this.startY = event.y;

    if (event.target === event.currentTarget) {
      return (this.operation = 'move');
    }

    this.operation = 'scale';
    this.direction = event.target.dataset.direction;
  }

  public onDelete(): void {
    this.delete.emit();
  }

  public get wrapperStyles(): object {
    return {
      width: `${this.width + this.dw}px`,
      height: `${this.height + this.dh}px`,
      transform: `translate(${this.x + this.dx}px, ${this.y + this.dy}px)`,
    };
  }

  public get operatorClasses(): object {
    return {
      'cursor-grabbing': this.operation === 'move',
      [this.operation]: !!this.operation,
    };
  }

  public ngOnInit(): void {}

  public ngOnChanges(): void {}

  public ngAfterViewInit(): void {
    this.render();
  }
}
