import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToasterService } from './toastr.service';
import { Observable, finalize, forkJoin, from, of, switchMap } from 'rxjs';

const STORAGE_REQ_KEY = 'storedreq';

interface StoredRequest {
  url: string;
  type: string;
  data: any;
  time: number;
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class OfflineManagerService {
  constructor(
    private storage: Storage,
    private http: HttpClient,
    private toaster: ToasterService
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

  storeRequest(url: string, type: string, data: any) {
    this.toaster.showInfo(
      'Votre requête sera executée lorsque vous serez à nouveau connecté.',
      'Requête sauvegardée'
    );

    let action: StoredRequest = {
      url,
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
      let oneObs = this.http.request(op.type, op.url, { body: op.data });
      obs.push(oneObs);
    }

    return forkJoin(obs);
  }
}
