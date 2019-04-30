import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ExportConfigService, ExportItem } from 'shared/components/export-csv/export-csv.component';
import { VidiunReportExportItemType, VidiunReportType } from 'vidiun-ngx-client';

@Injectable()
export class ContentInteractionsExportConfig implements ExportConfigService {
  constructor(private _translate: TranslateService) {
  }
  
  public getConfig(): ExportItem[] {
    return [
      {
        label: this._translate.instant('app.contentInteractions.exportLabels.interactions'),
        reportType: VidiunReportType.playerRelatedInteractions,
        sections: [VidiunReportExportItemType.graph, VidiunReportExportItemType.table],
        order: '-count_viral',
      },
      {
        label: this._translate.instant('app.contentInteractions.exportLabels.moderation'),
        reportType: VidiunReportType.contentReportReasons,
        sections: [VidiunReportExportItemType.table],
      },
      {
        label: this._translate.instant('app.contentInteractions.exportLabels.playback'),
        reportType: VidiunReportType.playbackRate,
        sections: [VidiunReportExportItemType.total],
      },
      {
        label: this._translate.instant('app.contentInteractions.exportLabels.highlights'),
        reportType: VidiunReportType.playerRelatedInteractions,
        sections: [VidiunReportExportItemType.total],
        order: '-count_viral',
      },
    ];
  }
}
