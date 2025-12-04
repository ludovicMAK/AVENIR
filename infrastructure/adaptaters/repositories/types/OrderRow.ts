export type OrderRow = {
  id: string;
  customer_id: string;
  share_id: string;
  direction: string;
  quantity: number;
  price_limit: number;
  validity: string;
  status: string;
  date_captured: Date;
  blocked_amount: number;
};
