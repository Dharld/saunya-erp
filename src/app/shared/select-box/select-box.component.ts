import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  AfterViewInit,
  EventEmitter,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select-box',
  templateUrl: './select-box.component.html',
  styleUrls: ['./select-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SelectBoxComponent,
    },
  ],
})
export class SelectBoxComponent
  implements OnInit, AfterViewInit, ControlValueAccessor
{
  showDropDown = false;

  readOnly = true;
  @Input() formControlInput = '';
  @Input() name = '';
  @Input() label = '';

  value: any = {
    text: '',
  };

  @Input() options: any[] = [];

  @Input() disabled = false;
  @Input() placeholder = '';

  @ViewChild('in') in!: ElementRef;

  onChange = (value: string) => {};

  onTouched = () => {};

  constructor(private renderer2: Renderer2) {}

  ngOnInit() {}

  ngAfterViewInit() {}

  select(option: any) {
    if (option) {
      this.onChange(option);
      this.value = option;
      this.closeDropdown();
    }
  }

  writeValue(value: any): void {
    this.value = value;
    /* if (!this.disabled && this.in && value) {
      console.log(this.in.nativeElement);
      console.log(value);
      this.renderer2.setAttribute(this.in.nativeElement, 'value', value.text);
    } */
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  openDropdown() {
    this.showDropDown = true;
  }
  closeDropdown() {
    this.showDropDown = false;
  }
}
