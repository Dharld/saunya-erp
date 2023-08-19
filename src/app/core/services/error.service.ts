import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  getClientMessage(err: Error) {
    if (!navigator.onLine) {
      return 'No Internet Connection';
    }
    return err.message ? err.message : err.toString();
  }
  getClientStack(error: Error): string {
    return error.stack!;
  }

  getServerMessage(error: HttpErrorResponse): string {
    return error.message;
  }

  getServerStack(error: HttpErrorResponse): string {
    // handle stack trace
    return 'stack';
  }
}
