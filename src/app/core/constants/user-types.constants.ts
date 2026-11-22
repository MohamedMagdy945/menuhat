/** Backend `userTypeId` values. */
export const USER_TYPES = {
  /** Restaurant owner (عميل). */
  owner: 1,
  /** Platform administrator — opens the admin panel (`/admin`). */
  admin: 2,
  /** Regular customer (عميل العميل). */
  customer: 3,
} as const;
