import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  Form,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'app-input-box',
  templateUrl: './input-box.component.html',
  styleUrls: ['./input-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputBoxComponent,
    },
  ],
})
export class InputBoxComponent implements OnInit, ControlValueAccessor {
  @Input() readOnly = false;
  @Input() formControlInput = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() value: string | null = '';
  @Input() type = 'text';
  @Input() textSupport = '';
  @Input() pending = false;
  originalType = '';

  @ViewChild('in') in!: ElementRef;

  onChange = (value: any) => {};

  onTouched = () => {};

  @Input() disabled = false;

  touched = false;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  ngOnInit(): void {}

  writeValue(value: any): void {
    if (!this.disabled && this.readOnly != true) {
      this.markAsTouched();
      this.renderer.setProperty(
        this.elementRef.nativeElement.childNodes[0].childNodes[1],
        'value',
        value
      );
      this.onChange(value);
    }
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleType() {
    this.type = this.type == 'password' ? 'text' : 'password';
  }
}
