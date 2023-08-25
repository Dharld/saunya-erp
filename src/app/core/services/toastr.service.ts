import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  constructor(private toastr: ToastrService) {}
  // show success toast
  showSuccess(message: string, title: string) {
    this.toastr.success(message, title, {
      timeOut: 3000,
      positionClass: 'toast-top-right',
      progressBar: true,
    });
  }

  // show error toast
  showError(message: string, title: string) {
    this.toastr.error(message, title, {
      disableTimeOut: true,
      positionClass: 'toast-top-right',
    });
  }
  // show info toast
  showInfo(message: string, title: string) {
    this.toastr.info(message, title, {
      disableTimeOut: true,
      positionClass: 'toast-top-right',
    });
  }

  // show warning toast
  showWarning(message: string, title: string) {
    this.toastr.warning(message, title);
  }
}
