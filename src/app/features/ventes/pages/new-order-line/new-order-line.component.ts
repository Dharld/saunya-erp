import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Route } from '@angular/router';
import { Devis } from 'src/app/core/model/devis.model';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';

@Component({
  selector: 'app-new-order-line',
  templateUrl: './new-order-line.component.html',
  styleUrls: ['./new-order-line.component.scss'],
})
export class NewOrderLineComponent implements OnInit {
  taxes = ['TVA 1', 'TVA 2', 'TVA 3', 'TVA 4'];
  orderForm!: FormGroup;
  devisId!: string;
  editedDevis!: Devis;

  constructor(
    private fb: FormBuilder,
    private navigation: NavigationService,
    private route: ActivatedRoute,
    private ventesService: VentesService,
    private toast: ToasterService
  ) {
    this.orderForm = this.fb.group({
      product: [''],
      quantity: [1],
      unitPrice: [0],
      taxes: [''],
      discount: [0],
      description: [''],
    });
    this.route.params.subscribe((data) => {
      this.devisId = data['id'];
    });
    this.ventesService.editedDevisAsObservable().subscribe((data) => {
      this.editedDevis = data;
    });
  }

  ngOnInit() {}

  goBack() {
    this.navigation.goBack();
  }

  createOrderLine() {
    const { product, quantity, unitPrice, taxes, discount, description } =
      this.orderForm.value;

    this.ventesService.addOrderLine(this.editedDevis, {
      product,
      quantity,
      unitPrice,
      taxes,
      discount,
      description,
    });

    this.toast.showSuccess(
      `La ligne de commande a été ajoutée au devis du client ${this.editedDevis.client_name}`,
      'Succès'
    );

    this.navigation.goBack();
  }
}
