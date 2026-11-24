/** GET /Admin/PreparedForInsertMenu: `rank` is the number the next menu will get. */
export interface AdminMenuPreparedInsert {
  id: number;
  rank: number;
  totalCount: number;
}
