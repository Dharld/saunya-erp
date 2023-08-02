import { Injectable } from '@angular/core';
import { Devis } from '../model/devis.model';
import {
  BehaviorSubject,
  Observable,
  delay,
  filter,
  find,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { OrderLine } from '../model/order-line.model';
import { fromJSDateToString } from 'src/utils/luxon';

@Injectable({
  providedIn: 'root',
})
export class VentesService {
  private INITIAL_DEVIS: Devis[] = new Array(9)
    .fill({})
    .map(function (_, index) {
      const newDevis = new Devis('Saunya Cosmetics');
      newDevis.id = 'DEVIS' + index;
      newDevis.invoice_address = 'Yaoundé, CAMEROUN';
      newDevis.delivery_address = 'Doual, CAMEROUN';
      newDevis.payment_condition = 'Paiement immédiat';
      newDevis.expiration_date = fromJSDateToString(new Date(), 'dd-MM-yyyy');
      newDevis.order_lines = [
        {
          product: 'Test',
          quantity: 2,
          unitPrice: 10000,
          taxes: '',
          description: '',
        },
      ];
      return newDevis;
    });
  private devis = new BehaviorSubject<Devis[]>(this.INITIAL_DEVIS);

  private editedDevis!: BehaviorSubject<Devis>;

  constructor() {
    const DRAFT_DEVIS = new Devis('');
    DRAFT_DEVIS.id = 'brouillon';
    this.editedDevis = new BehaviorSubject<Devis>(DRAFT_DEVIS);
  }

  nextEditedDevis(devis: Devis) {
    this.editedDevis.next(devis);
  }

  clearEditedDevis() {
    this.editedDevis.next(new Devis(''));
  }

  addDevis(devis: Devis) {
    const devisArr = this.devis.getValue();
    devisArr.push(devis);
    return of({}).pipe(
      tap(() => {
        this.devis.next(devisArr);
        console.log(this.devis.getValue());
      })
    );
  }

  updateDevis(devis: Devis) {
    console.log(devis);
    let devisArr = this.devis.getValue();
    return of({}).pipe(
      map(() =>
        devisArr
          .filter((d) => {
            return d.id === devis.id ? undefined : d;
          })
          .concat([devis])
      ),
      tap((devisArr) => {
        console.log(devisArr);
        this.devis.next(devisArr);
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
  getAllDevis(): Observable<Devis[]> {
    return this.devis.pipe(delay(500));
  }

  addOrderLine(devis: Devis, orderLine: OrderLine) {
    const getDevis$ = this.getDevis(devis.id as string);
    getDevis$.subscribe((data) => {
      const draft = Devis.fromDevis(devis);
      draft.id = devis.id;
      draft.order_lines =
        devis.order_lines === undefined
          ? [orderLine]
          : [...devis.order_lines, orderLine];
      this.editedDevis.next(draft);
    });
  }

  devisAsObservable() {
    return this.devis.asObservable();
  }

  editedDevisAsObservable() {
    return this.editedDevis.asObservable();
  }
}
