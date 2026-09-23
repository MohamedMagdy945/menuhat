import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  private readonly PRIMARY_ICON_COLOR = '#ff6600';

  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    iconColor: this.PRIMARY_ICON_COLOR,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  showToast(title: string, icon: SweetAlertIcon = 'success'): void {
    this.Toast.fire({
      icon: icon,
      title: title
    });
  }

  showAlert(title: string = '', icon: SweetAlertIcon = 'info'): Promise<any> {
    return Swal.fire({
      title: title,
      icon: icon,
      iconColor: this.PRIMARY_ICON_COLOR, 
      confirmButtonText: 'Ok',
      confirmButtonColor: this.PRIMARY_ICON_COLOR
    });
  }

  // showSuccess(title: string): void {
  //   this.showAlert(title, 'success');
  // }

  // showError(title: string, icon: SweetAlertIcon): void {
  //   this.showAlert(title, icon);
  // }

  showConfirm(title: string, text: string, confirmBtnText: string = 'نعم، إستمرار'): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      iconColor: this.PRIMARY_ICON_COLOR,
      showCancelButton: true,
      confirmButtonColor: this.PRIMARY_ICON_COLOR,
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmBtnText,
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}