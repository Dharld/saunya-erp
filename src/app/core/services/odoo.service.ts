import { Injectable } from '@angular/core';
import Odoo from 'odoo-xmlrpc';
import { Devis } from '../model/devis.model';
import { Customer } from '../model/customer.model';
import { fromFormatToOdoo } from 'src/utils/luxon';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

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
    // new Odoo({
    //   url: 'https://demo2.net-2s.com',
    //   db: 'demo2.net-2s.com',
    //   username: 'franck@saunya.com',
    //   password: 'franck',
    // });
  }

  login() {}

  getOrderline(order_line_id: number) {
    const odoo = this.odoo;
    return new Promise<any>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        let inParams: any[] = [];
        inParams.push([order_line_id]);
        inParams.push(['name', 'price_unit', 'product_uom_qty', 'order_id']);
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
            res(value);
          }
        );
      });
    });
  }

  getItems<T>(model: string, fields: string[]): Promise<T[]> {
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
  getItemsWidthDomain<T>(
    model: string,
    domain: string[],
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
          return console.log(err);
        }
        console.log('Connected to Odoo server.');
        let inParams: any[] = [];
        let domain: [string, string, number | string][] = [
          ['name', 'ilike', name],
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
    /* let odoo = this.odoo;
    return new Promise<any>((res, rej) => {
      odoo.connect(function (err: any) {
        if (err) {
          return console.log(err);
        }
        console.log('Connected to Odoo server.');
        let inParams = [];
        const devisOdoo = {
          partner_id: devis.client_id,
          validity_date: fromFormatToOdoo(devis.expiration_date!),
          payment_term_id: devis.payment_term_id,
          order_line: devis.order_lines?.map((ol) => {
            return [
              0,
              0,
              {
                product_id: ol.product_id,
                product_uom_qty: +ol.product_uom_qty,
              },
            ];
          }),
        };
        inParams.push(devisOdoo);
        let params = [];
        params.push(inParams);
        odoo.execute_kw(
          'sale.order',
          'create',
          params,
          function (err: any, value: any) {
            if (err) {
              throw err;
            }
            res(value);
          }
        );
      });
    }); */

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

  updateDevis(devis: Devis, orderline: any[]) {
    console.log(devis);
    console.log(orderline);
    const formData = new FormData();
    if (devis.client && devis.payment_condition) {
      formData.append('uid', '2'); // To modify with the uid of the active user
      formData.append('customer_id', `${devis.client.id}`);
      formData.append('quotation_id', `${devis.id}`);
      formData.append('payment_term_id', `${devis.payment_condition.id}`);
      formData.append('order_line', JSON.stringify(orderline));
      formData.append('state', 'devis');
      return this.http.post('api/update/quotation', formData);
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
          'sale.order',
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
}
