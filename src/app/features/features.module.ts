import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth/auth.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { LogWithServerComponent } from './auth/pages/log-with-server/log-with-server.component';
import { LoginComponent } from './auth/pages/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VentesModule } from './ventes/ventes.module';

@NgModule({
  declarations: [AuthComponent, LogWithServerComponent, LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    VentesModule,
  ],
  exports: [AuthComponent],
})
export class FeaturesModule {}
