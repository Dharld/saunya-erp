import { Component, OnInit, AfterViewInit } from '@angular/core';
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
export class NouveauDevisComponent implements OnInit, AfterViewInit {
  mode = 'create';
  createLoading = false;
  loading = false;
  nouveauDevisForm!: FormGroup<{
    client: FormControl;
    expiration_date: FormControl;
    payment_condition: FormControl;
  }>;
  devis$ = this.venteServices.devisAsObservable();
  editedDevis!: any;

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
      this.clients = customers.map((c: any) => {
        c.text = c.name;
        return c;
      });
    });
    this.venteServices.getPaymentTerms().subscribe((terms) => {
      this.terms = terms;

      this.payment_conditions = (terms as any[]).map((t) => {
        t.text = t.name;
        return t;
      });
    });
  }

  ngOnInit() {
    this.ventesService.editedDevisAsObservable().subscribe((data) => {
      this.editedDevis = data;
      if (this.mode === 'edit' && data.order_line) {
        const orderline_id = data.order_line[0];
        if (orderline_id) {
          this.loading = true;
          this.ventesService.getOrderderline(orderline_id).subscribe((data) => {
            data.forEach((ol: any) => {
              console.log(ol);
              this.venteServices.nexOrderline(ol);
            });
            this.loading = false;
          });
        }
      }

      this.nouveauDevisForm = this.fb.group({
        client: [
          this.editedDevis.client
            ? { ...this.editedDevis.client, text: this.editedDevis.client.name }
            : { text: '' },
        ],
        expiration_date: [
          this.editedDevis.expiration_date === false
            ? ''
            : this.editedDevis.expiration_date,
        ],
        payment_condition: [
          this.editedDevis.payment_condition
            ? {
                ...this.editedDevis.payment_condition,
                text: this.editedDevis.payment_condition.name,
              }
            : { text: '' },
        ],
      });
    });
    this.venteServices.editedDevisOrderlineAsObservable().subscribe((data) => {
      console.log(data);
      this.orderLines = data;
    });
  }

  ngAfterViewInit(): void {}

  goBack() {
    this.venteServices.clearEditedDevis();
    this.venteServices.clearOrderline().subscribe((data) => {
      console.log(data);
      this.navigation.goBack();
    });
    // this.navigation.goBack();
  }

  addCommandLine() {
    const { client, expiration_date, payment_condition } =
      this.nouveauDevisForm.value;
    this.venteServices.nextEditedDevis({
      id: this.mode === 'edit' ? this.editedDevis.id : 'brouillon',
      client,
      expiration_date,
      payment_condition,
      displayName: this.editedDevis.displayName,
      /*   order_lines: this.editedDevis.order_lines
        ? this.editedDevis.order_lines
        : [], */
    });
    this.navigation.navigateTo(['../brouillon', 'new-order-line'], this.route);
  }

  createDevis() {
    const { client, expiration_date, payment_condition } =
      this.nouveauDevisForm.value;

    let devis: Devis = {
      client,
      payment_condition,
      expiration_date,
      order_lines: this.editedDevis.order_lines
        ? this.editedDevis.order_lines
        : [],
      state: 'draft',
    };

    if (this.mode === 'edit') {
      const { client, payment_condition } = this.nouveauDevisForm.value;

      const devis: Devis = {
        id: this.editedDevis.id,
        client,
        payment_condition,
        state: 'Draft',
      };

      // devis.id = this.editedDevis.id;
      // devis.state = this.editedDevis.state;
      // devis.created_at = this.editedDevis.created_at;

      // this.createLoading = true;
      // const updateDevis$ = this.venteServices.updateDevis(devis);
      // updateDevis$.subscribe(() => {
      //   this.createLoading = false;
      //   this.toastr.showSuccess('Le dévis a été crée avec succès !', 'Success');
      //   this.venteServices.clearEditedDevis();
      //   this.navigation.goBack();
      // });
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
}
