import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
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
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';

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
  searchText: BehaviorSubject<string> = new BehaviorSubject('');
  activeClient: Customer | any = null;
  clients: Customer[] = [];
  invoices$!: Observable<Invoice[]>;
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
    private toast: ToasterService
  ) {}

  ngOnInit() {
    this.invoices$ = this.ventesService.invoiceAsObservable();

    const loadingDevis$ = this.ventesService.loading;
    const getCustomers$ = this.ventesService.getAllCustomers();

    loadingDevis$.subscribe((loading) => {
      getCustomers$.subscribe((customers) => {
        this.clients = customers;
        this.loading = loading;
      });
    });

    const search$ = this.searchText.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((text) =>
        this.ventesService.getAllInvoices(
          text,
          this.activeClient ? this.activeClient.id : -1
        )
      )
    );
    search$.subscribe();

    const clientChange$ = this.clientChange.pipe(
      filter((change) => change === true),
      switchMap(() =>
        this.ventesService.getAllInvoices(
          this.searchText.value,
          this.activeClient.id
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

  deleteInvoice() {
    if (this.invoiceToDelete) {
      const deleteInvoice$ = this.ventesService.deleteInvoice(
        this.invoiceToDelete
      );
      const getAllInvoices$ = this.ventesService.getAllInvoices();
      const source$ = of(deleteInvoice$, getAllInvoices$);
      const completeInvoiceCreation$ = source$.pipe(concatAll());

      completeInvoiceCreation$
        .pipe(
          scan((acc, _) => {
            if (acc === 1) {
              this.toast.showSuccess(
                `La facture ${this.invoiceToDelete.name} - ${this.invoiceToDelete.partner_id[1]} a été supprimée avec succès.`,
                'Succès'
              );
              this.loading = false;
              this.invoiceToDelete = null;
            }
            return acc + 1;
          }, 0)
        )
        .subscribe();
    }
  }

  openModal(i: any) {
    this.show_modal = true;
    this.invoiceToDelete = i;
  }
  goBack() {
    this.navigation.goBack();
  }
}
