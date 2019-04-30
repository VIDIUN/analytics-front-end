import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { analyticsConfig, getVidiunServerUri } from '../configuration/analytics-config';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { VidiunClient } from 'vidiun-ngx-client';
import { TranslateService } from '@ngx-translate/core';
import { BrowserService } from './shared/services/browser.service';
import { ConfirmationService, ConfirmDialog } from 'primeng/primeng';
import { FrameEventManagerService, FrameEvents } from 'shared/modules/frame-event-manager/frame-event-manager.service';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [VidiunLogger.createLogger('AppComponent')]
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('confirm') private _confirmDialog: ConfirmDialog;
  @ViewChild('alert') private _alertDialog: ConfirmDialog;

  public _windowEventListener = null;
  public _confirmDialogAlignLeft = false;
  public _confirmationLabels = {
    yes: 'Yes',
    no: 'No',
    ok: 'OK'
  };

  private hosted = false;

  constructor(private _frameEventManager: FrameEventManagerService,
              private _translate: TranslateService,
              private _confirmationService: ConfirmationService,
              private _logger: VidiunLogger,
              private _router: Router,
              private _browserService: BrowserService,
              private _vidiunServerClient: VidiunClient) {
    this._initApp();
  
    this._frameEventManager.listen(FrameEvents.Init)
      .pipe(cancelOnDestroy(this))
      .subscribe(config => this._initApp(config));
    
    this._frameEventManager.listen(FrameEvents.Navigate)
      .pipe(cancelOnDestroy(this), filter(Boolean))
      .subscribe(({ url }) => this._router.navigateByUrl(this.mapRoutes(url)));
  }

  ngOnInit() {
    this._browserService.registerOnShowConfirmation((confirmationMessage) => {
      const htmlMessageContent = confirmationMessage.message.replace(/\r|\n/g, '<br/>');
      const formattedMessage = Object.assign({}, confirmationMessage, {message: htmlMessageContent});

      if (confirmationMessage.alignMessage === 'byContent') {
        this._confirmDialogAlignLeft = confirmationMessage.message && /\r|\n/.test(confirmationMessage.message);
      } else {
        this._confirmDialogAlignLeft = confirmationMessage.alignMessage === 'left';
      }

      this._confirmationService.confirm(formattedMessage);
      // fix for PrimeNG no being able to calculate the correct content height
      setTimeout(() => {
        const dialog: ConfirmDialog = (confirmationMessage.key && confirmationMessage.key === 'confirm') ? this._confirmDialog : this._alertDialog;
        dialog.center();
      }, 0);
    });
  
    this._frameEventManager.publish(FrameEvents.AnalyticsInit);
  }
  
  ngOnDestroy() {

  }

  private _initApp(configuration = null): void {
    this._logger.info(`Running Analytics version: ${analyticsConfig.appVersion}`);
    let config  = null;
    if (!configuration && !window['analyticsConfig']) {
      return;
    }
    if (!configuration && window['analyticsConfig']) { // stand alone
      config = window['analyticsConfig'];
    } else {
      config = configuration;
      this.hosted = true; // hosted;
    }
    analyticsConfig.vs = config.vs;
    analyticsConfig.pid = config.pid;
    analyticsConfig.locale = config.locale;
    analyticsConfig.vidiunServer = config.vidiunServer;
    analyticsConfig.cdnServers = config.cdnServers;
    analyticsConfig.liveAnalytics = config.liveAnalytics;
    analyticsConfig.showNavBar = !this.hosted;
    analyticsConfig.isHosted = this.hosted;

    // set vs in ngx-client
    this._logger.info(`Setting vs in ngx-client: ${analyticsConfig.vs}`);
    this._vidiunServerClient.setOptions({
      endpointUrl: getVidiunServerUri(),
      clientTag: 'vmc-analytics:v0.1'
    });
    this._vidiunServerClient.setDefaultRequestOptions({
      vs: analyticsConfig.vs
    });

    // load localization
    this._logger.info('Loading localization...');
    this._translate.setDefaultLang(analyticsConfig.locale);
    this._translate.use(analyticsConfig.locale).subscribe(
      () => {
        this._logger.info(`Localization loaded successfully for locale: ${analyticsConfig.locale}`);
        if (this.hosted) {
          this._frameEventManager.publish(FrameEvents.AnalyticsInitComplete);
        }
      },
      (error) => {
        this._initAppError(error.message);
      }
    );
  }

  private _initAppError(errorMsg: string): void{
    this._logger.error(errorMsg);
  }

  private mapRoutes(vmcRoute: string): string {
    let analyticsRoute = vmcRoute;
    switch (vmcRoute) {
      case '/analytics/contributors':
        analyticsRoute = '/contributors/top-contributors';
        break;
      case '/analytics/technology':
        analyticsRoute = '/audience/technology';
        break;
      case '/analytics/geo-location':
        analyticsRoute = '/audience/geo-location';
        break;
      case '/analytics/content-interactions':
        analyticsRoute = '/audience/content-interactions';
        break;
      case '/analytics/engagement':
        analyticsRoute = '/audience/engagement';
        break;
      case '/analytics/publisher':
        analyticsRoute = '/bandwidth/publisher';
        break;
      case '/analytics/enduser':
        analyticsRoute = '/bandwidth/end-user';
        break;
      case '/analytics/live':
        analyticsRoute = '/live/live-reports';
        break;
      case '/analytics/entry':
        analyticsRoute = '/entry';
        break;
      default:
        break;
    }
    return analyticsRoute;
  }



}
