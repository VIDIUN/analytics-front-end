import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateChangeEvent, DateRanges, DateRangeType } from 'shared/components/date-filter/date-filter.service';
import { AuthService, ErrorsManagerService, Report, ReportConfig, ReportService } from 'shared/services';
import { VidiunEndUserReportInputFilter, VidiunFilterPager, VidiunObjectBaseFactory, VidiunReportGraph, VidiunReportInterval, VidiunReportTable, VidiunReportTotal, VidiunReportType, VidiunUser } from 'vidiun-ngx-client';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { Tab } from 'shared/components/report-tabs/report-tabs.component';
import { UsersFilterComponent } from 'shared/components/users-filter/users-filter.component';
import { EndUserStorageDataConfig } from './end-user-storage-data.config';
import { ReportDataConfig } from 'shared/services/storage-data-base.config';
import { map, switchMap } from 'rxjs/operators';
import { of as ObservableOf, Subject } from 'rxjs';
import { CompareService } from 'shared/services/compare.service';
import { FrameEventManagerService, FrameEvents } from 'shared/modules/frame-event-manager/frame-event-manager.service';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { analyticsConfig } from 'configuration/analytics-config';
import { TableRow } from 'shared/utils/table-local-sort-handler';
import { EndUserExportConfig } from './end-user-export.config';
import { ExportItem } from 'shared/components/export-csv/export-csv.component';
import { RefineFilter } from 'shared/components/filter/filter.component';
import { refineFilterToServerValue } from 'shared/components/filter/filter-to-server-value.util';

@Component({
  selector: 'app-publisher-storage',
  templateUrl: './end-user-storage.component.html',
  styleUrls: ['./end-user-storage.component.scss'],
  providers: [
    EndUserExportConfig,
    VidiunLogger.createLogger('EndUserStorageComponent'),
    EndUserStorageDataConfig,
  ]
})
export class EndUserStorageComponent implements OnInit, OnDestroy {

  @ViewChild('userFilter') private userFilter: UsersFilterComponent;
  
  private _paginationChanged = new Subject<void>();
  
  public _refineFilterOpened = false;
  public _refineFilter: RefineFilter = null;
  public _selectedRefineFilters: RefineFilter = null;
  public _dateRangeType: DateRangeType = DateRangeType.LongTerm;
  public _selectedMetrics: string;
  public _reportInterval: VidiunReportInterval = VidiunReportInterval.months;
  public _chartDataLoaded = false;
  public _tableData: TableRow<string>[] = [];
  public _tabsData: Tab[] = [];
  public _lineChartData: any = {'bandwidth_consumption': []};
  public _barChartData: any = {'bandwidth_consumption': []};
  public _chartType = 'line';
  public _showTable = false;
  public _totalCount: number;
  public _dateRange = DateRanges.CurrentQuarter;

  public _isBusy: boolean;
  public _blockerMessage: AreaBlockerMessage = null;
  public _columns: string[] = [];
  public _drillDown = '';
  public _paginationChanged$ = this._paginationChanged.asObservable();

  public pager: VidiunFilterPager = new VidiunFilterPager({pageSize: 25, pageIndex: 1});
  public reportType: VidiunReportType = VidiunReportType.userUsage;
  public compareFilter: VidiunEndUserReportInputFilter = null;
  public _exportConfig: ExportItem[] = [];
  public _dateFilter: DateChangeEvent;
  public filter: VidiunEndUserReportInputFilter = new VidiunEndUserReportInputFilter(
    {
      searchInTags: true,
      searchInAdminTags: false
    }
  );

  private order = '-total_storage_mb';
  private _dataConfig: ReportDataConfig = null;

  public get isCompareMode(): boolean {
    return this.compareFilter !== null;
  }

  constructor(private _frameEventManager: FrameEventManagerService,
              private _translate: TranslateService,
              private _errorsManager: ErrorsManagerService,
              private _reportService: ReportService,
              private _authService: AuthService,
              private _compareService: CompareService,
              private _dataConfigService: EndUserStorageDataConfig,
              private _logger: VidiunLogger,
              private _exportConfigService: EndUserExportConfig) {
    this._dataConfig = _dataConfigService.getConfig();
    this._selectedMetrics = this._dataConfig.totals.preSelected;
    this._exportConfig = _exportConfigService.getConfig();
  }

  ngOnInit() {
    this._isBusy = false;
  }
  
  ngOnDestroy(): void {
    this._paginationChanged.complete();
  }
  
  public _onDateFilterChange(event: DateChangeEvent): void {
    this._dateFilter = event;
    this._logger.trace('Handle date filter change action by user', () => ({ event }));
    this._chartDataLoaded = false;
    this.filter.timeZoneOffset = event.timeZoneOffset;
    this.filter.fromDate = event.startDate;
    this.filter.toDate = event.endDate;
    this.filter.interval = event.timeUnits;
    this._reportInterval = event.timeUnits;
    this.pager.pageIndex = 1;
    if (event.compare.active) {
      const compare = event.compare;
      this.compareFilter = Object.assign(VidiunObjectBaseFactory.createObject(this.filter), this.filter);
      this.compareFilter.fromDate = compare.startDate;
      this.compareFilter.toDate = compare.endDate;
    } else {
      this.compareFilter = null;
    }
    this.loadReport();
  }

  public _onTabChange(tab: Tab): void {
    this._logger.trace('Handle tab change action by user', { tab });
    this._selectedMetrics = tab.key;
    this.updateChartType();
  }

  public _onDrillDown(user: string): void {
    this._logger.trace('Handle drill down to a user details action by user, reset page index to 1', { user });
    this._drillDown = user.length ? user : '';
    this.reportType = user.length ? KalturaReportType.specificUserUsage : KalturaReportType.userUsage;
    this.pager.pageIndex = 1;

    this.order = user.length ? '+month_id' : '-total_storage_mb';
    this.loadReport();
  }

  public toggleTable(): void {
    this._logger.trace('Handle toggle table visibility action by user', { tableVisible: !this._showTable });
    this._showTable = !this._showTable;
    if (analyticsConfig.isHosted) {
      setTimeout(() => {
        const height = document.getElementById('analyticsApp').getBoundingClientRect().height;
        this._logger.trace('Send update layout event to the host app', { height });
        this._frameEventManager.publish(FrameEvents.UpdateLayout, { height });
      }, 0);
    }
  }

  public _onPaginationChanged(event): void {
    if (event.page !== (this.pager.pageIndex - 1)) {
      this._paginationChanged.next();
      this._logger.trace('Handle pagination changed action by user', { newPage: event.page + 1 });
      this.pager.pageIndex = event.page + 1;
      this.loadReport({ table: this._dataConfig.table });
    }
  }

  private loadReport(sections = this._dataConfig): void {
    this._isBusy = true;
    this._tableData = [];
    this._blockerMessage = null;

    const reportConfig: ReportConfig = { reportType: this.reportType, filter: this.filter, pager: this.pager, order: this.order };
    this._reportService.getReport(reportConfig, sections)
      .pipe(switchMap(report => {
        if (!this.isCompareMode) {
          return ObservableOf({ report, compare: null });
        }

        const compareReportConfig = { reportType: this.reportType, filter: this.compareFilter, pager: this.pager, order: this.order };
        return this._reportService.getReport(compareReportConfig, sections)
          .pipe(map(compare => ({ report, compare })));
      }))
      .subscribe( ({ report, compare }) => {
          if (compare) {
            this.handleCompare(report, compare);
          } else {
            if (report.table && report.table.header && report.table.data) {
              this.handleTable(report.table); // handle table
            }
            if (report.graphs.length) {
              this._chartDataLoaded = false;
              this.handleGraphs(report.graphs); // handle graphs
            }
            if (report.totals) {
              this.handleTotals(report.totals); // handle totals
            }
          }
          this._isBusy = false;
        },
        error => {
          this._isBusy = false;
          const actions = {
            'close': () => {
              this._blockerMessage = null;
            },
            'retry': () => {
              this.loadReport();
            },
          };
          this._blockerMessage = this._errorsManager.getErrorMessage(error, actions);
        });
  }

  _onSortChanged(event) {
    setTimeout(() => {
      if (event.data.length && event.field && event.order && event.order !== 1 && !this.isCompareMode) {
        const order = (event.order === 1 || event.field === 'month_id') ? '+' + event.field : '-' + event.field;
        if (order !== this.order) {
          this._logger.trace('Handle sort changed action by user', { order });
          this.order = order;
          this.pager.pageIndex = 1;
          this.loadReport({ table: this._dataConfig.table });
        }
      }
    });
  }

  private handleCompare(current: Report, compare: Report): void {
    const currentPeriod = { from: this.filter.fromDate, to: this.filter.toDate };
    const comparePeriod = { from: this.compareFilter.fromDate, to: this.compareFilter.toDate };

    const dataKey = this._drillDown.length ? '' : 'vuser_id';
    if (current.table && compare.table) {
      const { columns, tableData } = this._compareService.compareTableData(
        currentPeriod,
        comparePeriod,
        current.table,
        compare.table,
        this._dataConfig.table,
        this._reportInterval,
        dataKey
      );
      this._columns = columns;
      this._totalCount = compare.table.totalCount;
      this._tableData = tableData;
    }

    if (current.totals && compare.totals) {
      this._tabsData = this._compareService.compareTotalsData(
        currentPeriod,
        comparePeriod,
        current.totals,
        compare.totals,
        this._dataConfig.totals,
        this._selectedMetrics
      );
    }

    if (current.graphs.length && compare.graphs.length) {
      const { lineChartData, barChartData } = this._compareService.compareGraphData(
        currentPeriod,
        comparePeriod,
        current.graphs,
        compare.graphs,
        this._dataConfig.graph,
        this._reportInterval,
        () => this._chartDataLoaded = true
      );
      this._lineChartData = lineChartData;
      this._barChartData = barChartData;
    }
  }

  private handleTable(table: VidiunReportTable): void {
    const { columns, tableData } = this._reportService.parseTableData(table, this._dataConfig.table);
    this._totalCount = table.totalCount;
    this._columns = columns;
    this._tableData = tableData;
  }

  private handleTotals(totals: VidiunReportTotal): void {
    this._tabsData = this._reportService.parseTotals(totals, this._dataConfig.totals, this._selectedMetrics);
  }

  private handleGraphs(graphs: VidiunReportGraph[]): void {
    const { lineChartData, barChartData } = this._reportService.parseGraphs(
      graphs,
      this._dataConfig.graph,
      { from: this.filter.fromDate, to: this.filter.toDate },
      this._reportInterval,
      () => this._chartDataLoaded = true
    );
    this._lineChartData = lineChartData;
    this._barChartData = barChartData;
  }

  private updateChartType(): void {
    this._chartType = ((this._selectedMetrics === 'added_storage_mb' || this._selectedMetrics === 'deleted_storage_mb') && this._reportInterval === VidiunReportInterval.months) ? 'bar' : 'line';
  }
  
  public _onRefineFilterChange(event: RefineFilter): void {
    this._refineFilter = event;
    
    refineFilterToServerValue(this._refineFilter, this.filter);
    if (this.compareFilter) {
      refineFilterToServerValue(this._refineFilter, this.compareFilter);
    }
    
    this.loadReport();
  }
}
