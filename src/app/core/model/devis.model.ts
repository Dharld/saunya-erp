import { fromJSDateToString } from 'src/utils/luxon';
import { OrderLine } from './order-line.model';

export class Devis {
  id?: string;
  state: string;
  created_at?: string;
  expiration_date?: string;
  payment_condition?: string;
  order_line?: any;
  order_lines?: any[];
  total?: number;
  displayName?: string;
  client_id?: number;
  payment_term_id?: number;

  constructor(public client_name: string, state: string = 'Devis') {
    this.client_name = client_name;
    this.state = state;
    this.created_at = fromJSDateToString(new Date(), 'dd-LL-yy');
  }

  // get total() {
  //   if (!this.order_lines) return;
  //   return this.order_lines.reduce((acc, ord_line) => {
  //     return acc + ord_line.quantity * ord_line.unitPrice;
  //   }, 0);
  // }

  static fromDevis(devis: Devis): Devis {
    const dev = new Devis(devis.client_name);
    return dev;
  }
}
