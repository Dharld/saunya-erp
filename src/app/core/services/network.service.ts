import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConnectionStatus, ConnectionType, Network } from '@capacitor/network';
import { Platform } from '@ionic/angular';
import { ToasterService } from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private INITIAL_CONNECTION_STATUS: ConnectionStatus = {
    connected: false,
    connectionType: 'unknown' as ConnectionType,
  };

  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(
    this.INITIAL_CONNECTION_STATUS
  );

  constructor(private plt: Platform, private toaster: ToasterService) {
    this.plt.ready().then(() => {
      Network.addListener('networkStatusChange', (status) => {
        this.updateNetworkStatus(status);
      });
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
