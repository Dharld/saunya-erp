import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Login } from '../model/login.model';
import { User } from '../model/user.model';
import { ApiResponse } from '../model/response.model';
import { NetworkService } from './network.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { NavigationService } from './navigation.service';
import { EncryptionService } from './encryption.service';
import '@capacitor-community/http';
import { Plugins } from '@capacitor/core';

const API_STORAGE_KEY = 'specialkey';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  servers = [];

  private server = new BehaviorSubject<any | null>(null);
  server$ = this.server.asObservable();
  user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();
  _storage: any;

  url = 'https://comptabilite.net-2s.com';

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private navigation: NavigationService,
    private encryption: EncryptionService
  ) {
    this.init();
    this.getLocalData('userData').then((data) => {
      this.user.next(data);
    });
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  getServer(server: string) {
    const formData = new FormData();
    formData.set('url', server);
    const checkServer$ = this.http.post<ApiResponse>(
      `${this.url}/api/check/server`,
      formData
    );
    return checkServer$.pipe(
      tap((res) => {
        if (res.success == 1) {
          this.server.next({
            servername: server,
            db: res.data.database,
          });
        }
      })
    );
  }

  login(credentials: Login) {
    const formData = new FormData();
    const { email: login, password, db } = credentials;
    const server = this.getCurrentServer();
    formData.set('login', login.trim());
    formData.set('password', password);
    formData.set('db', db.name.trim());
    const login$ = this.http
      .post<ApiResponse>(`${this.url}/api/auth`, formData)
      .pipe(
        tap((res) => {
          if (res.success == 1) {
            const userData = {
              ...res.data,
              server: server.servername,
              db: db.name,
              password: this.encryption.encrypt(password),
            };
            console.log(userData);
            this.setLocalData('userData', userData);
            this.user.next(userData);
            this.navigation.navigateTo(['/home']);
          } else {
            this.user.next(null);
          }
        })
      );
    return login$;
  }

  getCurrentUser() {
    return this.user.getValue();
  }

  getCurrentServer() {
    return this.server.getValue();
  }

  signout() {
    this.user.next(null);
    this.removeLocalData('userData');
  }

  public setLocalData(key: string, data: any) {
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data);
  }

  public async getLocalData(key: string) {
    const data = await this.storage.get(`${API_STORAGE_KEY}-${key}`);
    return data;
  }

  private async removeLocalData(key: string) {
    await this.storage.remove(`${API_STORAGE_KEY}-${key}`);
  }
}
