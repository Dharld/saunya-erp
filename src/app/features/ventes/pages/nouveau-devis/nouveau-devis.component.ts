import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
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
    this.nouveauDevisForm = this.fb.group({
      client: [this.clients[0]],
      invoice_address: [this.invoice_addresses[0]],
      delivery_address: [this.delivery_addresses[0]],
      expiration_date: [''],
      payment_conditions: [this.payment_conditions[0]],
    });
    this.ventesService.editedDevisAsObservable().subscribe((data) => {
      this.editedDevis = data;
    });
  }

  ngOnInit() {}

  goBack() {
    this.navigation.goBack();
  }

  addCommandLine() {
    const {
      client: client_name,
      invoice_address,
      delivery_address,
      expiration_date,
      payment_conditions,
    } = this.nouveauDevisForm.value;
    this.venteServices.nextEditedDevis({
      client_name,
      invoice_address,
      delivery_address,
      expiration_date,
      payment_conditions,
      order_lines: this.editedDevis.order_lines,
    } as Devis);
    this.navigation.navigateTo(['../brouillon', 'new-order-line'], this.route);
  }

  createDevis() {
    const {
      client: client_name,
      invoice_address,
      delivery_address,
      expiration_date,
      payment_conditions,
    } = this.nouveauDevisForm.value;
    /* const devis: Devis = {
      id: 'DEVIS' + (this.venteServices.getNumberOfDevis() + 1),
      client_name,
      state: 'Devis',
      created_at: new Date(),
      invoice_address,
      delivery_address,
      expiration_date,
      payment_conditions,
    }; */
    const devis = new Devis(client_name);
    devis.invoice_address = invoice_address;
    devis.delivery_address = delivery_address;
    devis.expiration_date = expiration_date;
    devis.payment_conditions = payment_conditions;

    const addDevis$ = this.venteServices.addDevis(devis);
    addDevis$.subscribe(() => {
      this.toastr.showSuccess(
        'The toastr has been successfully created',
        'Success'
      );
      // Go back to previous screen
      this.navigation.goBack();
    });
  }
}
