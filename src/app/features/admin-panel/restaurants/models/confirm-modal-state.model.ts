/** What the confirm modal shows (snapshot of its inputs). */
export interface ConfirmModalState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  icon: string;
  variant: 'danger' | 'primary';
}
