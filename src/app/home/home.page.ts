import { Component, ViewChild } from '@angular/core';
import { MenuService } from '../shared/menu-service.service';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  user$ = this.api.user$;

  constructor(private menuService: MenuService, private api: ApiService) {}

  openMenu() {
    this.menuService.openMenu();
  }
  toggleMenu() {
    this.menuService.toggleMenu();
  }
}
