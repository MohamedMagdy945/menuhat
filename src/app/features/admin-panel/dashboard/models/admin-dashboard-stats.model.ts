/** GET /Admin/GetDashboardStats */
export interface AdminDashboardStats {
  subscribedMenusCount: number;
  expiredMenusCount: number;
  freeTrialMenusCount: number;
  usersCount: number;
  deliveryMenCount: number;
  newComplaintsCount: number;
  inProgressComplaintsCount: number;
  deletedMenusCount: number;
}
