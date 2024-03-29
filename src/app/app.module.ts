import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardViewComponent } from './modules/dashboard/dashboard-view.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { VidiunClientModule } from 'vidiun-ngx-client';
import { analyticsConfig } from '../configuration/analytics-config';
import { BrowserService, ErrorsManagerService, AuthService } from './shared/services';
import { ConfirmationService, ConfirmDialogModule } from 'primeng/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMenuComponent } from './app-menu/app-menu.component';
import { SharedModule } from './shared/shared.module';
import { FrameEventManagerModule } from 'shared/modules/frame-event-manager/frame-event-manager.module';
import { VidiunLogger, VidiunLoggerModule } from '@vidiun-ng/vidiun-logger';
import { environment } from '../environments/environment';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json?v=' + analyticsConfig.appVersion);
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DashboardViewComponent,
    AppMenuComponent
  ],
  imports: [
    BrowserModule,
    SharedModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    VidiunClientModule.forRoot(),
    FrameEventManagerModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ConfirmDialogModule,
    VidiunLoggerModule.forRoot('AnalyticsNG'),
  ],
  providers: [
    BrowserService,
    ErrorsManagerService,
    ConfirmationService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(_vidiunLogger: VidiunLogger) {
    if (environment.production) {
      _vidiunLogger.setOptions({ level: 'Error' });
    } else {
      _vidiunLogger.setOptions({ level: 'Warn' });
    }
  }
}
