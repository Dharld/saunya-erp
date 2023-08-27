import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import {
  Subscription,
  combineLatest,
  forkJoin,
  switchMap,
  Observable,
} from 'rxjs';
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
export class NouveauDevisComponent implements OnInit, AfterViewInit, OnDestroy {
  mode = 'create';
  confirmLoading = false;
  createLoading = false;
  loading: boolean;
  nouveauDevisForm!: FormGroup<{
    client: FormControl;
    expiration_date: FormControl;
    payment_condition: FormControl;
  }>;
  devis$ = this.venteServices.devisAsObservable();
  editedDevis!: any;
  sub!: Subscription;
  routeSub!: Subscription;

  products!: any[];

  /** */
  clients: any[] = [];
  terms: any[] = [];
  payment_conditions: string[] = [];
  orderLines!: Observable<any>;

  constructor(
    private navigation: NavigationService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private venteServices: VentesService,
    private toastr: ToasterService,
    private ventesService: VentesService,
    private plt: Platform
  ) {
    this.routeSub = this.route.queryParams.subscribe((params) => {
      this.mode = params['mode'];
    });
    this.loading = true;
    this.nouveauDevisForm = this.fb.group({
      client: [{ text: '' }],
      expiration_date: [''],
      payment_condition: [{ text: '' }],
    });
    this.orderLines = this.venteServices.editedDevisOrderlineAsObservable();
  }

  ngOnInit() {
    this.plt.ready().then(() => {
      this.sub = this.ventesService
        .editedDevisAsObservable()
        .subscribe((data) => {
          this.editedDevis = data;
          this.nouveauDevisForm = this.fb.group({
            client: [
              this.editedDevis.client
                ? {
                    ...this.editedDevis.client,
                    text: this.editedDevis.client.name,
                  }
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

          // Fetch informations
          const getAllCustomers$ = this.venteServices.getAllCustomers();
          const getAllPaymentTerms$ = this.venteServices.getPaymentTerms();

          if (
            this.mode === 'edit' &&
            data.order_line &&
            data.order_line.length > 0
          ) {
            const fetchOrderline: Observable<any>[] = [];
            data.order_line.forEach((orderline_id: number) => {
              fetchOrderline.push(
                this.venteServices.getOrderline(orderline_id)
              );
            });

            forkJoin([
              getAllCustomers$,
              getAllPaymentTerms$,
              ...fetchOrderline,
            ]).subscribe(([customers, terms, ...orderline]) => {
              this.clients = customers.map((c: any) => {
                c.text = c.name;
                return c;
              });
              this.terms = terms;
              this.payment_conditions = (terms as any[]).map((t) => {
                t.text = t.name;
                return t;
              });

              const orderLines = orderline.map(([ol]) => ol);
              console.log(orderLines);

              this.venteServices.nexOrderline(orderLines);

              this.loading = false;
            });
          } else {
            this.loadData();
          }
        });
    });
  }

  loadData(refresh = false, refresher?: any) {
    const getAllCustomers$ = this.venteServices.getAllCustomers(refresh);
    const getAllPaymentTerms$ = this.venteServices.getPaymentTerms(refresh);

    forkJoin([getAllCustomers$, getAllPaymentTerms$]).subscribe(
      ([customers, terms]) => {
        this.clients = customers.map((c: any) => {
          c.text = c.name;
          return c;
        });
        this.terms = terms;
        this.payment_conditions = (terms as any[]).map((t) => {
          t.text = t.name;
          return t;
        });

        this.loading = false;

        if (refresher) {
          refresher.target.complete();
        }
      }
    );
  }
  ngAfterViewInit(): void {}

  goBack() {
    this.venteServices.clearEditedDevis();
    this.venteServices.clearOrderline().subscribe((data) => {
      this.navigation.goBack();
    });
    // this.navigation.goBack();
  }

  addCommandLine() {
    const { client, expiration_date, payment_condition } =
      this.nouveauDevisForm.value;
    console.log(client);
    this.venteServices.nextEditedDevis({
      id: this.mode === 'edit' ? this.editedDevis.id : 'brouillon',
      client,
      expiration_date,
      payment_condition,
      displayName: this.editedDevis.displayName,
    });
    this.navigation.navigateTo(['../brouillon', 'new-order-line'], this.route);
  }

  removeLine(ol: any) {
    /* const sub = this.venteServices
      .editedDevisOrderlineAsObservable()
      .subscribe((orderline) => {
        this.orderLines = orderline.filter((line: any) => line.id != ol.id);
      }); */
    const currentOrderline = this.venteServices.getCurrentOrderline();

    this.venteServices.nexOrderline(
      currentOrderline.filter((o: any) => o.id !== ol.id)
    );
  }

  createDevis() {
    const { client, expiration_date, payment_condition } =
      this.nouveauDevisForm.value;
    const getDevis$ = this.venteServices.getAllDevis();

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
        state: 'draft',
      };

      // devis.id = this.editedDevis.id;
      // devis.state = this.editedDevis.state;
      // devis.created_at = this.editedDevis.created_at;

      this.createLoading = true;
      const orderline = this.venteServices.getCurrentOrderline();

      const updateDevis$ = this.venteServices.updateDevis(
        devis,
        orderline.map((ol: any) => ({
          product_id: ol.product_id[0],
          qty: +ol.product_uom_qty,
        }))
      );

      updateDevis$.subscribe(() => {
        console.log('Devis updated');
        this.venteServices.getAllDevis().subscribe(() => {
          this.toastr.showSuccess(
            'Le dévis a été modifié avec succès !',
            'Success'
          );
        });

        this.createLoading = false;
        this.goBack();
      });
    } else {
      const addDevis$ = this.venteServices.addDevis(devis);

      this.createLoading = true;
      addDevis$.subscribe(() => {
        this.createLoading = false;
        this.venteServices.clearEditedDevis();
        this.venteServices.getAllDevis().subscribe(() => {
          this.toastr.showSuccess(
            'Le dévis a été crée avec succès !',
            'Success'
          );
          this.goBack();
        });
      });
    }
  }

  confirmDevis() {
    console.log(this.editedDevis);
    if (this.editedDevis.id !== 'brouillon') {
      this.confirmLoading = true;
      this.venteServices
        .sendOrder(this.editedDevis.id, 'sale')
        .subscribe(() => {
          this.confirmLoading = false;
          this.toastr.showSuccess('Votre devis a été confirmé', 'Succès');
          forkJoin([
            this.venteServices.getAllDevis(),
            this.venteServices.getAllCommande(),
          ]).subscribe(() => {
            this.goBack();
          });
        });
    }
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.routeSub.unsubscribe();
  }
}
