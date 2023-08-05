import { Injectable } from '@angular/core';
/* import { Odoo } from 'odoo-xmlrpc';
 */
@Injectable({
  providedIn: 'root',
})
export class OdooService {
  odoo: any;

  constructor() {
    /* this.odoo = new Odoo({
      url: 'https://demo.net-2s.com/web?db=demo.net-2s.com_mattea',
      db: 'demo.net-2s.com_mattea',
      username: 'yanndjoumessi@gmail.com',
      password: 'admin',
    }); */
  }

  login() {
    this.odoo.connect(function (err: any) {
      if (err) {
        return console.log(err);
      }
      console.log('Connected to Odoo server.');
    });
  }
}
