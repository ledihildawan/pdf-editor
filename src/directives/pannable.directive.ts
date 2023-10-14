import {
  Output,
  Directive,
  Renderer2,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
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

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

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

    this.listnereOnMouseup = this.renderer.listen(window, 'mouseup', (event) =>
      this.onMouseup(event)
    );
    this.listnerOnMousemove = this.renderer.listen(
      window,
      'mousemove',
      (event) => this.onMousemove(event)
    );
  }

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
    this.listenerOnMousedown = this.renderer.listen(
      this.elementRef.nativeElement,
      'mousedown',
      (event) => this.onMousedown(event)
    );
  }

  public ngOnDestroy(): void {
    this.listenerOnMousedown();
  }
}
