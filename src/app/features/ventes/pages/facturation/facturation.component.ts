import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subscription,
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
    private toast: ToasterService
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

  editInvoice(invoice: any) {
    this.ventesService.nextEditedInvoice(invoice);
    this.navigation.navigateWithParams(['new'], { mode: 'edit' }, this.route);
  }

  deleteInvoice() {
    this.loading = false;

    if (this.invoiceToDelete) {
      this.loadingDelete = true;
      const deleteInvoice$ = this.ventesService.deleteInvoice(
        this.invoiceToDelete
      );

      deleteInvoice$.subscribe(() => {
        this.toast.showSuccess(
          `La facture ${this.invoiceToDelete.name} - ${this.invoiceToDelete.partner_id[1]} a été supprimée avec succès.`,
          'Succès'
        );
        this.invoiceToDelete = null;
        this.show_modal = false;
        this.loadingDelete = false;
      });
    }
  }

  openModal(event: Event, i: any) {
    event.stopPropagation();
    this.show_modal = true;
    this.invoiceToDelete = i;
  }
  goBack() {
    this.navigation.goBack();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
