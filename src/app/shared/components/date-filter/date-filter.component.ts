import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { DateFilterService } from './date-filter.service';
import { DateFilterUtils } from './date-filter-utils';
import { TranslateService } from '@ngx-translate/core';
import { KalturaReportInterval } from 'kaltura-ngx-client';
import { DateRangeType, DateRanges, DateChangeEvent } from './date-filter.service';
import * as moment from 'moment';

@Component({
  selector: 'app-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss']
})
export class DateFilterComponent implements OnInit {

  @Input() dateRangeType: DateRangeType = DateRangeType.LongTerm;

  @Output() filterChange: EventEmitter<DateChangeEvent> = new EventEmitter();

  public lastDateRangeItems: SelectItem[] = [];
  public currDateRangeItems: SelectItem[] = [];
  public selectedDateRange: DateRanges;
  private lastSelectedDateRange: DateRanges; // used for revert selection

  public timeUnitsItems: SelectItem[] = [
    {label: this._translate.instant('app.dateFilter.monthly'), value: KalturaReportInterval.months},
    {label: this._translate.instant('app.dateFilter.daily'), value: KalturaReportInterval.days},
  ];
  public selectedTimeUnit: KalturaReportInterval = KalturaReportInterval.months;

  public viewItems: SelectItem[] = [
    {label: this._translate.instant('app.dateFilter.preset'), value: 'preset'},
    {label: this._translate.instant('app.dateFilter.specific'), value: 'specific'},
  ];
  public selectedView = 'preset';

  public _dateRangeLabel = '';
  public specificDateRange: Date[] = [new Date(), new Date()];
  public compare = false;

  private startDate: Date;
  private endDate: Date;

  constructor(private _translate: TranslateService, private _dateFilterService: DateFilterService) {
  }

  ngOnInit() {
    this.lastDateRangeItems = this._dateFilterService.getDateRange(this.dateRangeType, 'last');
    this.currDateRangeItems = this._dateFilterService.getDateRange(this.dateRangeType, 'current');
    this.selectedDateRange = this.lastSelectedDateRange = DateRanges.CurrentYear; // might need to change for different range type
    setTimeout( () => {
      this.updateDataRanges(); // use a timeout to allow data binding to complete
    }, 0);
  }

  public updateDataRanges(): void {
    this.lastSelectedDateRange = this.selectedDateRange;
    if (this.selectedView === 'preset') {
      const dates = this._dateFilterService.getDateRangeDetails(this.selectedDateRange);
      this.startDate = dates.startDate;
      this.endDate = dates.endDate;
      this._dateRangeLabel = dates.label;
    } else {
      this.startDate = this.specificDateRange[0];
      this.endDate = this.specificDateRange[1];
      this._dateRangeLabel = moment(this.startDate).format('MMM Do YY') + ' - ' + moment(this.endDate).format('MMM Do YY');
    }
    this.triggerChangeEvent();
  }

  public onTimeUnitsChange(): void {
    this.triggerChangeEvent();
  }

  public openPopup(): void {
    this.selectedDateRange = this.lastSelectedDateRange;
  }

  private triggerChangeEvent(): void {
    this.filterChange.emit({
      startDate: DateFilterUtils.toServerDate(this.startDate),
      endDate: DateFilterUtils.toServerDate(this.endDate),
      startDay: DateFilterUtils.getDay(this.startDate),
      endDay: DateFilterUtils.getDay(this.endDate),
      timeUnits: this.selectedTimeUnit,
      timeZoneOffset: DateFilterUtils.getTimeZoneOffset(),
      compare: this.compare
    });
  }

}
