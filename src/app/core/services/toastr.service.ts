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
      timeOut: 6000,
      positionClass: 'toast-top-right',
      progressBar: true,
    });
  }
  // show info toast
  showInfo(message: string, title: string) {
    this.toastr.info(message, title, {
      timeOut: 6000,
      progressBar: true,
      positionClass: 'toast-top-right',
    });
  }

  // show warning toast
  showWarning(message: string, title: string) {
    this.toastr.warning(message, title);
  }
}
