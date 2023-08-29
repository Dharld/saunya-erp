import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToasterService } from './toastr.service';
import { Observable, finalize, forkJoin, from, of, switchMap } from 'rxjs';
import { OdooService } from './odoo.service';

const STORAGE_REQ_KEY = 'storedreq';

interface StoredRequest {
  type: OperationType;
  data: any;
  time: number;
  id: string;
}

export type OperationType =
  | 'createQuotation'
  | 'updateQuotation'
  | 'deleteQuotation';

@Injectable({
  providedIn: 'root',
})
export class OfflineManagerService {
  constructor(
    private storage: Storage,
    private http: HttpClient,
    private toaster: ToasterService,
    private odooService: OdooService
  ) {}

  checkForEvents(): Observable<any> {
    return from(this.storage.get(STORAGE_REQ_KEY)).pipe(
      switchMap((storedOperations) => {
        let storedObj = JSON.parse(storedOperations);
        if (storedObj && storedObj.length > 0) {
          return this.sendRequests(storedObj).pipe(
            finalize(() => {
              this.toaster.showInfo(
                'Données locales synchronisées correctement!',
                'Succès'
              );
              this.storage.remove(STORAGE_REQ_KEY);
            })
          );
        } else {
          console.log("Pas d'operation à synchroniser.");
          return of(false);
        }
      })
    );
  }

  storeRequest(type: OperationType, data: any) {
    this.toaster.showInfo(
      'Votre requête sera executée lorsque vous serez à nouveau connecté.',
      'Requête sauvegardée'
    );

    let action: StoredRequest = {
      type,
      data,
      time: new Date().getTime(),
      id: Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .slice(0, 5),
    };

    return this.storage.get(STORAGE_REQ_KEY).then((storedOperations) => {
      let storedObj = JSON.parse(storedOperations);

      if (storedObj) {
        storedObj.push(action);
      } else {
        storedObj = [action];
      }

      return this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
    });
  }

  sendRequests(operations: StoredRequest[]) {
    let obs = [];

    for (let op of operations) {
      console.log('Make one request: ', op);
      if (op.type === 'createQuotation') {
        obs.push(this.odooService.createDevis(op.data.devis));
      } else if (op.type === 'updateQuotation') {
        obs.push(
          this.odooService.updateDevis(op.data.devis, op.data.orderline)
        );
      } else if (op.type === 'deleteQuotation') {
        this.odooService.deleteDevis(+op.data.devis.id);
      }
    }

    return forkJoin(obs);
  }
}
