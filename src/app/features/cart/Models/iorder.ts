export type OrderStatus = 'all' | 'pending' | 'preparing' | 'delivering' | 'completed' | 'rejected';
export interface IOrder {
  id: string;
  restaurantName: string;
  imageUrl: string;
  date: string;
  time: string;
  status: Exclude<OrderStatus, 'all'>;
  statusText: string;
}

 