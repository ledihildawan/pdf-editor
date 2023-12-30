import {
  OnInit,
  Output,
  Directive,
  OnDestroy,
  Renderer2,
  ElementRef,
  EventEmitter,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[appPannable]',
})
export class PannableDirective implements OnInit, OnDestroy {
  public listnereOnMouseup!: Function;
  public listnerOnMousemove!: Function;
  public listenerOnMousedown!: Function;

  public x: number = 0;
  public y: number = 0;

  @Output() panend: EventEmitter<any> = new EventEmitter<any>();
  @Output() panmove: EventEmitter<any> = new EventEmitter<any>();
  @Output() panstart: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {}

  @HostListener('mousedown', ['$event'])
  public onMousedown(event: MouseEvent): void {
    this.x = event.clientX;
    this.y = event.clientY;

    this.panstart.emit({
      x: this.x,
      y: this.y,
      target: event.target,
      currentTarget: event.currentTarget,
    });

    this.listnereOnMouseup = this._renderer.listen(window, 'mouseup', (event) =>
      this.onMouseup(event)
    );
    this.listnerOnMousemove = this._renderer.listen(
      window,
      'mousemove',
      (event) => this.onMousemove(event)
    );
  }

  @HostListener('mousemove', ['$event'])
  public onMousemove(event: MouseEvent): void {
    const dx = event.clientX - this.x;
    const dy = event.clientY - this.y;

    this.x = event.clientX;
    this.y = event.clientY;

    this.panmove.emit({
      dx,
      dy,
      x: this.x,
      y: this.y,
    });
  }

  @HostListener('mouseup', ['$event'])
  public onMouseup(event: MouseEvent): void {
    this.x = event.clientX;
    this.y = event.clientY;

    this.panend.emit({
      x: this.x,
      y: this.y,
    });

    this.listnereOnMouseup();
    this.listnerOnMousemove();
  }

  public ngOnInit(): void {
    this.listenerOnMousedown = this._renderer.listen(
      this._elementRef.nativeElement,
      'mousedown',
      (event) => this.onMousedown(event)
    );
  }

  public ngOnDestroy(): void {
    this.listenerOnMousedown();
  }
}
