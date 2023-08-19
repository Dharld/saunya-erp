import { DEFAULT_CURRENCY_CODE, NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FeaturesModule } from './features/features.module';
import { SharedModule } from './shared/shared.module';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';
import { TestComponent } from './features/test/test.component';
import { register } from 'swiper/element/bundle';
import { NoopInterceptor } from './core/interceptors/noop.interceptor';
import { httpInterceptorProviders } from './core/interceptors';
import { GlobalErrorHandler } from './core/error-handling/global-error-handler.service';

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
    // { provide: ErrorHandler, useClass: GlobalErrorHandler },
    httpInterceptorProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
