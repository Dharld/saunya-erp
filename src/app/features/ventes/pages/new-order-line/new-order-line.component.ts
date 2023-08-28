import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';
import { InputBoxComponent } from 'src/app/shared/input-box/input-box.component';

@Component({
  selector: 'app-new-order-line',
  templateUrl: './new-order-line.component.html',
  styleUrls: ['./new-order-line.component.scss'],
})
export class NewOrderLineComponent implements OnInit {
  @ViewChild('inputbox') unitPrice!: InputBoxComponent;
  @ViewChild('inputboxdesc') description!: InputBoxComponent;

  taxes!: any[];
  orderForm!: FormGroup;
  devisId!: string;
  editedDevis!: any;
  products!: any[];
  products_name!: any[];
  products_price!: any[];
  currentProduct: any;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private navigation: NavigationService,
    private route: ActivatedRoute,
    private ventesService: VentesService,
    private toast: ToasterService
  ) {
    this.orderForm = this.fb.group({
      product: [{ text: '' }],
      quantity: [1],
      unitPrice: [0],
      taxes: [{ text: '' }],
      discount: [0],
      description: [''],
    });
    this.route.params.subscribe((data) => {
      this.devisId = data['id'];
    });
    this.ventesService.editedDevisAsObservable().subscribe((data) => {
      this.editedDevis = data;
    });

    this.loadData(true);

    const productControl = this.orderForm.get('product');
    productControl?.valueChanges.subscribe((p) => {
      this.orderForm.get('unitPrice')?.setValue(p.lst_price);
      this.orderForm.get('description')?.setValue(p.name);
      this.unitPrice.in.nativeElement.value = p.lst_price;
      this.description.in.nativeElement.value = p.name;
    });
  }

  ngOnInit() {}

  goBack() {
    // this.ventesService.nextEditedDevis({ ...this.editedDevis });
    this.navigation.goBack();
  }

  loadData(refresh = false, refresher?: any) {
    const getProducts$ = this.ventesService.getProducts(refresh);
    const getTaxes$ = this.ventesService.getTaxes(refresh);

    forkJoin([getProducts$, getTaxes$]).subscribe(([products, taxes]) => {
      this.products =
        products?.map((p: any) => {
          p.text = p.name;
          return p;
        }) ?? [];
      this.taxes = taxes.map((t: any) => {
        t.text = t.name;
        return t;
      });

      this.loading = false;

      if (refresher) {
        refresher.target.complete();
      }
    });
  }

  createOrderLine() {
    const {
      product,
      quantity: product_uom_qty,
      unitPrice: price_unit,
      taxes,
      discount,
      description,
    } = this.orderForm.value;

    this.ventesService.addOrderLine(this.editedDevis, {
      product_id: product.id,
      name: product.name,
      product_uom_qty,
      price_unit,
      taxes,
      discount,
      description,
    });

    if (this.editedDevis.client) {
      this.toast.showSuccess(
        `La ligne de commande a été ajoutée au devis ${this.editedDevis.id}`,
        'Succès'
      );
    } else {
      this.toast.showSuccess(
        `La ligne de commande a été ajoutée au devis brouillon`,
        'Succès'
      );
    }

    this.navigation.goBack();
  }
}
