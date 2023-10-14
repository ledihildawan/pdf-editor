import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'drawing',
  styleUrls: ['./drawing.component.scss'],
  templateUrl: './drawing.component.html',
})
export class Drawing implements OnInit, AfterViewInit {
  @Input() x!: number;
  @Input() y!: number;
  @Input() path!: string;
  @Input() width!: number;
  @Input() originWidth!: number;
  @Input() originHeight!: number;

  @Input() pageScale = 1;

  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() update: EventEmitter<object> = new EventEmitter<object>();

  @ViewChild('drawingSVG') svg!: ElementRef<SVGElement>;

  public ratio!: number;

  public startX: any;
  public startY: any;

  public dx = 0;
  public dy = 0;
  public dw = 0;
  public direction = '';
  public operation = '';

  public render() {
    this.svg.nativeElement.setAttribute(
      'viewBox',
      `0 0 ${this.originWidth} ${this.originHeight}`
    );
  }

  public handlePanMove(event: any): void {
    const _dx = (event.x - this.startX) / this.pageScale;
    const _dy = (event.y - this.startY) / this.pageScale;

    if (this.operation === 'move') {
      this.dx = _dx;
      this.dy = _dy;
    } else if (this.operation === 'scale') {
      if (this.direction === 'left-top') {
        let d = Infinity;

        d = Math.min(_dx, _dy * this.ratio);

        this.dx = d;
        this.dw = -d;
        this.dy = d / this.ratio;

        console.log(d);
      }

      if (this.direction === 'right-bottom') {
        let d = -Infinity;

        d = Math.max(_dx, _dy * this.ratio);

        this.dw = d;
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
        scale: (this.width + this.dw) / this.originWidth,
      });

      this.dx = 0;
      this.dy = 0;
      this.dw = 0;
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

  public get operatorClasses(): object {
    return {
      'cursor-grabbing': this.operation === 'move',
      [this.operation]: !!this.operation,
    };
  }

  public get wrapperStyles(): object {
    return {
      width: `${this.width + this.dw}px`,
      height: `${(this.width + this.dw) / this.ratio}px`,
      transform: `translate(${this.x + this.dx}px, ${this.y + this.dy}px)`,
    };
  }

  public ngOnInit(): void {
    this.ratio = this.originWidth / this.originHeight;
  }

  public ngAfterViewInit(): void {
    this.render();
  }
}
