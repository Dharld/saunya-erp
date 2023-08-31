import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';
import { convertDateFormat, fromFormatToOdoo } from 'src/utils/luxon';

@Component({
  selector: 'app-new-invoice',
  templateUrl: './new-invoice.component.html',
  styleUrls: ['./new-invoice.component.scss'],
})
export class NewInvoiceComponent implements OnInit, OnDestroy {
  mode!: string;
  editedInvoice!: any;

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

  sub!: Subscription;

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
    const clientControl = this.newInvoice.get('client');
    const refPaymentControl = this.newInvoice.get('refpayment');
    const facturationDateControl = this.newInvoice.get('facturationDate');
    const lastDateControl = this.newInvoice.get('lastDate');
    const journalControl = this.newInvoice.get('journal');

    this.sub = this.ventesService
      .editedInvoiceAsObservable()
      .subscribe((data) => {
        this.editedInvoice = data;
        const {
          partner_id: client,
          payment_reference: refpayment,
          invoice_date: facturationDate,
          invoice_date_due: lastDate,
          journal_id: journal,
        } = this.editedInvoice;
        if (this.editedInvoice.id !== 'brouillon') {
          this.setSelectControl(clientControl!, client);
          this.setInputControl(refPaymentControl!, refpayment);
          this.setInputControl(
            facturationDateControl!,
            convertDateFormat(facturationDate, 'yyyy-MM-dd', 'dd-MM-yyyy')
          );
          this.setInputControl(
            lastDateControl!,
            convertDateFormat(lastDate, 'yyyy-MM-dd', 'dd-MM-yyyy')
          );
          this.setSelectControl(journalControl!, journal);
        }
      });
    this.route.queryParams.subscribe((params) => {
      this.mode = params['mode'];
      if (this.mode === 'edit' && this.editedInvoice.id !== 'brouillon') {
        console.log(this.editedInvoice);
        this.ventesService
          .getInvoiceLine(this.editedInvoice)
          .subscribe((lines) => {
            console.log(lines);
            lines.forEach((line) =>
              this.ventesService.nextEditedInvoiceline(line[0])
            );
          });
      }
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

  setSelectControl(control: AbstractControl<any, any>, model: any) {
    control?.setValue({
      id: model[0],
      name: model[1],
      text: model[1],
    });
  }

  setInputControl(control: AbstractControl<any, any>, value: any) {
    control.setValue(value);
  }

  createNewInvoice() {
    let invoiceData: any = {
      ...this.newInvoice.value,
      facturationDate: fromFormatToOdoo(this.newInvoice.value.facturationDate),
      lastDate: fromFormatToOdoo(this.newInvoice.value.lastDate),
      invoice_lines: this.editedInvoice.invoice_lines,
    };

    this.createLoading = true;

    const addInvoice$ = this.ventesService.addInvoice(invoiceData);
    const updateInvoice$ = this.ventesService.updateInvoice(invoiceData);

    if (this.mode === 'edit') {
      invoiceData.invoice_id = this.editedInvoice.id;
      updateInvoice$.subscribe((res) => {
        if (res.success) {
          // this.ventesService.clearEditedInvoice();
          this.createLoading = false;
          this.toast.showSuccess(
            'Votre facture a été modifiée avec succès',
            'Succès'
          );
          this.goBack();
        }
      });
    } else {
      this.createLoading = true;
      addInvoice$.subscribe((res) => {
        if (res.success) {
          this.toast.showSuccess(
            'Votre facture a été créée avec succès',
            'Succès'
          );
        }
        console.log('Go Back');
        this.goBack();
      });
    }
    this.createLoading = false;
  }

  addInvoiceLine() {
    const { client, refpayment, facturationDate, lastDate, journal } =
      this.newInvoice.value;
    this.ventesService.nextEditedInvoice({
      id: this.editedInvoice.id,
      client,
      refpayment,
      facturationDate,
      lastDate,
      journal,
      invoice_lines: this.editedInvoice.invoice_lines,
    });
    this.navigation.navigateTo(
      ['../brouillon', 'new-invoice-line'],
      this.route
    );
  }

  removeLine(line_id: number) {
    const invoice_lines = this.editedInvoice.invoice_lines.filter(
      (line: any) => line.id !== line_id
    );
    this.ventesService.nextEditedInvoice({
      ...this.editedInvoice,
      invoice_lines,
    });
    this.toast.showSuccess('Ligne de facturation supprimée.', 'succès');
  }

  goBack() {
    this.ventesService.clearEditedInvoice();
    this.navigation.goBack();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
