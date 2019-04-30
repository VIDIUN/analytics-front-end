import { Component, OnInit, Input } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { VidiunReportInterval } from 'vidiun-ngx-client';
import { DateFilterComponent } from 'shared/components/date-filter/date-filter.component';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
@Component({
  selector: 'app-time-units',
  templateUrl: './time-units.component.html',
  styleUrls: ['./time-units.component.scss']
})
export class TimeUnitsComponent implements OnInit {
  @Input() set selectedTimeUnit(value: VidiunReportInterval) {
    if (value) {
      this._selectedTimeUnit = value;
    }
  }
  
  @Input() applyIn: string;

  @Input() dateFilter: DateFilterComponent;
  
  public _selectedTimeUnit = VidiunReportInterval.months;

  public _timeUnitsItems: SelectItem[] = [
    {label: this._translate.instant('app.dateFilter.monthly'), value: VidiunReportInterval.months},
    {label: this._translate.instant('app.dateFilter.daily'), value: VidiunReportInterval.days},
  ];
  constructor(private _translate: TranslateService, private _logger: VidiunLogger) {
  }
  ngOnInit() {
    if (typeof this.dateFilter === 'undefined') {
      this._logger.error('TimeUnitsComponent error:: missing data filter component input');
    }
  }
  public onTimeUnitsChange(): void {
    this.dateFilter.timeUnitsChange(this._selectedTimeUnit, this.applyIn);
  }
}
