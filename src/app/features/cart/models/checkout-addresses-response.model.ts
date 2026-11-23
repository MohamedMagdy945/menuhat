import { CheckoutAddress } from './checkout-address.model';

export interface CheckoutAddressesResponse {
  result: CheckoutAddress[];
  totalCount: number;
}
