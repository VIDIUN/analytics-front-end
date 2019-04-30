import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ExportConfigService, ExportItem } from 'shared/components/export-csv/export-csv.component';
import { VidiunReportExportItemType, VidiunReportType } from 'vidiun-ngx-client';

@Injectable()
export class EngagementExportConfig implements ExportConfigService {
  constructor(private _translate: TranslateService) {
  }
  
  public getConfig(): ExportItem[] {
    return [
      {
        label: this._translate.instant('app.engagement.exportLabels.highlights'),
        reportType: VidiunReportType.userEngagementTimeline,
        sections: [VidiunReportExportItemType.total],
        order: '-count_plays',
      },
      {
        label: this._translate.instant('app.engagement.exportLabels.topVideos'),
        reportType: VidiunReportType.topContentCreator,
        sections: [VidiunReportExportItemType.table],
        order: '-engagement_ranking',
      },
      {
        label: this._translate.instant('app.engagement.exportLabels.general'),
        reportType: VidiunReportType.userEngagementTimeline,
        sections: [VidiunReportExportItemType.table],
        order: '-date_id',
      },
      {
        label: this._translate.instant('app.engagement.exportLabels.impressions'),
        reportType: VidiunReportType.contentDropoff,
        sections: [VidiunReportExportItemType.total],
        order: '-count_plays',
      },
      {
        label: this._translate.instant('app.engagement.exportLabels.syndication'),
        reportType: VidiunReportType.topSyndication,
        sections: [VidiunReportExportItemType.table],
        order: '-count_plays',
      },
    ];
  }
}
