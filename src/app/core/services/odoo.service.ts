import { Injectable } from '@angular/core';
import Odoo from 'odoo-xmlrpc';
import { Devis } from '../model/devis.model';
import { Customer } from '../model/customer.model';
import { fromFormatToOdoo } from 'src/utils/luxon';
import { HttpClient } from '@angular/common/http';

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

    // const formData = new FormData();
    // formData.append('uid', '2');
    // formData.append('customer_id', '3');
    // formData.append('payment_term_id', '1');
    // formData.append('order_line', '[{ "product_id": 2, "qty": 5 }]');

    // this.http
    //   .post(
    //     /* 'https://comptabilite.net-2s.com/ */ 'api/create/quotation',
    //     formData
    //   )
    //   .subscribe((data) => console.log(data));
  }

  login() {}

  getOrderline(order_line_id: number) {
    const odoo = this.odoo;
    return new Promise((res, rej) => {
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
    ]).then((res) => {
      console.log(res);
      return res;
    });
  }

  getTaxes() {
    return this.getItems<any>('account.tax', ['name']);
  }

  createDevis(devis: Devis) {
    let odoo = this.odoo;
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
    });
    // this.http.post("/api/create/quotation", )
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
