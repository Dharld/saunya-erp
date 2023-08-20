import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Devis } from 'src/app/core/model/devis.model';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { VentesService } from 'src/app/core/services/ventes.service';
import { States } from 'src/utils/states';

@Component({
  selector: 'app-list-wrapper',
  templateUrl: './list-wrapper.component.html',
  styleUrls: ['./list-wrapper.component.scss'],
})
export class ListWrapperComponent implements OnInit {
  @Input() devis!: any[] | null;
  @Input() loading!: boolean;
  @Output() clickedDevis: EventEmitter<Devis> = new EventEmitter();

  states = States;

  constructor(
    private ventesService: VentesService,
    private route: ActivatedRoute,
    private navigation: NavigationService
  ) {}

  ngOnInit() {}

  editDevis(devis: Devis) {
    this.ventesService.nextEditedDevis(devis);
    this.navigation.navigateWithParams(['new'], { mode: 'edit' }, this.route);
  }

  deleteDevis(event: Event, devis: Devis) {
    event.stopPropagation();
    this.clickedDevis.emit(devis);
    // this.show_modal = true;
    // this.devisToDelete = devis;
  }

  // deleteDevis() {
  //   // this.loadingDelete = true;
  //   // this.ventesService.deleteDevis(this.devisToDelete!).subscribe((result) => {
  //   //   if (result) {
  //   //     this.ventesService.getAllDevis().subscribe(() => {
  //   //       this.loadingDelete = false;
  //   //       this.toast.showSuccess(
  //   //         `Le devis ${this.devisToDelete!.displayName} - ${
  //   //           this.devisToDelete!.client?.name
  //   //         } a été supprimé avec succès`,
  //   //         'Succès'
  //   //       );
  //   //       this.devisToDelete = null;
  //   //       this.show_modal = false;
  //   //     });
  //   //   }
  //   // });
  // }
}
