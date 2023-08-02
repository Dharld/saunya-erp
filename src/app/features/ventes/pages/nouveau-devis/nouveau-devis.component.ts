import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

  nouveauDevisForm!: FormGroup<any>;
  devis$ = this.venteServices.devisAsObservable();
  editedDevis!: Devis;

  /** */
  clients = ['Client 1', 'Client 2', 'Client 3', 'Client 4', 'Client 5'];
  invoice_addresses = ['invoiceAddress1', 'invoiceAddres2', 'invoiceAddress3'];
  delivery_addresses = [
    'deliveryAddress1',
    'deliveryAddres2',
    'deliveryAddress3',
  ];
  payment_conditions = [
    'Paiement immédiat',
    '15 jours',
    '21 jours',
    'Fin du mois',
  ];
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
  }

  ngOnInit() {
    this.ventesService.editedDevisAsObservable().subscribe((data) => {
      this.editedDevis = data;
    });
    this.nouveauDevisForm = this.fb.group({
      client: this.mode === 'edit' ? [this.editedDevis.client_name] : [''],
      invoice_address:
        this.mode === 'edit' ? [this.editedDevis.invoice_address] : [''],
      delivery_address:
        this.mode === 'edit' ? [this.editedDevis.delivery_address] : [''],
      expiration_date:
        this.mode === 'edit' ? [this.editedDevis.expiration_date] : [''],
      payment_condition:
        this.mode === 'edit' ? [this.editedDevis.payment_condition] : [''],
    });
  }

  goBack() {
    this.navigation.goBack();
  }

  addCommandLine() {
    const {
      client: client_name,
      invoice_address,
      delivery_address,
      expiration_date,
      payment_condition,
    } = this.nouveauDevisForm.value;
    this.venteServices.nextEditedDevis({
      id: this.mode === 'edit' ? this.editedDevis.id : 'brouillon',
      client_name,
      invoice_address,
      delivery_address,
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
      invoice_address,
      delivery_address,
      expiration_date,
      payment_condition,
    } = this.nouveauDevisForm.value;

    let devis: any = {
      client_name,
      invoice_address,
      delivery_address,
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
      updateDevis$.subscribe((data) => {
        this.toastr.showSuccess('Le dévis a été crée avec succès !', 'Success');
        this.venteServices.clearEditedDevis();
        this.navigation.goBack();
      });
      return;
    }

    const addDevis$ = this.venteServices.addDevis(devis);

    addDevis$.subscribe(() => {
      this.toastr.showSuccess('Le dévis a été crée avec succès !', 'Success');
      // Clear the edited devis
      this.venteServices.clearEditedDevis();
      // Go back to previous screen
      this.navigation.goBack();
    });
  }
}
