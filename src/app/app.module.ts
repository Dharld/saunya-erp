import {
  CUSTOM_ELEMENTS_SCHEMA,
  DEFAULT_CURRENCY_CODE,
  NgModule,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FeaturesModule } from './features/features.module';
import { SharedModule } from './shared/shared.module';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';
import { TestComponent } from './features/test/test.component';
import { register } from 'swiper/element/bundle';

register();

@NgModule({
  declarations: [AppComponent, TestComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    FeaturesModule,
    HttpClientModule,
    ToastrModule.forRoot(),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'XAF' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
