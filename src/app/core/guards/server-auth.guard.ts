import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class ServerAuthGuard implements CanActivate {
  constructor(
    private storage: Storage,
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute
  ) {
    this.storage.create();
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.api.getLocalData('userData').then((data) => {
      if (data) {
        this.navigation.navigateTo(['/home']);
        return true;
      }
      return true;
    });
  }
}
