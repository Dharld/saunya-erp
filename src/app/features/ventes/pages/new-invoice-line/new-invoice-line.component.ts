import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, concatAll, forkJoin, mergeAll, of } from 'rxjs';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';

@Component({
  selector: 'app-new-invoice-line',
  templateUrl: './new-invoice-line.component.html',
  styleUrls: ['./new-invoice-line.component.scss'],
})
export class NewInvoiceLineComponent implements OnInit {
  invoiceLineForm!: FormGroup;
  editedInvoice!: any;
  page = 1;
  loading = false;
  products!: any;
  accounts!: any;

  constructor(
    private navigation: NavigationService,
    private ventesService: VentesService,
    private fb: FormBuilder,
    private toast: ToasterService
  ) {
    this.invoiceLineForm = this.fb.group({
      product: [{ text: '' }],
      quantity: [1],
      account: [{ text: '' }],
    });
    this.ventesService.editedInvoiceAsObservable().subscribe((data) => {
      this.editedInvoice = data;
    });

    this.loading = true;
    forkJoin([
      this.ventesService.getProducts(),
      this.ventesService.getAccounts(),
    ]).subscribe(([products, accounts]) => {
      this.products = products.map((p: any) => {
        p.text = p.name;
        return p;
      });
      this.accounts = accounts.map((a: any) => {
        a.text = a.name;
        return a;
      });
      this.loading = false;
    });
  }

  ngOnInit() {}

  goBack() {
    this.navigation.goBack();
  }

  addInvoiceLine() {
    const { product, quantity, account } = this.invoiceLineForm.value;
    const invoice_line = {
      product_id: product.id,
      qty: +quantity,
      account_id: account.id,
    };
    const editedInvoice = {
      ...this.editedInvoice,
      invoice_lines: this.editedInvoice.invoice_lines
        ? [...this.editedInvoice.invoice_lines, invoice_line]
        : [invoice_line],
    };

    this.ventesService.nextEditedInvoice(editedInvoice);

    if (this.editedInvoice.id === 'brouillon') {
      this.toast.showSuccess(
        `La ligne de commande a été ajoutée à la facture ${this.editedInvoice.id}`,
        'Succès'
      );
    } else {
      this.toast.showSuccess(
        `La ligne de commande a été ajoutée à la facture brouillon`,
        'Succès'
      );
    }
  }
}
