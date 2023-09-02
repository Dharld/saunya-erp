import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonMenu } from '@ionic/angular';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  catchError,
  concatAll,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  scan,
  startWith,
  switchMap,
} from 'rxjs';
import { Customer } from 'src/app/core/model/customer.model';
import { Invoice } from 'src/app/core/model/invoice.model';
import { ApiService } from 'src/app/core/services/api.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';
import { ModalComponent } from 'src/app/shared/modal/modal.component';

type keyedMap = {
  [key: string]: any;
};
const STATES: keyedMap = {
  draft: 'Brouillon',
  posted: 'Comptabilisé',
  cancel: 'Annulé',
};

const PAYMENT_STATES: keyedMap = {
  not_paid: 'Non payée',
  in_payment: 'En paiement',
  paid: 'Payée',
  partial: 'Partiellement réglée',
  reversed: 'Extournée',
};

@Component({
  selector: 'app-facturation',
  templateUrl: './facturation.component.html',
  styleUrls: ['./facturation.component.scss'],
})
export class FacturationComponent implements OnInit {
  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('menu') menu!: IonMenu;

  sub!: Subscription;
  searchText: BehaviorSubject<string> = new BehaviorSubject('');
  activeClient: Customer | any = null;
  clients: Customer[] = [];
  invoices!: Invoice[];
  loading = true;
  clientChange: BehaviorSubject<boolean> = new BehaviorSubject(false);
  states = STATES;
  payment_states = PAYMENT_STATES;
  show_modal = false;
  loadingDelete = false;
  invoiceToDelete: any = null;

  constructor(
    private ventesService: VentesService,
    private route: ActivatedRoute,
    private navigation: NavigationService,
    private toast: ToasterService,
    private network: NetworkService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.sub = this.ventesService.invoiceAsObservable().subscribe((data) => {
      this.invoices = data;
    });

    const getCustomers$ = this.ventesService.getAllCustomers();

    this.ventesService.loadingInvoice.subscribe((value) => {
      this.loading = value;
    });

    getCustomers$.subscribe((customers) => {
      this.clients = customers;
    });

    const search$ = this.searchText.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((text) =>
        this.ventesService.getAllInvoices(
          text,
          this.activeClient ? this.activeClient.id : -1,
          true
        )
      )
    );
    search$.subscribe();

    const clientChange$ = this.clientChange.pipe(
      filter((change) => change === true),
      switchMap(() =>
        this.ventesService.getAllInvoices(
          this.searchText.value,
          this.activeClient.id,
          true
        )
      )
    );
    clientChange$.subscribe();
  }

  setActiveClient(c: Customer) {
    this.activeClient = c;
    this.clientChange.next(true);
  }

  setSearchText(text: string) {
    this.searchText.next(text);
  }

  createNewInvoice() {
    this.navigation.navigateTo(['new'], this.route);
  }

  editInvoice(invoice: any) {
    this.ventesService.nextEditedInvoice(invoice);
    this.navigation.navigateWithParams(['new'], { mode: 'edit' }, this.route);
  }

  deleteInvoice() {
    this.loading = false;
    if (this.invoiceToDelete) {
      this.loadingDelete = true;
      this.modal.openModal();

      const deleteInvoice$ = this.ventesService
        .deleteInvoice(this.invoiceToDelete)
        .pipe(
          catchError((err) => {
            this.modal.closeModal();
            this.loadingDelete = false;
            this.invoiceToDelete = null;
            console.error(err);
            return of(err);
          })
        );

      deleteInvoice$.subscribe((result) => {
        if (!(result instanceof Error)) {
          const status = this.network.getCurrentNetworkStatus();
          if (status.connected === true) {
            this.toast.showSuccess(
              `La facture ${this.invoiceToDelete.name} - ${this.invoiceToDelete.partner_id[1]} a été supprimée avec succès.`,
              'Succès'
            );
          }
          this.invoiceToDelete = null;
          this.modal.closeModal();
          this.loadingDelete = false;
        }
      });
    }
  }

  loadData(refresh = false, refresher?: any) {
    this.loadClients(refresh, refresher);
    this.loadInvoice(
      this.searchText.getValue() ?? '',
      this.activeClient?.id ?? -1,
      refresh,
      refresher
    );
  }

  loadClients(refresh = false, refresher?: any) {
    this.ventesService.getAllCustomers(refresh).subscribe((customers) => {
      this.clients = customers;
      if (refresher) {
        refresher.target.complete();
      }
    });
  }

  loadInvoice(
    searchTerm = '',
    partner_id = -1,
    refresh = false,
    refresher?: any
  ) {
    this.ventesService
      .getAllInvoices(searchTerm, partner_id, refresh)
      .subscribe(() => {
        if (refresher) {
          refresher.target.complete;
        }
      });
  }
  openModal(event: Event, i: any) {
    event.stopPropagation();
    this.modal.openModal();
    this.invoiceToDelete = i;
  }

  goBack() {
    this.navigation.goBack();
  }

  goTo(location: string) {
    this.menu.close();
    this.navigation.navigateTo([`/${location}`]);
  }

  signOut() {
    this.navigation.navigateTo(['/auth/login'], this.route);
    this.api.signout();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
