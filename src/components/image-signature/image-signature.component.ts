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
  DoCheck,
} from '@angular/core';

@Component({
  selector: 'image-signature',
  styleUrls: ['./image-signature.component.scss'],
  templateUrl: './image-signature.component.html',
})
export class ImageSignature
  implements OnInit, OnChanges, AfterViewInit, DoCheck
{
  @Input() x: any;
  @Input() y: any;
  @Input() file: any;
  @Input() width: any;
  @Input() height: any;
  @Input() payload: any;
  @Input() pageScale = 1;

  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() update: EventEmitter<object> = new EventEmitter<object>();

  public startX: any;
  public startY: any;

  public dh: number = 0;
  public dw: number = 0;
  public dx: number = 0;
  public dy: number = 0;
  public operation: string = '';
  public directions: any[] = [];

  public render(): void {
    const limit = 200;

    let scale = 1;

    if (this.width > limit) {
      scale = limit / this.width;
    }

    if (this.height > limit) {
      scale = Math.min(scale, limit / this.height);
    }

    // const ratio = Math.min(limit / this.width, limit / this.height);

    this.update.emit({
      width: this.width * scale,
      height: this.height * scale,
    });
  }

  public handlePanMove(event: any): void {
    const _dx = (event.x - this.startX) / this.pageScale;
    const _dy = (event.y - this.startY) / this.pageScale;

    if (this.operation === 'move') {
      this.dx = _dx;
      this.dy = _dy;
    } else if (this.operation === 'scale') {
      if (this.directions.includes('left')) {
        this.dx = _dx;
        this.dw = -_dx;
      }

      if (this.directions.includes('top')) {
        this.dy = _dy;
        this.dh = -_dy;
      }

      if (this.directions.includes('right')) {
        this.dw = _dx;
      }

      if (this.directions.includes('bottom')) {
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
      this.directions = [];
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
    this.directions = event.target.dataset.direction.split('-');
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

  public ngDoCheck(): void {}

  public ngAfterViewInit(): void {
    this.render();
  }
}