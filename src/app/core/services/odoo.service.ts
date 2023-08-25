import { Injectable } from '@angular/core';
import Odoo from 'odoo-xmlrpc';
import { Devis } from '../model/devis.model';
import { Customer } from '../model/customer.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { OdooError } from '../error-handling/odoo-error';

const LIMIT_ACCOUNT = 30;

@Injectable({
  providedIn: 'root',
})
export class OdooService {
  odoo: any;

  constructor(private http: HttpClient) {
    this.odoo = new Odoo({
      url: 'https://comptabilite.net-2s.com',
      db: 'comptabilite.net-2s.com',
      username: 'info@net-2s.com',
      password: '200?skfb',
    });
  }

  login() {}

  getInvoiceLine(invoice: any) {
    const odoo = this.odoo;
    const promiseArr = invoice.invoice_line_ids.map((line_id: any) => {
      return new Promise<any>((res, rej) => {
        odoo.connect(function (err: any) {
          if (err) {
            return console.log(err);
          }
          let inParams: any[] = [];
          inParams.push([['id', '=', line_id]]);
          inParams.push(['partner_id', 'account_id', 'quantity', 'product_id']);
          let params = [];
          params.push(inParams);
          odoo.execute_kw(
            'account.move.line',
            'search_read',
            params,
            function (err: any, value: any) {
              if (err) {
                return console.log(err);
              }
              if (value) {
                return res(value);
              }
              throw new Error('No value');
            }
          );
        });
      });
    });
    return Promise.all(promiseArr);
  }

  getInvoiceLineIds(invoice_id: number) {
    const odoo = this.odoo;
    return new Promise<any>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        let inParams: any[] = [];
        inParams.push([invoice_id]);
        inParams.push(['invoice_line_ids']);
        let params = [];
        params.push(inParams);
        odoo.execute_kw(
          'account.move',
          'read',
          params,
          function (err: any, value: any) {
            if (err) {
              return console.log(err);
            }
            if (value) {
              return res(value);
            }
            throw new Error('No value');
          }
        );
      });
    }).then((data) => data[0].invoice_line_ids);
  }

  getOrderline(order_line_id: number) {
    const odoo = this.odoo;
    return new Promise<any>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        let inParams: any[] = [];
        inParams.push([order_line_id]);
        inParams.push([
          'name',
          'product_id',
          'price_unit',
          'product_uom_qty',
          'order_id',
        ]);
        let params = [];
        params.push(inParams);
        odoo.execute_kw(
          'sale.order.line',
          'read',
          params,
          function (err: any, value: any) {
            if (err) {
              return console.log(err);
            }
            if (value) {
              return res(value);
            }
            throw new Error('No value');
          }
        );
      });
    });
  }

  getItems<T>(model: string, fields: string[], offset = -1, limit = -1) {
    let odoo = this.odoo;

    return new Promise<T[]>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        console.log('Connected to Odoo server.');
        let inParams: any[] = [];
        inParams.push([]);
        inParams.push(fields);
        if (offset >= 0) {
          inParams.push(offset);
        }
        if (limit >= 0) {
          inParams.push(limit);
        }
        let params = [];
        params.push(inParams);

        odoo.execute_kw(
          model,
          'search_read',
          params,
          function (err: any, value: any) {
            if (err) {
              return console.log(err);
            }
            res(value);
          }
        );
      });
    });
  }
  getItemsWithDomain<T>(
    model: string,
    domain: any[],
    fields: string[]
  ): Promise<T[]> {
    let odoo = this.odoo;

    return new Promise<T[]>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        console.log('Connected to Odoo server.');
        let inParams: any[] = [];
        inParams.push(domain);
        inParams.push(fields);
        let params = [];
        params.push(inParams);

        odoo.execute_kw(
          model,
          'search_read',
          params,
          function (err: any, value: any) {
            if (err) {
              return console.log(err);
            }
            res(value);
          }
        );
      });
    });
  }

  getCustomers(): Promise<Customer[]> {
    return this.getItems<Customer>('res.partner', ['name', 'email']);
  }

  getJournals(): Promise<any[]> {
    return this.getItems<any>('account.journal', ['name']);
  }

  getPaymentTerms() {
    return this.getItems<any>('account.payment.term', ['name']);
  }

  getDevis(name = '', partner_id: number = -1) {
    let odoo = this.odoo;
    const that = this;
    let devis: Devis[];

    return new Promise<any[]>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          throw err;
        }
        console.log('Connected to Odoo server.');
        let inParams: any[] = [];
        let domain: [string, string, number | string][] = [
          ['name', 'ilike', name],
          ['state', '=', 'draft'],
        ];
        if (partner_id > 0) {
          domain.push(['partner_id', '=', partner_id]);
        }
        inParams.push(domain);
        inParams.push([
          'partner_id',
          'name',
          'amount_total',
          'date_order',
          'state',
          'payment_term_id',
          'order_line',
          'validity_date',
        ]);
        let params = [];
        params.push(inParams);

        odoo.execute_kw(
          'sale.order',
          'search_read',
          params,
          async function (err: Error, value: any) {
            if (err) {
              rej(that.throwBadQuery(err));
            }
            devis = value;

            res(devis);
          }
        );
      });
    });
  }

  getCommandes(name = '', partner_id: number = -1) {
    let odoo = this.odoo;
    const that = this;
    let devis: Devis[];

    return new Promise<any[]>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        console.log('Connected to Odoo server.');
        let inParams: any[] = [];
        let domain: [string, string, number | string][] = [
          ['name', 'ilike', name],
          ['state', '=', 'sale'],
        ];
        if (partner_id > 0) {
          domain.push(['partner_id', '=', partner_id]);
        }
        inParams.push(domain);
        inParams.push([
          'partner_id',
          'name',
          'amount_total',
          'date_order',
          'state',
          'payment_term_id',
          'order_line',
          'validity_date',
        ]);
        let params = [];
        params.push(inParams);

        odoo.execute_kw(
          'sale.order',
          'search_read',
          params,
          async function (err: any, value: any) {
            if (err) {
              return console.log(err);
            }
            devis = value;

            /* for (let i = 0; i < devis.length; i++) {
              const d: any = devis[i];
              const sc = d.order_line[0];
              if (sc) {
                const orderline: any = await that.getOrderline(sc);
                d.order_lines = [];
                d.order_lines = orderline;
              }
            } */
            res(devis);
          }
        );
      });
    });
  }

  getInvoices(name = '', partner_id: number = -1) {
    let odoo = this.odoo;

    return new Promise<any[]>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        console.log('Connected to Odoo server.');
        let inParams: any[] = [];
        let domain: [string, string, number | string][] = [
          ['name', 'ilike', name],
          ['move_type', '=', 'out_invoice'],
        ];
        if (partner_id > 0) {
          domain.push(['partner_id', '=', partner_id]);
        }
        inParams.push(domain);
        inParams.push([
          'name',
          'partner_id',
          'invoice_date',
          'invoice_payment_term_id',
          'invoice_line_ids',
          'invoice_date',
          'invoice_date_due',
          'state',
          'payment_state',
          'amount_total_signed',
          'payment_reference',
          'journal_id',
        ]);
        let params = [];
        params.push(inParams);

        odoo.execute_kw(
          'account.move',
          'search_read',
          params,
          async function (err: any, value: any) {
            if (err) {
              return console.log(err);
            }

            res(value);
          }
        );
      });
    });
  }

  getAccounts(page: number = 1) {
    const skip = (page - 1) * LIMIT_ACCOUNT;
    return this.getItems<any>('account.account', ['name'], skip, LIMIT_ACCOUNT);
  }

  getProducts() {
    return this.getItems<any>('product.product', [
      'name',
      'lst_price',
      'taxes_id',
    ]);
  }

  getTaxes() {
    return this.getItems<any>('account.tax', ['name']);
  }

  createDevis(devis: Devis) {
    const orderline = devis.order_lines?.map(
      ({ product_id, product_uom_qty: qty }) => ({
        product_id,
        qty,
      })
    );

    const formData = new FormData();
    formData.append('uid', '2'); // To modify with the uid of the active user
    formData.append('customer_id', `${devis.client?.id}`);
    formData.append('payment_term_id', `${devis.payment_condition?.id}`);
    formData.append('order_line', JSON.stringify(orderline));

    return this.http.post('api/create/quotation', formData);
  }

  createInvoice(invoiceData: any): Observable<any> {
    const {
      client: { id: clientId },
      facturationDate,
      journal: { id: journal_id },
      lastDate,
      refpayment,
    } = invoiceData;

    const formData = new FormData();
    formData.append('uid', '2');
    formData.append('customer_id', clientId);
    formData.append('payment_reference', refpayment);
    formData.append('invoice_date', facturationDate);
    formData.append('invoice_date_due', lastDate);
    formData.append('journal_id', journal_id);
    if (invoiceData.invoice_lines) {
      const invoice_lines = invoiceData.invoice_lines.map((line: any) => ({
        product_id: line.product.id,
        account_id: line.account.id,
        qty: line.quantity,
      }));
      console.log(invoice_lines);
      formData.append('invoice_line_ids', JSON.stringify(invoice_lines));
    }

    return this.http.post('api/create/invoice', formData);
  }

  updateInvoice(invoiceData: any): Observable<any> {
    const {
      invoice_id,
      client: { id: clientId },
      facturationDate,
      journal: { id: journal_id },
      lastDate,
      refpayment,
    } = invoiceData;

    const formData = new FormData();
    formData.append('uid', '2');

    formData.append('customer_id', clientId);
    formData.append('invoice_id', invoice_id);
    formData.append('payment_reference', refpayment);
    formData.append('invoice_date', facturationDate);
    formData.append('invoice_date_due', lastDate);
    formData.append('journal_id', journal_id);
    formData.append('state', 'draft');
    formData.append('payment_state', 'not_paid');

    if (invoiceData.invoice_lines) {
      const invoice_lines = invoiceData.invoice_lines.map((line: any) => ({
        product_id: line.product.id,
        account_id: line.account.id,
        qty: line.quantity,
      }));
      formData.append('invoice_line_ids', JSON.stringify(invoice_lines));
    }

    return this.http.post('api/update/invoice', formData);
  }

  updateDevis(devis: Devis, orderline: any[]) {
    const formData = new FormData();
    if (devis.client && devis.payment_condition) {
      formData.append('uid', '2'); // To modify with the uid of the active user
      formData.append('customer_id', `${devis.client.id}`);
      formData.append('quotation_id', `${devis.id}`);
      formData.append('payment_term_id', `${devis.payment_condition.id}`);
      formData.append('order_line', JSON.stringify(orderline));
      formData.append('state', 'draft');
      return this.http
        .post('api/update/quotation', formData)
        .pipe(tap((response) => console.log(response)));
    }

    return of(new Error('Something went wrong'));
  }

  deleteDevis(devisId: number) {
    const odoo = this.odoo;
    return new Promise<any>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([devisId]); //id to delete
        var params = [];
        params.push(inParams);
        odoo.execute_kw(
          'account.order',
          'unlink',
          params,
          function (err: any, value: any) {
            if (err) {
              return console.log(err);
            }
            res(value);
          }
        );
      });
    });
  }

  changeDevisState(devisId: number, state: string) {
    let odoo: any = this.odoo;

    return new Promise<any>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([devisId]); //id to update
        inParams.push({ state: state });
        var params = [];
        params.push(inParams);
        odoo.execute_kw(
          'sale.order',
          'write',
          params,
          function (err: any, value: any) {
            if (err) {
              return console.log(err);
            }
            console.log(devisId, state, value);
            console.log(value);
            res(value);
          }
        );
      });
    });
  }

  deleteInvoice(invoice: any) {
    const odoo = this.odoo;
    return new Promise<any>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([invoice.id]); //id to delete
        var params = [];
        params.push(inParams);
        odoo.execute_kw(
          'account.move',
          'unlink',
          params,
          function (err: any, value: any) {
            if (err) {
              return console.log(err);
            }
            res(value);
          }
        );
      });
    });
  }

  throwBadQuery(err: Error) {
    return new OdooError('Odoo Bad Query:\n', err);
  }
}
