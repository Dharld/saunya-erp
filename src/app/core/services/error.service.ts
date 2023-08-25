import { ErrorHandler, Inject, Injectable, Injector } from '@angular/core';
import { ToasterService } from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  constructor(@Inject(Injector) private readonly injector: Injector) {}

  private get toaster() {
    return this.injector.get(ToasterService);
  }

  handleError(error: any): void {
    if (error.reason) {
      console.error(error.reason);
    } else {
      console.error(error);
    }

    this.toaster.showError(error, 'Error');
  }
}
