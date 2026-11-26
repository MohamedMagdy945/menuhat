/** What the confirm modal shows (snapshot of its inputs). */
export interface ConfirmModalState {
  open: boolean;
  title: string;
  message: string;
  /** Name of the item the action targets, shown in its own box. */
  subject: string;
  subjectIcon: string;
  confirmText: string;
  cancelText: string;
  icon: string;
  variant: 'danger' | 'primary';
}
