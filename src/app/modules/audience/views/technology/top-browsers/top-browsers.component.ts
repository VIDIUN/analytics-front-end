import { Component } from '@angular/core';
import { ReportService } from 'shared/services';
import { VidiunReportType } from 'vidiun-ngx-client';
import { TopBrowsersConfig } from './top-browsers.config';
import { BaseDevicesReportComponent, BaseDevicesReportConfig } from '../base-devices-report/base-devices-report.component';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'app-top-browsers',
  templateUrl: '../base-devices-report/base-devices-report.component.html',
  styleUrls: ['../base-devices-report/base-devices-report.component.scss'],
  providers: [
    VidiunLogger.createLogger('TopBrowsersComponent'),
    { provide: BaseDevicesReportConfig, useClass: TopBrowsersConfig },
    ReportService
  ]
})
export class TopBrowsersComponent extends BaseDevicesReportComponent {
  protected _defaultReportType = VidiunReportType.browsersFamilies;
  protected _drillDownReportType = VidiunReportType.browsers;
  protected _iconType = 'browser';
  public _name = 'top-browsers';

  public _title = 'app.audience.technology.topBrowsers';
  
  protected get showIcon(): boolean {
    return this._showIcon;
  }
  
  protected getRelevantCompareRow(tableData: { [key: string]: string }[], row: { [key: string]: string }): { [key: string]: string } {
    return tableData.find(item => {
      if (this._drillDown) {
        return item.browser === row.browser;
      }
      return item.browser_family === row.browser_family;
    });
  }
}
