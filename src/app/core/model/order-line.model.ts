export interface OrderLine {
  id?: string;
  product: string;
  product_id: number;
  quantity: number;
  unitPrice: number;
  taxes: string;
  discount?: number;
  description: string;
  devis_id?: string;
}
