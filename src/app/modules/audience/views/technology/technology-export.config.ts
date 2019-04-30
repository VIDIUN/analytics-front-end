import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ExportConfigService, ExportItem } from 'shared/components/export-csv/export-csv.component';
import { VidiunReportExportItemType, VidiunReportType } from 'vidiun-ngx-client';

@Injectable()
export class TechnologyExportConfig implements ExportConfigService {
  constructor(private _translate: TranslateService) {
  }
  
  public getConfig(): ExportItem[] {
    return [
      {
        label: this._translate.instant('app.audience.technology.exportLabels.overview'),
        reportType: VidiunReportType.platforms,
        sections: [VidiunReportExportItemType.table],
      },
      {
        label: this._translate.instant('app.audience.technology.exportLabels.topOs'),
        reportType: VidiunReportType.operatingSystemFamilies,
        sections: [VidiunReportExportItemType.table],
        order: '-count_plays',
      },
      {
        label: this._translate.instant('app.audience.technology.exportLabels.topBrowsers'),
        reportType: VidiunReportType.browsersFamilies,
        sections: [VidiunReportExportItemType.table],
        order: '-count_plays',
      },
    ];
  }
}
