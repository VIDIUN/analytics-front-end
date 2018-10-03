import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient, KalturaReportInputFilter, KalturaReportType, ReportGetTotalAction, KalturaReportTotal, ReportGetGraphsAction,
  KalturaReportGraph, ReportGetTableAction, KalturaFilterPager, KalturaMultiResponse, KalturaReportTable,
  ReportGetUrlForReportAsCsvAction, ReportGetUrlForReportAsCsvActionArgs, ReportGetBaseTotalAction, KalturaReportBaseTotal} from 'kaltura-ngx-client';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';

export type Report = {
  totals: KalturaReportTotal,
  graphs: KalturaReportGraph[],
  table: KalturaReportTable,
  baseTotals?: KalturaReportBaseTotal[]
};

@Injectable()
export class ReportService implements OnDestroy {

  private _querySubscription: ISubscription;
  private _exportSubscription: ISubscription;

  constructor(private _translate: TranslateService, private _kalturaClient: KalturaClient) {
  }

  public getReport(tableOnly: boolean, loadBaseTotals: boolean, reportType: KalturaReportType, filter: KalturaReportInputFilter, pager: KalturaFilterPager, order: string): Observable<Report> {
    return Observable.create(
      observer => {
        const getTotal = new ReportGetTotalAction({
          reportType,
          reportInputFilter: filter
        });

        const getGraphs = new ReportGetGraphsAction({
          reportType,
          reportInputFilter: filter
        });

        const getBaseTotals = new ReportGetBaseTotalAction({
          reportType,
          reportInputFilter: filter
        });

        const getTable = new ReportGetTableAction({
          reportType,
          reportInputFilter: filter,
          pager,
          order
        });

        if (this._querySubscription) {
          this._querySubscription.unsubscribe();
          this._querySubscription = null;
        }

        let request = tableOnly ? [getTable] : loadBaseTotals ? [getTable, getGraphs, getTotal, getBaseTotals] : [getTable, getGraphs, getTotal];
        if (tableOnly && loadBaseTotals) {
          request = [getTable, getBaseTotals];
        }
        this._querySubscription = this._kalturaClient.multiRequest(request)
          .pipe(cancelOnDestroy(this))
          .subscribe((response: KalturaMultiResponse) => {
              if (response.hasErrors()) {
                const err = response.getFirstError();
                if (err) {
                  observer.error(err);
                } else {
                  observer.error(this._translate.instant('app.errors.general'));
                }
              } else {
                let report: Report = {
                  table: response[0].result,
                  graphs: response[1] ? response[1].result : [],
                  totals: response[2] ? response[2].result : null
                };
                if (loadBaseTotals) {
                  let baseTotals = [];
                  if (tableOnly) {
                    baseTotals = response[1] ? response[1].result : [];
                  } else {
                    baseTotals = response[3] ? response[3].result : [];
                  }
                  report.baseTotals = baseTotals;
                }
                observer.next(report);
                observer.complete();
              }
              this._querySubscription = null;
            },
            error => {
              observer.error(error);
              this._querySubscription = null;
            });
      });
  }

  public exportToCsv(args: ReportGetUrlForReportAsCsvActionArgs): Observable<string> {
    return Observable.create(
      observer => {
        const exportAction = new ReportGetUrlForReportAsCsvAction(args);

        if (this._exportSubscription) {
          this._exportSubscription.unsubscribe();
          this._exportSubscription = null;
        }

        this._exportSubscription = this._kalturaClient.request(exportAction)
          .pipe(cancelOnDestroy(this))
          .subscribe((response: string) => {
              observer.next(response);
              observer.complete();
              this._exportSubscription = null;
            },
            error => {
              observer.error(error);
              this._exportSubscription = null;
            });
      });
  }

  public addGraphTotals(graphs: KalturaReportGraph[], totals: KalturaReportBaseTotal[]): void {
    totals.forEach( (total: KalturaReportBaseTotal) => {
      let newGraph = new KalturaReportGraph({id: total.id, data: ''});
      const metrics = total.id.substr(6);
      const added_data_graph: KalturaReportGraph = graphs.find( (graph: KalturaReportGraph) => {
        return graph.id === 'added_' + metrics;
      });
      const deleted_data_graph: KalturaReportGraph = graphs.find( (graph: KalturaReportGraph) => {
        return graph.id === 'deleted_' + metrics;
      });
      if (typeof added_data_graph !== 'undefined' && typeof deleted_data_graph !== 'undefined') {
        const totalValue = parseFloat(total.data);
        const added_data = added_data_graph.data.split(';');
        const deleted_data = deleted_data_graph.data.split(';');
        let totalAdded = 0;
        let totalDeleted = 0;
        added_data.forEach( (dataSet, index) => {
          if (dataSet.split(',').length === 2 && deleted_data[index] && deleted_data[index].split(',').length === 2) {
            const addedXvalue = dataSet.split(',')[0];
            const addedYvalue = dataSet.split(',')[1];
            const deletedXvalue = deleted_data[index].split(',')[0];
            const deletedYvalue = deleted_data[index].split(',')[1];
            totalAdded += parseFloat(addedYvalue);
            totalDeleted += parseFloat(deletedYvalue);
            const calculatedValue = totalValue + totalAdded - totalDeleted;
            newGraph.data += addedXvalue + ',' + calculatedValue + ';';
          }
        });
        if (newGraph.data.length > 0) {
          graphs.push(newGraph);
        }
      }
    });
  }

  public addTableTotals(report: Report): { headers: string,  data: string } {
    let tableHeaders = report.table.header.split(',');
    let tableData = report.table.data.split(';');
    let newTableData = '';
    report.baseTotals.forEach( (total: KalturaReportBaseTotal) => {
      const metrics = total.id.substr(6);
      const totalValue = parseFloat(total.data);
      if (report.table.header.indexOf(total.id) === -1) {
        const index = tableHeaders.indexOf('deleted_' + metrics);
        if (index > -1) {
          let totalAdded = 0;
          let totalDeleted = 0;
          tableHeaders.splice(index + 1, 0, total.id);
          tableData.forEach((dataSet, ind) => {
            if (dataSet && dataSet.length) {
              let dataArr = dataSet.split(',');
              totalDeleted += parseFloat(dataArr[index]);
              totalAdded += parseFloat(dataArr[index - 1]);
              dataArr.splice(index + 1, 0, (totalValue + totalAdded - totalDeleted).toString());
              tableData[ind] = dataArr.join(',');
            }
          });
          newTableData = tableData.join(';');
        }
      }
    });
    return {headers: tableHeaders.join(','), data: newTableData};
  }


  ngOnDestroy() {
  }


}

