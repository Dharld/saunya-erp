import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Login } from 'src/app/core/model/login.model';
import { ApiService } from 'src/app/core/services/api.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  server$!: Observable<any | null>;
  loading = false;
  dbs: Array<string> = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toaster: ToasterService,
    private navigationService: NavigationService
  ) {
    this.server$ = this.api.server$;
    this.server$.subscribe((data) => {
      this.dbs = data.db.map((db: string) => ({ text: db, name: db }));
    });

    this.loginForm = this.fb.group({
      email: ['', Validators.email],
      password: [''],
      db: [this.dbs[0], Validators.required],
    });
  }

  ngOnInit() {}

  login() {
    this.loading = true;
    const credentials: Login = this.loginForm.value;
    const login$ = this.api.login(credentials);

    login$.subscribe((res) => {
      this.loading = false;
      if (res.success === 0) {
        this.toaster.showError(
          'The credentials provided are not valid',
          'Invalid credentials'
        );
      }
      /* if (res.success == 1) {
        this.navigationService.navigateTo(['../../home'], this.route);
      } else {
        this.errorMessage = (res as any).message;
      } */
    });
  }

  goBack() {
    this.navigationService.goBack();
  }
}
