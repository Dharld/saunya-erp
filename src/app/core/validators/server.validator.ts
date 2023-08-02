import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServerValidator implements AsyncValidator {
  constructor(private api: ApiService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.api.getServer(control.value).pipe(
      map((server: any) => {
        return server.success == 1 ? null : { serverInexistant: true };
      }),
      catchError((err) => of(err))
    );
  }
}
