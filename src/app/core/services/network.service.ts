import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConnectionStatus, ConnectionType, Network } from '@capacitor/network';
import { Platform } from '@ionic/angular';
import { ToasterService } from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private status!: BehaviorSubject<ConnectionStatus>;

  constructor(private plt: Platform, private toaster: ToasterService) {
    const INITIAL_CONNECTION_STATUS: ConnectionStatus = {
      connected: navigator.onLine,
      connectionType: 'none' as ConnectionType,
    };
    if (navigator.onLine) {
      INITIAL_CONNECTION_STATUS.connected = true;
      INITIAL_CONNECTION_STATUS.connectionType = 'unknown';
    }
    this.status = new BehaviorSubject(INITIAL_CONNECTION_STATUS);

    Network.addListener('networkStatusChange', (status) => {
      this.updateNetworkStatus(status);
    });
  }

  statusAsObservable() {
    return this.status.asObservable();
  }

  updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);
    if (status.connected) {
      this.toaster.showSuccess(`You are now online.`, 'Connection Status');
    } else {
      this.toaster.showError('You are now offline', 'Connection Status');
    }
  }

  getCurrentNetworkStatus() {
    return this.status.getValue();
  }
}
