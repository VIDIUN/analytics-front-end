import { Component } from '@angular/core';
import { DateChangeEvent, DateRanges } from 'shared/components/date-filter/date-filter.service';
import { VidiunEndUserReportInputFilter, VidiunReportInterval, VidiunReportType } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { RefineFilter } from 'shared/components/filter/filter.component';
import { ContentInteractionsExportConfig } from './content-interactions-export.config';
import { ExportItem } from 'shared/components/export-csv/export-csv.component';

@Component({
  selector: 'app-content-interactions',
  templateUrl: './content-interactions.component.html',
  styleUrls: ['./content-interactions.component.scss'],
  providers: [
    ContentInteractionsExportConfig,
    VidiunLogger.createLogger('ContentInteractionsComponent'),
  ]
})
export class ContentInteractionsComponent {
  public _selectedRefineFilters: RefineFilter = null;
  public _dateRange = DateRanges.Last30D;
  public _timeUnit = VidiunReportInterval.days;
  public _totalCount: number;
  public _reportType: VidiunReportType = VidiunReportType.userUsage;
  public _selectedMetrics: string;
  public _dateFilter: DateChangeEvent = null;
  public _refineFilter: RefineFilter = null;
  public _refineFilterOpened = false;
  public _exportConfig: ExportItem[] = [];
  public _filter: VidiunEndUserReportInputFilter = new VidiunEndUserReportInputFilter(
    {
      searchInTags: true,
      searchInAdminTags: false
    }
  );
  
  constructor(private _exportConfigService: ContentInteractionsExportConfig) {
    this._exportConfig = _exportConfigService.getConfig();
  }
  
  public _onDateFilterChange(event: DateChangeEvent): void {
    this._dateFilter = event;
  }
  
  public _onRefineFilterChange(event: RefineFilter): void {
    this._refineFilter = event;
  }
}
