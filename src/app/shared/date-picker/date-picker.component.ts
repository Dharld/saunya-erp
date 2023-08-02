import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DateTime } from 'luxon';
import { Subscription, fromEvent } from 'rxjs';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: DatePickerComponent,
    },
  ],
})
export class DatePickerComponent
  implements OnInit, AfterViewInit, ControlValueAccessor, OnDestroy
{
  @Input() readOnly = false;
  @Input() formControlInput = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() value: string = '';
  @Input() type = 'text';
  @Input() textSupport = '';
  @Input() pending = false;
  @Input() disabled = false;
  @Input() currentDate = new Date();
  @Input() startDate = this.currentDate;

  monthHeader = this.format();
  today = this.startDate.getDate();

  showPicker = false;

  originalType = '';
  touched = false;

  @ViewChild('in') inputElement!: ElementRef;
  @ViewChild('datePickerBody') datePickerBody!: ElementRef;

  onChange = (value: any) => {};
  onTouched = () => {};

  sub1!: Subscription;
  sub2!: Subscription;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.generateDays();

    const clicks$ = fromEvent(
      this.datePickerBody.nativeElement as HTMLElement,
      'click'
    );

    this.sub1 = clicks$.subscribe((event) => {
      const target: HTMLDivElement = event.target as HTMLDivElement;
      if (!target.classList.contains('day')) return;
      this.today = +target.textContent!;
      this.value = DateTime.fromJSDate(
        new Date(
          this.currentDate.getFullYear(),
          this.currentDate.getMonth(),
          this.today
        )
      )
        .setLocale('fr')
        .toFormat('dd-MM-yyyy');
      this.inputElement.nativeElement.value = this.value;
      this.onChange(this.value);
      ///
      const activeElement = document.querySelector('.day.active');
      activeElement?.classList.remove('active');

      target.classList.add('active');

      this.showPicker = false;
    });
    this.sub2 = fromEvent(document, 'click').subscribe((event) => {
      const target = event.target as HTMLElement;
      const outsidePicker = target.closest('.dp');
      if (!outsidePicker) this.showPicker = false;
    });
  }

  nextMonth() {
    const dt = DateTime.fromJSDate(this.currentDate).plus({ month: 1 });
    this.currentDate = dt.toJSDate();
    this.monthHeader = this.format();
    this.emptyBody();
    this.generateDays();
  }

  previousMonth() {
    const dt = DateTime.fromJSDate(this.currentDate).minus({ month: 1 });
    this.currentDate = dt.toJSDate();
    this.monthHeader = this.format();
    this.emptyBody();
    this.generateDays();
  }

  writeValue(value: any): void {
    if (!this.disabled && value) {
      this.markAsTouched();
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

  private format() {
    const dt = DateTime.local(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1
    );
    return dt.setLocale('fr').toFormat('LLLL yyyy');
  }

  private emptyBody() {
    const parent = this.datePickerBody.nativeElement;
    parent.replaceChildren();
  }

  private generateDays() {
    const dt = DateTime.local(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1
    );
    const offset = dt.weekday;
    const numberOfDays = dt.daysInMonth;

    /** */
    this.generateFirstLine(offset);
    this.generateRest(2, offset, numberOfDays as number);
  }

  private generateFirstLine(offset: number) {
    let tracker = 1;
    this.addHTMLToBody(`
      <div class="week flex text-neutral text-body-xs text-center" data-week="0">
      </div>
      `);
    while (tracker < offset) {
      // weeks += '   ';
      this.addHTMLToWeek(0, `<div class="day"" data-empty='true'></div>`);
      tracker++;
    }
    this.addHTMLToWeek(
      0,
      `<div class="day ${this.today == 1 ? 'active' : ''}">1</div>`
    );
  }

  private generateRest(
    currentDay: number,
    offset: number,
    numberOfDays: number
  ) {
    while (currentDay <= numberOfDays) {
      const offsetRemoved = currentDay + offset - 1;
      const week = Math.floor(offsetRemoved / 7.1);
      if (offsetRemoved > 7 && offsetRemoved % 7 == 1) {
        if (week == 0) {
        } else
          this
            .addHTMLToBody(`<div class="week flex text-neutral text-body-xs text-center" data-week="${week}">
      </div>`);
      }
      this.addHTMLToWeek(
        week,
        `<div class="day ${
          this.today == currentDay ? 'active' : ''
        }">${currentDay.toString().padStart(3, ' ')}</div>`
      );
      currentDay++;
    }
  }

  private addHTMLToBody(html: string) {
    this.datePickerBody.nativeElement.insertAdjacentHTML('beforeend', html);
  }

  private addHTMLToWeek(week: number, html: string) {
    this.datePickerBody.nativeElement
      .querySelector(`.week[data-week='${week}']`)
      .insertAdjacentHTML('beforeend', html);
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
  }
}
