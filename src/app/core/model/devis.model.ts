import { fromJSDateToString } from "src/utils/luxon";
import { OrderLine } from "./order-line.model";

export class Devis {
  id?: string;
  state: string;
  created_at: string;
  invoice_address?: string;
  delivery_address?: string;
  expiration_date?: string;
  payment_condition?: string;
  order_lines?: OrderLine[];

  constructor(public client_name: string, state: string = "Devis") {
    this.state = state;
    this.created_at = fromJSDateToString(new Date(), "dd-LL-yy");
  }

  get total() {
    if (!this.order_lines) return;
    return this.order_lines.reduce((acc, ord_line) => {
      return acc + ord_line.quantity * ord_line.unitPrice;
    }, 0);
  }

  static fromDevis(devis: Devis): Devis {
    const dev = new Devis(devis.client_name);
    return dev;
  }
}
