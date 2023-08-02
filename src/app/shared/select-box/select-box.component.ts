import { Component, Input, OnInit } from '@angular/core';
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
  @Input() readOnly = false;
  @Input() formControlInput = '';
  @Input() name = '';
  @Input() label = '';

  @Input() options: string[] = [];
  @Input() selected = '';

  @Input() disabled = false;
  @Input() placeholder = '';

  onChange = (value: string) => {};

  onTouched = () => {};

  constructor() {}

  ngOnInit() {
    this.selected = this.options[0];
    this.set(this.selected);
  }

  writeValue(value: any): void {
    if (!this.disabled) {
      this.selected = value;
      this.onChange(this.selected);
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

  set(value: string) {
    this.onTouched();
    this.onChange(value);
    this.writeValue(value);
  }

  setValue(e: EventTarget | null) {
    const value = (e as HTMLSelectElement).value;
    this.set(value);
  }
}
