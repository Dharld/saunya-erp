export interface OrderLine {
  id?: string;
  name: string;
  product_id: number;
  product_uom_qty: number;
  price_unit: number;
  taxes: string;
  discount?: number;
  description: string;
  devis_id?: string;
}
