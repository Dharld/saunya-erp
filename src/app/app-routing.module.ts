import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { LogWithServerComponent } from './features/auth/pages/log-with-server/log-with-server.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { ServerGuard } from './core/server.guard';
import { VentesComponent } from './features/ventes/ventes.component';
import { DevisComponent } from './features/ventes/pages/devis/devis.component';
import { CommandeComponent } from './features/ventes/pages/commande/commande.component';
import { FacturationComponent } from './features/ventes/pages/facturation/facturation.component';
import { NouveauDevisComponent } from './features/ventes/pages/nouveau-devis/nouveau-devis.component';
import { NewOrderLineComponent } from './features/ventes/pages/new-order-line/new-order-line.component';
import { TestComponent } from './features/test/test.component';
import { NewCommandeComponent } from './features/ventes/pages/new-commande/new-commande.component';
import { NewInvoiceComponent } from './features/ventes/pages/new-invoice/new-invoice.component';
import { NewInvoiceLineComponent } from './features/ventes/pages/new-invoice-line/new-invoice-line.component';

const routes: Routes = [
  {
    path: 'test',
    component: TestComponent,
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'log-with-server',
        component: LogWithServerComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [ServerGuard],
      },
    ],
  },
  {
    path: 'ventes',
    component: VentesComponent,
    children: [
      {
        path: 'devis',
        component: DevisComponent,
      },
      {
        path: 'devis/new',
        component: NouveauDevisComponent,
      },
      {
        path: 'devis/:id/new-order-line',
        component: NewOrderLineComponent,
      },
      {
        path: 'commande',
        component: CommandeComponent,
      },
      {
        path: 'commande/new',
        component: NewCommandeComponent,
      },
      {
        path: 'facturation',
        component: FacturationComponent,
      },
      {
        path: 'facturation/new',
        component: NewInvoiceComponent,
      },
      {
        path: 'facturation/:id/new-invoice-line',
        component: NewInvoiceLineComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
