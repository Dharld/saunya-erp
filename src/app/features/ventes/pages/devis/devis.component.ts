import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, map, tap, toArray } from 'rxjs';
import { Devis } from 'src/app/core/model/devis.model';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { VentesService } from 'src/app/core/services/ventes.service';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss'],
})
export class DevisComponent implements OnInit {
  devis$ = this.ventesService.devisAsObservable().pipe(
    map((arr) =>
      arr.sort((d1, d2) => {
        return d1.client_name.localeCompare(d2.client_name);
      })
    )
  );

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
    private ventesService: VentesService
  ) {}

  ngOnInit() {}

  createNewDevis() {
    this.navigation.navigateTo(['new'], this.route);
  }

  editDevis(devis: Devis) {
    this.ventesService.nextEditedDevis(devis);
    this.navigation.navigateWithParams(['new'], { mode: 'edit' }, this.route);
  }
}
