/**
 * Response of POST /MenusOrders and POST /MenusOrders/Order/{menuId}.
 * On failure the same shape comes back as the HTTP error body.
 */
export interface MenuOrderResponse {
  status: string;
  message: string;
  /** Names of the menus (restaurants) that could not accept the order. */
  invalidMenus: string[];
  invalidSerials: string[];
}
