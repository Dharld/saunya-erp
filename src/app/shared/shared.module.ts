import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputBoxComponent } from './input-box/input-box.component';
import { ButtonComponent } from './button/button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';
import { SelectBoxComponent } from './select-box/select-box.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { IonicModule } from '@ionic/angular';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { ModalComponent } from './modal/modal.component';
import { SpinnerComponent } from './spinner/spinner.component';

@NgModule({
  declarations: [
    InputBoxComponent,
    SelectBoxComponent,
    ButtonComponent,
    MobileMenuComponent,
    SearchbarComponent,
    DatePickerComponent,
    ModalComponent,
    SpinnerComponent,
  ],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [
    InputBoxComponent,
    SelectBoxComponent,
    ButtonComponent,
    MobileMenuComponent,
    SearchbarComponent,
    DatePickerComponent,
    ModalComponent,
    SpinnerComponent,
  ],
})
export class SharedModule {}
