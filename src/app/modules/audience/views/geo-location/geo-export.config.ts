import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ExportConfigService, ExportItem } from 'shared/components/export-csv/export-csv.component';
import { VidiunReportExportItemType, VidiunReportType } from 'vidiun-ngx-client';

@Injectable()
export class GeoExportConfig implements ExportConfigService {
  constructor(private _translate: TranslateService) {
  }
  
  public getConfig(): ExportItem[] {
    return [
      {
        label: this._translate.instant('app.audience.geo.exportLabels.geo'),
        reportType: VidiunReportType.mapOverlayCountry,
        sections: [VidiunReportExportItemType.table],
        order: '-count_plays',
      },
    ];
  }
}
