import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';
import { concatAll, forkJoin, of, scan } from 'rxjs';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';
import { fromFormatToOdoo } from 'src/utils/luxon';

@Component({
  selector: 'app-new-invoice',
  templateUrl: './new-invoice.component.html',
  styleUrls: ['./new-invoice.component.scss'],
})
export class NewInvoiceComponent implements OnInit {
  newInvoice!: FormGroup<{
    client: FormControl;
    refpayment: FormControl;
    facturationDate: FormControl;
    lastDate: FormControl;
    journal: FormControl;
  }>;

  clients: any[] = [];
  journals: any[] = [];

  createLoading = false;
  loading = true;

  constructor(
    private ventesService: VentesService,
    private fb: FormBuilder,
    private toast: ToasterService,
    private navigation: NavigationService,
    private route: ActivatedRoute
  ) {
    this.newInvoice = this.fb.group({
      client: [{ text: '' }],
      refpayment: [''],
      facturationDate: [''],
      lastDate: [''],
      journal: [{ text: '' }],
    });
  }

  ngOnInit() {
    forkJoin([
      this.ventesService.getAllCustomers(),
      this.ventesService.getAllJournal(),
    ]).subscribe(([customers, journals]) => {
      this.clients = customers.map((c: any) => {
        c.text = c.name;
        return c;
      });
      this.journals = journals.map((j) => {
        j.text = j.name;
        return j;
      });
      this.loading = false;
    });
  }

  createNewInvoice() {
    const invoiceData = {
      ...this.newInvoice.value,
      facturationDate: fromFormatToOdoo(this.newInvoice.value.facturationDate),
      lastDate: fromFormatToOdoo(this.newInvoice.value.lastDate),
    };
    this.createLoading = true;

    const addInvoice$ = this.ventesService.addInvoice(invoiceData);
    const getAllInvoices = this.ventesService.getAllInvoices();

    const source$ = of(addInvoice$, getAllInvoices);

    const completeInvoiceCreation$ = source$.pipe(concatAll());

    completeInvoiceCreation$
      .pipe(
        scan((acc, _) => {
          if (acc === 1) {
            this.toast.showSuccess(
              'Votre facture a été créé avec succès.',
              'Succès'
            );
            this.createLoading = false;
            this.goBack();
          }
          return acc + 1;
        }, 0)
      )
      .subscribe();
  }

  addInvoiceLine() {
    const { client, refpayment, facturationDate, lastDate, journal } =
      this.newInvoice.value;
    this.ventesService.nextEditedInvoice({
      id: 'brouillon',
      client,
      refpayment,
      facturationDate,
      lastDate,
      journal,
    });
    this.navigation.navigateTo(
      ['../brouillon', 'new-invoice-line'],
      this.route
    );
  }

  goBack() {
    this.navigation.goBack();
    // this.navigation.goBack();
  }
}
