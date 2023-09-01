import { Component, ViewChild } from '@angular/core';
import { MenuService } from '../shared/menu-service.service';
import { ApiService } from '../core/services/api.service';
import { NavigationService } from '../core/services/navigation.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  user$ = this.api.user$;
  user: any;

  constructor(
    private menuService: MenuService,
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute
  ) {
    this.user$.subscribe((data) => {
      this.user = data;
    });
  }

  openMenu() {
    this.menuService.openMenu();
  }
  toggleMenu() {
    this.menuService.toggleMenu();
  }

  goTo(location: string) {
    this.navigation.navigateTo([`/${location}`]);
  }

  signOut() {
    this.navigation.navigateTo(['/auth/login'], this.route);
    this.api.signout();
  }
}
