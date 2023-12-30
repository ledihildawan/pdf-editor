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
  selector: '[appTapout]',
})
export class TapoutDirective implements OnInit, OnDestroy {
  @Output() tapout: EventEmitter<any> = new EventEmitter<any>();

  private _listenerOnMousedown!: Function;
  private _listenerOnTouchstart!: Function;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {}

  @HostListener('touchstart', ['$event'])
  public onTouchstart(event: any): void {
    if (
      !Array.from(event.touches).some((touch: any) =>
        this._elementRef.nativeElement.contains(touch.target)
      )
    ) {
      this.tapout.emit();
    }
  }

  @HostListener('mousedown', ['$event'])
  public onMousedown(event: any): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.tapout.emit();
    }
  }

  public ngOnInit(): void {
    this._listenerOnMousedown = this._renderer.listen(
      window,
      'mousedown',
      (event) => this.onMousedown(event)
    );
    this._listenerOnTouchstart = this._renderer.listen(
      window,
      'touchstart',
      (event) => this.onTouchstart(event)
    );
  }

  public ngOnDestroy(): void {
    this._listenerOnMousedown();
    this._listenerOnTouchstart();
  }
}
