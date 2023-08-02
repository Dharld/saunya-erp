import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MobileMenuComponent } from './shared/mobile-menu/mobile-menu.component';
import { MenuService } from './shared/menu-service.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild(MobileMenuComponent) menu!: MobileMenuComponent;

  constructor(private menuService: MenuService) {}

  ngAfterViewInit(): void {
    this.menuService.setMenu(this.menu);
  }
}
