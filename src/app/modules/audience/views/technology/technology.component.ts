import { Component, OnInit, ViewChild } from '@angular/core';
import { DateChangeEvent, DateRanges } from 'shared/components/date-filter/date-filter.service';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { DevicesOverviewComponent } from './devices-overview/devices-overview.component';
import { VidiunReportType } from 'vidiun-ngx-client';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { TechnologyExportConfig } from './technology-export.config';
import { ExportItem } from 'shared/components/export-csv/export-csv.component';

@Component({
  selector: 'app-technology',
  templateUrl: './technology.component.html',
  styleUrls: ['./technology.component.scss'],
  providers: [
    TechnologyExportConfig,
    VidiunLogger.createLogger('TechnologyComponent')
  ]
})
export class TechnologyComponent implements OnInit {
  @ViewChild('overview') _overview: DevicesOverviewComponent;

  public _selectedMetric: string;
  public _dateRange = DateRanges.Last30D;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _allowedDevices = ['Computer', 'Mobile', 'Tablet', 'Game console', 'Digital media receiver'];
  public _filterEvent: DateChangeEvent = null;
  public _devicesFilter: string[] = [];
  public _devicesList: { value: string, label: string; }[] = [];
  public _reportType = VidiunReportType.platforms;
  public _exportConfig: ExportItem[] = [];
  
  constructor(private _exportConfigService: TechnologyExportConfig) {
    this._exportConfig = _exportConfigService.getConfig();
  }
  
  ngOnInit() {
  }
  
  public _onDateFilterChange(event: DateChangeEvent): void {
    this._filterEvent = event;
  }
  
  public _onDeviceFilterChange(event: string[]): void {
    this._devicesFilter = event;
  }
  
  public _onDevicesListChange(event: { value: string, label: string; }[]): void {
    this._devicesList = event;
  }
  
  public _onReportDeviceFilterChange(): void {
    if (this._overview) {
      this._overview.resetDeviceFilters();
    }
  }
}
