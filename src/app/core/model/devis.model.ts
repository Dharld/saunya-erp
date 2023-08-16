import { fromJSDateToString } from 'src/utils/luxon';
import { OrderLine } from './order-line.model';

type NameAndId = {
  id: number;
  name: string;
};
export class Devis {
  id?: string;
  state: string;
  created_at?: string;
  client?: NameAndId;
  expiration_date?: string;
  payment_condition?: NameAndId;
  order_line?: any;
  order_lines?: any[];
  total?: number;
  displayName?: string;

  constructor(state: string = 'Devis') {
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
    const dev = new Devis();
    return dev;
  }
}
