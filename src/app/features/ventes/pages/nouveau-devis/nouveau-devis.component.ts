import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { Devis } from 'src/app/core/model/devis.model';
import { OrderLine } from 'src/app/core/model/order-line.model';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';

@Component({
  selector: 'app-nouveau-devis',
  templateUrl: './nouveau-devis.component.html',
  styleUrls: ['./nouveau-devis.component.scss'],
})
export class NouveauDevisComponent implements OnInit {
  mode = 'create';
  createLoading = false;
  nouveauDevisForm!: FormGroup<{
    client: FormControl;
    expiration_date: FormControl;
    payment_condition: FormControl;
  }>;
  devis$ = this.venteServices.devisAsObservable();
  editedDevis!: Devis;

  products!: any[];

  /** */
  clients: any[] = [];
  terms: any[] = [];
  payment_conditions: string[] = [];
  orderLines: OrderLine[] = [];

  constructor(
    private navigation: NavigationService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private venteServices: VentesService,
    private toastr: ToasterService,
    private ventesService: VentesService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.mode = params['mode'];
    });
    this.venteServices.getAllCustomers().subscribe((customers) => {
      this.clients = customers;
    });
    this.venteServices.getPaymentTerms().subscribe((terms) => {
      this.terms = terms;
      this.payment_conditions = (terms as any[]).map((c) => c.name);
    });
  }

  ngOnInit() {
    this.ventesService.editedDevisAsObservable().subscribe((data) => {
      this.editedDevis = data;
      console.log(this.editedDevis);
      this.nouveauDevisForm = this.fb.group({
        client: this.mode === 'edit' ? [this.editedDevis.client_name] : [''],
        expiration_date:
          this.mode === 'edit' ? [this.editedDevis.expiration_date] : [''],
        payment_condition:
          this.mode === 'edit' ? [this.editedDevis.payment_condition] : [''],
      });
    });
  }

  goBack() {
    this.navigation.goBack();
  }

  addCommandLine() {
    const {
      client: client_name,
      expiration_date,
      payment_condition,
    } = this.nouveauDevisForm.value;
    this.venteServices.nextEditedDevis({
      id: this.mode === 'edit' ? this.editedDevis.id : 'brouillon',
      client_name,
      expiration_date,
      payment_condition,
      order_lines: this.editedDevis.order_lines
        ? this.editedDevis.order_lines
        : [],
    } as Devis);
    this.navigation.navigateTo(['../brouillon', 'new-order-line'], this.route);
  }

  createDevis() {
    const {
      client: client_name,
      expiration_date,
      payment_condition,
    } = this.nouveauDevisForm.value;

    let devis: any = {
      client_id: this.clients.find((client) => client.name === client_name).id,
      payment_term_id: this.terms.find(
        (term) => term.name === payment_condition
      ).id,
      client_name,
      expiration_date,
      payment_condition,
      order_lines: this.editedDevis.order_lines
        ? this.editedDevis.order_lines
        : [],
    };

    /* devis.invoice_address = invoice_address;
    devis.delivery_address = delivery_address;
    devis.expiration_date = expiration_date;
    devis.payment_condition = payment_condition;
    devis.order_lines = this.editedDevis.order_lines
      ? this.editedDevis.order_lines
      : []; */

    if (this.mode === 'edit') {
      devis.id = this.editedDevis.id;
      devis.state = this.editedDevis.state;
      devis.created_at = this.editedDevis.created_at;
      const updateDevis$ = this.venteServices.updateDevis(devis);
      updateDevis$.subscribe(() => {
        this.toastr.showSuccess('Le dévis a été crée avec succès !', 'Success');
        this.venteServices.clearEditedDevis();
        this.navigation.goBack();
      });
      return;
    }

    const addDevis$ = this.venteServices.addDevis(devis);

    this.createLoading = true;
    addDevis$.subscribe(() => {
      this.createLoading = false;
      this.toastr.showSuccess('Le dévis a été crée avec succès !', 'Success');
      // Clear the edited devis
      this.venteServices.clearEditedDevis();
      // Go back to previous screen
      this.navigation.goBack();
    });
  }

  get clientNames() {
    return this.clients.map((client) => client.name);
  }
}
