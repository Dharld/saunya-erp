import { Injectable } from '@angular/core';
import { Devis } from '../model/devis.model';
import { BehaviorSubject, Observable, from, map, of, tap } from 'rxjs';
import { OrderLine } from '../model/order-line.model';
import { OdooService } from './odoo.service';
import { Customer } from '../model/customer.model';

@Injectable({
  providedIn: 'root',
})
export class VentesService {
  loading = new BehaviorSubject(false);
  private INITIAL_DEVIS: Devis[] = new Array();
  reloadDevis = new BehaviorSubject(true);
  // .fill({})
  // .map(function (_, index) {
  //   const newDevis = new Devis('Saunya Cosmetics');
  //   newDevis.id = 'DEVIS' + index;
  //   newDevis.invoice_address = 'Yaoundé, CAMEROUN';
  //   newDevis.delivery_address = 'Doual, CAMEROUN';
  //   newDevis.payment_condition = 'Paiement immédiat';
  //   newDevis.expiration_date = fromJSDateToString(new Date(), 'dd-MM-yyyy');
  //   newDevis.order_lines = [
  //     {
  //       product: 'Test',
  //       quantity: 2,
  //       unitPrice: 10000,
  //       taxes: '',
  //       description: '',
  //     },
  //   ];
  //   return newDevis;
  // });
  private devis = new BehaviorSubject<Devis[]>(this.INITIAL_DEVIS);

  private editedDevis!: BehaviorSubject<Devis>;
  private editedDevisOrderline!: BehaviorSubject<any>;

  constructor(private odooService: OdooService) {
    const DRAFT_DEVIS = new Devis('');
    DRAFT_DEVIS.id = 'brouillon';
    this.editedDevisOrderline = new BehaviorSubject<any>([]);
    this.editedDevis = new BehaviorSubject<Devis>(DRAFT_DEVIS);
  }

  nextEditedDevis(devis: any) {
    this.editedDevis.next(devis);
  }

  clearEditedDevis() {
    this.editedDevis.next(new Devis(''));
  }

  clearOrderline() {
    this.editedDevisOrderline.next([]);
    return of(this.editedDevis.getValue());
  }

  addDevis(devis: Devis) {
    return from(this.odooService.createDevis(devis));
  }

  updateDevis(devis: Devis, orderline: any[]) {
    return from(this.odooService.updateDevis(devis, orderline));
  }

  getNumberOfDevis() {
    return this.devis.getValue().length;
  }

  getDevis(devisId: string) {
    if (devisId === 'brouillon') {
      return of(this.editedDevis.getValue());
    }
    return this.devis.pipe(
      map((devisArr) => devisArr.find((devis) => devis.id === devisId))
    );
  }

  getAllDevis(searchTerm = '', partner_id = -1): Observable<any[]> {
    // return this.devis.pipe(delay(500));
    this.loading.next(true);
    return from(this.odooService.getDevis(searchTerm, partner_id)).pipe(
      map((devis) => {
        return devis.slice().map(function (d) {
          return {
            id: d.id,
            client: {
              id: d.partner_id[0],
              name: d.partner_id[1],
            },
            displayName: d.name,
            total: d.amount_total,
            state: d.state,
            created_at: d.date_order,
            payment_condition: {
              id: d.payment_term_id[0],
              name: d.payment_term_id[1],
            },
            order_line: d.order_line,
            expiration_date: d.validity_date,
          };
        });
      }),
      tap((devis) => {
        console.log('Next devis');
        this.devis.next(devis);
        this.loading.next(false);
      })
    );
  }

  getOrderline(orderline_id: number) {
    return from(this.odooService.getOrderline(orderline_id));
  }

  getCurrentOrderline() {
    return this.editedDevisOrderline.getValue();
  }
  getAllCustomers(): Observable<Customer[]> {
    const getCustomers$ = from(this.odooService.getCustomers());
    return getCustomers$;
  }

  getPaymentTerms() {
    return from(this.odooService.getPaymentTerms());
  }

  getProducts() {
    return from(this.odooService.getProducts());
  }

  getTaxes() {
    return from(this.odooService.getTaxes());
  }

  deleteDevis(devis: Devis) {
    return from(this.odooService.deleteDevis(+devis.id!)).pipe(
      tap((success) => {
        if (success) {
          let devisArr = this.devis.getValue();
          devisArr = devisArr.filter((d) => {
            if (d.id === devis.id) {
              return undefined;
            }
            return d;
          });
          this.devis.next(devisArr);
        }
      })
    );
  }

  addOrderLine(devis: Devis, orderLine: OrderLine) {
    const getDevis$ = this.getDevis(devis.id as string);
    getDevis$.subscribe((data) => {
      const draft = this.editedDevis.getValue();
      draft.id = devis.id;
      draft.order_lines =
        devis.order_lines === undefined
          ? [orderLine]
          : [...devis.order_lines, orderLine];
      // console.log(draft);
      // console.log(orderLine);
      this.editedDevis.next(draft);
      this.nexOrderline(orderLine);
    });
  }

  devisAsObservable() {
    return this.devis.asObservable();
  }

  editedDevisAsObservable() {
    return this.editedDevis.asObservable();
  }

  nexOrderline(orderline: any) {
    // const orderlines = this.editedDevisOrderline.getValue();
    // orderlines.push(orderline);
    this.editedDevisOrderline.next(orderline);
  }

  editedDevisOrderlineAsObservable() {
    return this.editedDevisOrderline.asObservable();
  }
}
