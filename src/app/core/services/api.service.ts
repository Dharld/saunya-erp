import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Login } from '../model/login.model';
import { User } from '../model/user.model';
import { ApiResponse } from '../model/response.model';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  servers = [];

  private server = new BehaviorSubject<any | null>(null);
  server$ = this.server.asObservable();
  private user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();

  url = '';

  constructor(private http: HttpClient) {}

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
    console.log(credentials);
    const formData = new FormData();
    const { email: login, password, db } = credentials;
    formData.set('login', login);
    formData.set('password', password);
    formData.set('db', db);
    const login$ = this.http
      .post<ApiResponse>(`${this.url}/api/auth`, formData)
      .pipe(
        tap((res) => {
          if (res.success == 1) this.user.next(res.data);
          else {
            this.user.next(null);
          }
        })
      );
    return login$;
  }
}
