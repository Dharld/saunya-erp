import { Injectable } from '@angular/core';
import { Devis } from '../model/devis.model';
import {
  BehaviorSubject,
  Observable,
  delay,
  empty,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  EMPTY,
  filter,
  find,
  first,
  Subject,
} from 'rxjs';
import { OrderLine } from '../model/order-line.model';

@Injectable({
  providedIn: 'root',
})
export class VentesService {
  private INITIAL_DEVIS: Devis[] = new Array(9)
    .fill({})
    .map(function (_, index) {
      const newDevis = new Devis('Saunya Cosmetics');
      newDevis.id = 'DEVIS' + index;
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
  private editedDevis = new BehaviorSubject<Devis>(new Devis(''));

  constructor() {}

  nextEditedDevis(devis: Devis) {
    this.editedDevis.next(devis);
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

  getNumberOfDevis() {
    return this.devis.getValue().length;
  }

  getDevis(devisId: string) {
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
      if (data != undefined) {
        data.order_lines?.push(orderLine);
        this.editedDevis.next(data);
      } else {
        /* const draft: Devis = {
          ...devis,
          order_lines:
            devis.order_lines === undefined
              ? [orderLine]
              : [...devis.order_lines, orderLine],
        }; */
        const draft = Devis.fromDevis(devis);
        draft.order_lines =
          devis.order_lines === undefined
            ? [orderLine]
            : [...devis.order_lines, orderLine];
        console.log(draft);
        this.editedDevis.next(draft);
      }
    });
  }

  devisAsObservable() {
    return this.devis.asObservable();
  }

  editedDevisAsObservable() {
    return this.editedDevis.asObservable();
  }
}
