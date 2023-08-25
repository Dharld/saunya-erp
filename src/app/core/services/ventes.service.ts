import { Injectable } from '@angular/core';
import { Devis } from '../model/devis.model';
import { BehaviorSubject, Observable, from, map, of, tap } from 'rxjs';
import { OrderLine } from '../model/order-line.model';
import { OdooService } from './odoo.service';
import { Customer } from '../model/customer.model';
import { Invoice } from '../model/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class VentesService {
  loading = new BehaviorSubject(false);
  loadingInvoice = new BehaviorSubject(false);

  private INITIAL_DEVIS: Devis[] = new Array();
  reloadDevis = new BehaviorSubject(true);

  private devis = new BehaviorSubject<Devis[]>(this.INITIAL_DEVIS);
  private commandes = new BehaviorSubject<Devis[]>(this.INITIAL_DEVIS);
  private invoices = new BehaviorSubject<Invoice[]>([]);

  private editedDevis!: BehaviorSubject<Devis>;
  private editedInvoice!: BehaviorSubject<Invoice>;
  private editedCommande!: BehaviorSubject<Devis>;
  private editedDevisOrderline!: BehaviorSubject<any>;

  constructor(private odooService: OdooService) {
    const DRAFT_DEVIS = new Devis('');
    const DRAFT_INVOICE: Invoice = {
      id: 'brouillon',
      name: 'DRAFT_INVOICE',
    };
    DRAFT_DEVIS.id = 'brouillon';
    this.editedDevisOrderline = new BehaviorSubject<any>([]);
    this.editedDevis = new BehaviorSubject<Devis>(DRAFT_DEVIS);
    this.editedCommande = new BehaviorSubject<Devis>(DRAFT_DEVIS);
    this.editedInvoice = new BehaviorSubject<Invoice>(DRAFT_INVOICE);
  }

  nextEditedDevis(devis: any) {
    this.editedDevis.next(devis);
  }

  nextEditedInvoice(invoice: any) {
    this.editedInvoice.next(invoice);
  }

  nextEditedInvoiceline(invoice_line: any) {
    console.log(invoice_line);
    const { product_id, quantity, id, account_id } = invoice_line;
    const editedInvoice = Object.assign({}, this.editedInvoice.getValue());
    const line = {
      id: id,
      product: {
        id: product_id[0],
        name: product_id[1],
      },
      account: {
        id: account_id[0],
        name: account_id[1],
      },
      quantity: +quantity,
    };
    if (!editedInvoice.invoice_lines) {
      editedInvoice.invoice_lines = [line];
    } else {
      editedInvoice.invoice_lines = [...editedInvoice.invoice_lines, line];
    }
    this.editedInvoice.next(editedInvoice);
  }

  clearEditedDevis() {
    this.editedDevis.next(new Devis(''));
  }

  clearEditedInvoice() {
    this.editedInvoice.next({
      id: 'brouillon',
      name: 'DRAFT_INVOICE',
    });
  }

  clearOrderline() {
    this.editedDevisOrderline.next([]);
    return of(this.editedDevis.getValue());
  }

  addDevis(devis: Devis) {
    return from(this.odooService.createDevis(devis));
  }

  addInvoice(invoiceData: any) {
    console.log(invoiceData);
    return from(this.odooService.createInvoice(invoiceData)).pipe(
      tap(() => {
        this.loadingInvoice.next(true);
        this.getAllInvoices().subscribe(() => {
          this.loadingInvoice.next(false);
        });
      })
    );
  }

  getInvoiceLine(invoice: any) {
    return from(this.odooService.getInvoiceLine(invoice));
  }

  updateDevis(devis: Devis, orderline: any[]) {
    return from(this.odooService.updateDevis(devis, orderline));
  }

  updateInvoice(invoice: any) {
    return from(this.odooService.updateInvoice(invoice)).pipe(
      tap(() => {
        this.loadingInvoice.next(true);
        this.getAllInvoices().subscribe(() => {
          this.loadingInvoice.next(false);
        });
      })
    );
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

  getAllJournal() {
    return from(this.odooService.getJournals());
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

  getAccounts(page = 1) {
    return from(this.odooService.getAccounts(page));
  }

  getAllInvoices(searchTerm = '', partner_id = -1): Observable<Invoice[]> {
    this.loadingInvoice.next(true);
    return from(this.odooService.getInvoices(searchTerm, partner_id)).pipe(
      tap((invoices) => {
        this.loadingInvoice.next(false);
        console.log('Next invoices');
        this.invoices.next(invoices);
      })
    );
  }

  getAllCommande(searchTerm = '', partner_id = -1): Observable<any[]> {
    // return this.devis.pipe(delay(500));
    this.loading.next(true);
    return from(this.odooService.getCommandes(searchTerm, partner_id)).pipe(
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
      tap((commande) => {
        console.log('Next commande');
        this.commandes.next(commande);
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

  deleteInvoice(invoice: any) {
    return from(this.odooService.deleteInvoice(invoice)).pipe(
      tap((success) => {
        if (success) {
          let invoiceArr = this.invoices.getValue();
          console.log(invoiceArr);
          invoiceArr = invoiceArr.filter((i) => {
            if (i.id === invoice.id) {
              return undefined;
            }
            return i;
          });
          console.log(invoiceArr);
          this.invoices.next(invoiceArr);
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

  sendOrder(devisId: number, state: string) {
    console.log('Send');
    return from(this.odooService.changeDevisState(devisId, state)).pipe(
      tap((value) => console.log(value))
    );
  }

  devisAsObservable() {
    return this.devis.asObservable();
  }

  commandeAsObservable() {
    return this.commandes.asObservable();
  }

  invoiceAsObservable() {
    return this.invoices.asObservable();
  }

  editedDevisAsObservable() {
    return this.editedDevis.asObservable();
  }

  editedInvoiceAsObservable() {
    return this.editedInvoice.asObservable();
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
