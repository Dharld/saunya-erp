import { Injectable } from '@angular/core';
import { ErrorHandler } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any) {}
}
