import { OrderLine } from "./order-line.model";

// export interface Devis {
//   id?: string;
//   client_name: string;
//   created_at?: Date;
//   state: string;
//   invoice_address?: string;
//   delivery_address?: string;
//   expiration_date?: Date;
//   payment_conditions?: string[];
//   order_lines?: OrderLine[];
// }

export class Devis {
  id?: string;
  state: string;
  created_at: Date;
  invoice_address?: string;
  delivery_address?: string;
  expiration_date?: Date;
  payment_conditions?: string[];
  order_lines?: OrderLine[];

  constructor(public client_name: string) {
    this.state = "Devis";
    this.created_at = new Date();
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
