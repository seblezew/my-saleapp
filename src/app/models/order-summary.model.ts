export interface OrderSummary {
  id: string | number;
  customerName?: string;
  orderDate: Date | string;
  totalAmount: number;
  status: string;
}
