export interface Invoice {
  id: number | string;
  invoice_date?: string | boolean;
  invoice_date_due?: string | boolean;
  invoice_line_ids?: Array<number>;
  invoice_lines?: any[];
  invoice_payment_term_id?: boolean;
  name: string;
  partner_id?: [number, string];
  payment_state?: boolean;
  state?: string;
  amount_total_signed?: number;
}
