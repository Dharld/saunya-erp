import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin, Observable } from 'rxjs';
import { Devis } from 'src/app/core/model/devis.model';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';

@Component({
  selector: 'app-new-commande',
  templateUrl: './new-commande.component.html',
  styleUrls: ['./new-commande.component.scss'],
})
export class NewCommandeComponent implements OnInit {
  mode = 'create';
  createLoading = false;
  loading: boolean;
  newOrder!: FormGroup<{
    client: FormControl;
    expiration_date: FormControl;
    payment_condition: FormControl;
  }>;
  devis$ = this.venteServices.devisAsObservable();
  editedOrder!: any;
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
    private ventesService: VentesService
  ) {
    this.routeSub = this.route.queryParams.subscribe((params) => {
      this.mode = params['mode'];
    });
    this.loading = true;
    this.newOrder = this.fb.group({
      client: [{ text: '' }],
      expiration_date: [''],
      payment_condition: [{ text: '' }],
    });
    this.orderLines = this.venteServices.editedDevisOrderlineAsObservable();
  }

  ngOnInit() {
    this.sub = this.ventesService
      .editedDevisAsObservable()
      .subscribe((data) => {
        console.log('sub');
        this.editedOrder = data;
        this.newOrder = this.fb.group({
          client: [
            this.editedOrder.client
              ? {
                  ...this.editedOrder.client,
                  text: this.editedOrder.client.name,
                }
              : { text: '' },
          ],
          expiration_date: [
            this.editedOrder.expiration_date === false
              ? ''
              : this.editedOrder.expiration_date,
          ],
          payment_condition: [
            this.editedOrder.payment_condition
              ? {
                  ...this.editedOrder.payment_condition,
                  text: this.editedOrder.payment_condition.name,
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
            fetchOrderline.push(this.venteServices.getOrderline(orderline_id));
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
            }
          );
        }
      });
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
    const { client, expiration_date, payment_condition } = this.newOrder.value;
    console.log(client);
    this.venteServices.nextEditedDevis({
      id: this.mode === 'edit' ? this.editedOrder.id : 'brouillon',
      client,
      expiration_date,
      payment_condition,
      displayName: this.editedOrder.displayName,
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

  createInvoice() {
    const { client, expiration_date, payment_condition } = this.newOrder.value;
    const getDevis$ = this.venteServices.getAllDevis();

    let devis: Devis = {
      client,
      payment_condition,
      expiration_date,
      order_lines: this.editedOrder.order_lines
        ? this.editedOrder.order_lines
        : [],
      state: 'draft',
    };

    if (this.mode === 'edit') {
      const { client, payment_condition } = this.newOrder.value;

      const devis: Devis = {
        id: this.editedOrder.id,
        client,
        payment_condition,
        state: 'draft',
      };

      // devis.id = this.editedOrder.id;
      // devis.state = this.editedOrder.state;
      // devis.created_at = this.editedOrder.created_at;

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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.routeSub.unsubscribe();
  }
}
