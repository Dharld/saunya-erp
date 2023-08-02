import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { ApiService } from './services/api.service';
import { NavigationService } from './services/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class ServerGuard implements CanActivate {
  server: any = null;

  constructor(
    private api: ApiService,
    private navigationService: NavigationService,
    private route: ActivatedRoute
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const server$ = this.api.server$;
    server$.subscribe((data) => (this.server = data));
    if (this.server) {
      return true;
    } else {
      this.navigationService.navigateTo(['auth/log-with-server']);
      return false;
    }
  }
}
