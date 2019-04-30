import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ExportConfigService, ExportItem } from 'shared/components/export-csv/export-csv.component';
import { VidiunReportExportItemType, VidiunReportType } from 'vidiun-ngx-client';

@Injectable()
export class EntryExportConfig implements ExportConfigService {
  constructor(private _translate: TranslateService) {
  }
  
  public getConfig(): ExportItem[] {
    return [
      {
        label: this._translate.instant('app.entry.exportLabels.userEngagement'),
        reportType: VidiunReportType.userTopContent,
        sections: [VidiunReportExportItemType.table],
        order: '-count_plays',
      },
      {
        label: this._translate.instant('app.entry.exportLabels.videoPerformance'),
        reportType: VidiunReportType.userTopContent,
        sections: [VidiunReportExportItemType.graph],
        order: '-date_id',
      },
      {
        label: this._translate.instant('app.entry.exportLabels.impressions'),
        reportType: VidiunReportType.contentDropoff,
        sections: [VidiunReportExportItemType.total],
        order: '-count_plays',
      },
      {
        label: this._translate.instant('app.entry.exportLabels.topCountries'),
        reportType: VidiunReportType.mapOverlayCountry,
        sections: [VidiunReportExportItemType.table],
        order: '-count_plays',
      },
      {
        label: this._translate.instant('app.entry.exportLabels.devicesOverview'),
        reportType: VidiunReportType.platforms,
        sections: [VidiunReportExportItemType.table],
      },
      {
        label: this._translate.instant('app.entry.exportLabels.syndication'),
        reportType: VidiunReportType.topSyndication,
        sections: [VidiunReportExportItemType.table],
        order: '-count_plays',
      },
    ];
  }
}
