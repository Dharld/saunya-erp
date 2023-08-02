import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
})
export class MobileMenuComponent implements OnInit {
  menuSize = 0;
  show = false;

  constructor() {}

  ngOnInit() {
    this.menuSize = +getComputedStyle(document.documentElement)
      .getPropertyValue('--navigation-menu-size')
      .replace('px', '');
  }

  toggleMenu() {
    this.show = !this.show;
    if (this.show) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }

  openMenu() {
    document.documentElement.style.setProperty(
      '--navigation-menu-translate',
      '0'
    );
    this.show = true;
  }

  closeMenu() {
    document.documentElement.style.setProperty(
      '--navigation-menu-translate',
      (-1 * this.menuSize).toString() + 'px'
    );
    this.show = false;
  }
}
