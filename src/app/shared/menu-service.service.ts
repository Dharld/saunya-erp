import { Injectable, ViewChild } from '@angular/core';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  menu: MobileMenuComponent | undefined;

  constructor() {}

  setMenu(menu: MobileMenuComponent) {
    this.menu = menu;
  }

  toggleMenu() {
    this.menu?.toggleMenu();
  }

  openMenu() {
    this.menu?.openMenu();
  }

  closeMenu() {
    this.menu?.closeMenu();
  }
}
