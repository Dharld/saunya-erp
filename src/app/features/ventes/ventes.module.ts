import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentesComponent } from './ventes.component';
import { IonicModule } from '@ionic/angular';
import { DevisComponent } from './pages/devis/devis.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NouveauDevisComponent } from './pages/nouveau-devis/nouveau-devis.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewOrderLineComponent } from './pages/new-order-line/new-order-line.component';
import { CoreModule } from 'src/app/core/core.module';
import { FilterPipe } from 'src/app/core/pipes/filter.pipe';
import { ListWrapperComponent } from './pages/component/list-wrapper/list-wrapper.component';
import { CommandeComponent } from './pages/commande/commande.component';

@NgModule({
  declarations: [
    VentesComponent,
    DevisComponent,
    NouveauDevisComponent,
    NewOrderLineComponent,
    ListWrapperComponent,
    CommandeComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    CoreModule,
  ],
  exports: [VentesComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VentesModule {}
