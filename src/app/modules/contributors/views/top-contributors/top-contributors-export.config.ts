import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ExportConfigService, ExportItem } from 'shared/components/export-csv/export-csv.component';
import { VidiunReportExportItemType, VidiunReportType } from 'vidiun-ngx-client';

@Injectable()
export class TopContributorsExportConfig implements ExportConfigService {
  constructor(private _translate: TranslateService) {
  }
  
  public getConfig(): ExportItem[] {
    return [
      {
        label: this._translate.instant('app.contributors.exportLabels.highlights'),
        reportType: VidiunReportType.topContentContributors,
        sections: [VidiunReportExportItemType.total],
        order: '-month_id',
      },
      {
        label: this._translate.instant('app.contributors.exportLabels.topContributors'),
        reportType: VidiunReportType.topContentContributors,
        sections: [VidiunReportExportItemType.table],
        order: '-contributor_ranking',
      },
      {
        label: this._translate.instant('app.contributors.exportLabels.general'),
        reportType: VidiunReportType.topContentContributors,
        sections: [VidiunReportExportItemType.graph],
      },
      {
        label: this._translate.instant('app.contributors.exportLabels.topSources'),
        reportType: VidiunReportType.topSources,
        sections: [VidiunReportExportItemType.table],
      },
    ];
  }
}
