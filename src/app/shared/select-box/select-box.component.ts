import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
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
export class SelectBoxComponent implements OnInit, ControlValueAccessor {
  showDropDown = false;

  readOnly = true;
  @Input() formControlInput = '';
  @Input() name = '';
  @Input() label = '';

  @Input() value!: string;
  @Input() options: string[] = [];

  @Input() disabled = false;
  @Input() placeholder = '';

  @ViewChild('in') in!: ElementRef;

  onChange = (value: string) => {};

  onTouched = () => {};

  constructor() {}

  ngOnInit() {}

  selectOption(option: string) {
    this.value = option;
    this.onChange(this.value);
    this.closeDropdown();
  }

  writeValue(value: any): void {
    if (!this.disabled) {
      if (this.in) {
        console.log(this.in);
      }
      this.value = value;
      this.onChange(this.value);
      this.selectOption(value);
    }
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
