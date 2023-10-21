import {
  Input,
  OnInit,
  Output,
  Component,
  ViewChild,
  ElementRef,
  EventEmitter,
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
  Renderer2,
} from '@angular/core';
import { Fonts } from 'src/utils/font.util';
import { timeout } from 'src/utils/helper.util';

@Component({
  selector: 'text',
  styleUrls: ['./text.component.scss'],
  templateUrl: './text.component.html',
})
export class Text implements OnInit, AfterViewInit {
  @Input() public x!: number;
  @Input() public y!: number;
  @Input() public text!: string;
  @Input() public size!: number;
  @Input() public pageScale!: number;
  @Input() public fontFamily!: string;
  @Input() public lineHeight!: number;

  @Output() public delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() public update: EventEmitter<Object> = new EventEmitter<Object>();
  @Output() public selectFont: EventEmitter<Object> =
    new EventEmitter<Object>();

  @ViewChild('toolbar') toolbar!: ElementRef<HTMLElement>;
  @ViewChild('editable') editable!: ElementRef<HTMLElement>;

  public _size!: number;
  public _lineHeight!: number;
  public _fontFamily!: string;

  public startX!: number;
  public startY!: number;

  public dx: number = 0;
  public dy: number = 0;
  public families: any = Object.keys(Fonts);
  public operation: any = '';

  public get wrapperStyles(): Object {
    return {
      transform: `translate(${this.x + this.dx}px, ${this.y + this.dy}px)`,
    };
  }

  public get operationClasses(): Object {
    return {
      'cursor-grab': !this.operation,
      'cursor-grabbing': this.operation === 'move',
      editing: ['edit', 'tool'].includes(this.operation),
    };
  }

  public get editableStyles(): Object {
    return {
      'font-size': `${this._size}px`,
      'font-family': `${this._fontFamily}, serif`,
      'line-height': `${this._lineHeight}`,
      '-webkit-user-select': 'text',
    };
  }

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  public handlePanMove(event: any): void {
    this.dx = (event.x - this.startX) / this.pageScale;
    this.dy = (event.y - this.startY) / this.pageScale;
  }

  public handlePanEnd(): void {
    if (this.dx === 0 && this.dy === 0) {
      return this.editable.nativeElement.focus();
    }

    this.update.emit({
      x: this.x + this.dx,
      y: this.y + this.dy,
    });

    this.dx = 0;
    this.dy = 0;
    this.operation = '';
  }

  public handlePanStart(event: any): void {
    this.startX = event.x;
    this.startY = event.y;
    this.operation = 'move';
  }

  public onFocus(): void {
    this.operation = 'edit';
  }

  public async onBlur(): Promise<any> {
    if (this.operation !== 'edit' || this.operation === 'tool') {
      return;
    }

    this.editable.nativeElement.blur();
    this.sanitize();
    this.update.emit({
      lines: this.extractLines(),
      width: this.editable.nativeElement.clientWidth,
    });

    this.operation = '';

    this._renderer.removeChild(document.body, this.toolbar.nativeElement);
  }

  public async onPaste(event: Event): Promise<any> {
    event.preventDefault();

    const pastedText = (event as ClipboardEvent).clipboardData?.getData('text');

    document.execCommand('insertHTML', false, pastedText);

    await timeout();

    this.sanitize();
  }

  public onKeydown(e: any): void {
    const childNodes = Array.from(this.editable.nativeElement.childNodes);

    if (e.keyCode === 13) {
      e.preventDefault();

      const selection: any = window.getSelection();
      const focusNode = selection.focusNode;
      const focusOffset = selection.focusOffset;

      if (focusNode === this.editable.nativeElement) {
        this.editable.nativeElement.insertBefore(
          document.createElement('br'),
          childNodes[focusOffset]
        );
      } else if (focusNode instanceof HTMLBRElement) {
        this.editable.nativeElement.insertBefore(
          document.createElement('br'),
          focusNode
        );
      } else if (focusNode.textContent.length !== focusOffset) {
        document.execCommand('insertHTML', false, '<br>');
      } else {
        let br = focusNode.nextSibling;

        if (br) {
          this.editable.nativeElement.insertBefore(
            document.createElement('br'),
            br
          );
        } else {
          br = this.editable.nativeElement.appendChild(
            document.createElement('br')
          );
          br = this.editable.nativeElement.appendChild(
            document.createElement('br')
          );
        }

        selection.collapse(br, 0);
      }
    }
  }

  public onFocusTool(): void {
    this.operation = 'tool';
  }

  public async onBlurTool(): Promise<void> {
    if (this.operation !== 'tool' || this.operation === 'edit') {
      return;
    }

    this.update.emit({
      size: this._size,
      lines: this.extractLines(),
      fontFamily: this._fontFamily,
      lineHeight: this._lineHeight,
    });

    this.operation = '';
  }

  public sanitize(): void {
    let weirdNode;

    while (
      (weirdNode = Array.from(this.editable.nativeElement.childNodes).find(
        (node) => !['#text', 'BR'].includes(node.nodeName)
      ))
    ) {
      this.editable.nativeElement.removeChild(weirdNode);
    }
  }

  public onChangeFont(): void {
    this.selectFont.emit({ name: this._fontFamily });
  }

  public render(): void {
    this.editable.nativeElement.innerHTML = this.text;

    this.editable.nativeElement.focus();

    this._renderer.appendChild(document.body, this.toolbar.nativeElement);
  }

  public extractLines(): any {
    const nodes = this.editable.nativeElement.childNodes;
    const lines = [];

    let lineText = '';

    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];

      if (node.nodeName === 'BR') {
        lines.push(lineText);

        lineText = '';
      } else {
        lineText += node.textContent;
      }
    }

    lines.push(lineText);

    return lines;
  }

  public onDelete(): void {
    this._renderer.removeChild(document.body, this.toolbar.nativeElement);
    this.delete.emit();
  }

  public ngOnInit(): void {
    this._size = this.size;
    this._fontFamily = this.fontFamily;
    this._lineHeight = this.lineHeight;
  }

  public ngAfterViewInit(): void {
    this.render();
  }
}
