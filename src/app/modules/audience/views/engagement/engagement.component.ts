import { Component } from '@angular/core';
import { DateChangeEvent, DateRanges } from 'shared/components/date-filter/date-filter.service';
import { VidiunEndUserReportInputFilter, VidiunReportInterval, VidiunReportType } from 'vidiun-ngx-client';
import { RefineFilter } from '../../../../shared/components/filter/filter.component';

@Component({
  selector: 'app-engagement',
  templateUrl: './engagement.component.html',
  styleUrls: ['./engagement.component.scss']
})
export class EngagementComponent {
  public _selectedRefineFilters: RefineFilter = null;
  public _dateRange = DateRanges.Last30D;
  public _timeUnit = VidiunReportInterval.days;
  public _csvExportHeaders = '';
  public _totalCount: number;
  public _reportType: VidiunReportType = VidiunReportType.userUsage;
  public _selectedMetrics: string;
  public _dateFilter: DateChangeEvent = null;
  public _refineFilter: RefineFilter = null;
  public _refineFilterOpened = false;
  public _filter: VidiunEndUserReportInputFilter = new VidiunEndUserReportInputFilter(
    {
      searchInTags: true,
      searchInAdminTags: false
    }
  );
  
  public _onDateFilterChange(event: DateChangeEvent): void {
    this._dateFilter = event;
  }
  
  public _onRefineFilterChange(event: RefineFilter): void {
    this._refineFilter = event;
  }
}
