import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { VidiunFilterPager, VidiunReportInputFilter, VidiunReportType, ReportGetUrlForReportAsCsvActionArgs } from 'vidiun-ngx-client';
import { BrowserService, ErrorDetails, ErrorsManagerService, ReportService } from 'shared/services';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
  selector: 'app-export-csv',
  templateUrl: './export-csv.component.html',
  styleUrls: ['./export-csv.component.scss'],
  providers: [MessageService]
})
export class ExportCsvComponent implements OnInit {
  @Input() disabled: boolean;
  @Input() headers: string;
  @Input() dimension: string;
  @Input() totalCount: number;
  @Input() reportType: VidiunReportType;
  @Input() reportInputFilter: VidiunReportInputFilter;
  @Input() reportText: string;
  @Input() reportTitle: string;

  public _exportingCsv: boolean;

  private downloadLink = '';

  constructor(private _errorsManager: ErrorsManagerService,
              private _logger: VidiunLogger,
              private _reportService: ReportService,
              private _messageService: MessageService,
              private _browserService: BrowserService) {
  }

  ngOnInit() {
  }

  public exportToScv(): void {
    this._exportingCsv = true;
    this.downloadLink = '';
    const args: ReportGetUrlForReportAsCsvActionArgs = {
      dimension: this.dimension,
      pager: new VidiunFilterPager({pageSize: this.totalCount, pageIndex: 1}),
      reportType: this.reportType,
      reportInputFilter: this.reportInputFilter,
      headers: this.headers,
      reportText: this.reportText,
      reportTitle: this.reportTitle
    };
    this._reportService.exportToCsv(args).subscribe(
      result => {
        this._exportingCsv = false;
        this._messageService.add({key: 'ready', severity: 'success', summary: 'success', detail: result, 'sticky': true, 'closable': true});
        this.downloadLink = result;
      },
      error => {
        this._exportingCsv = false;
        this.downloadLink = '';
        const err: ErrorDetails = this._errorsManager.getError(error);
        this._messageService.add({key: 'error', severity: 'error', summary: 'error', detail: err.message, 'sticky': true, 'closable': true});
        this._logger.error(`Error exporting to CSV: ${err.message}`);
      }
    );
  }

  public download(): void {
    this._browserService.download(this.downloadLink, this.reportTitle + '.csv', 'text/csv');
    setTimeout(() => {
      this._messageService.clear('ready');
    }, 1500);
  }

  public tryAgain(): void {
    this._messageService.clear('error');
    this.exportToScv();
  }
}
