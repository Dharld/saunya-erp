export interface OrderLine {
  id?: string;
  product: string;
  quantity: number;
  unitPrice: number;
  taxes: string;
  discount?: number;
  description: string;
  devis_id?: string;
}
