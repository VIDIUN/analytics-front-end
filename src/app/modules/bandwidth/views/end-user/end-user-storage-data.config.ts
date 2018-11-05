import { DateFilterUtils } from 'shared/components/date-filter/date-filter-utils';
import { analyticsConfig } from 'configuration/analytics-config';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReportDataConfig, ReportDataSection, ReportDataBaseConfig } from 'shared/services/storage-data-base.config';
import { ReportHelper } from 'shared/services';

@Injectable()
export class EndUserStorageDataConfig extends ReportDataBaseConfig {
  constructor(_translate: TranslateService) {
    super(_translate);
  }

  public getConfig(): ReportDataConfig {
    return {
      [ReportDataSection.graph]: {
        fields: {
          'added_storage_mb': {
            format: value => value
          },
          'deleted_storage_mb': {
            format: value => value
          },
          'added_entries': {
            format: value => value
          },
          'deleted_entries': {
            format: value => value
          },
          'added_msecs': {
            format: value => Math.round(value / 60000)
          },
          'deleted_msecs': {
            format: value => Math.round(value / 60000)
          },
          'total_storage_mb': {
            format: value => value
          },
          'total_entries': {
            format: value => value
          },
          'total_msecs': {
            format: value => Math.round(value / 60000)
          },
        }
      },
      [ReportDataSection.table]: {
        fields: {
          'name': {
            format: value => value,
            nonComparable: true,
          },
          'date_id': {
            format: value => DateFilterUtils.formatFullDateString(value, analyticsConfig.locale),
            nonComparable: true,
          },
          'month_id': {
            format: value => DateFilterUtils.formatMonthString(value, analyticsConfig.locale),
            nonComparable: true,
          },
          'added_entries': {
            format: value => ReportHelper.numberOrNA(value)
          },
          'deleted_entries': {
            format: value => ReportHelper.numberOrNA(value)
          },
          'added_storage_mb': {
            format: value => ReportHelper.numberOrNA(value)
          },
          'deleted_storage_mb': {
            format: value => ReportHelper.numberOrNA(value)
          },
          'added_msecs': {
            format: value => ReportHelper.time(value)
          },
          'deleted_msecs': {
            format: value => ReportHelper.time(value)
          }
        }
      },
      [ReportDataSection.totals]: {
        preSelected: 'added_storage_mb',
        fields: {
          'added_entries': {
            format: value => ReportHelper.numberOrNA(value),
            title: this._translate.instant(`app.bandwidth.added_entries`),
            tooltip: this._translate.instant(`app.bandwidth.added_entries_tt`),
            units: 'MB',
          },
          'deleted_entries': {
            format: value => ReportHelper.numberOrNA(value),
            title: this._translate.instant(`app.bandwidth.deleted_entries`),
            tooltip: this._translate.instant(`app.bandwidth.deleted_entries_tt`),
            units: 'MB',
          },
          'total_entries': {
            format: value => ReportHelper.numberOrNA(value),
            title: this._translate.instant(`app.bandwidth.total_entries`),
            tooltip: this._translate.instant(`app.bandwidth.total_entries_tt`),
            units: 'MB',
          },
          'added_storage_mb': {
            format: value => ReportHelper.numberOrNA(value),
            title: this._translate.instant(`app.bandwidth.added_storage_mb`),
            tooltip: this._translate.instant(`app.bandwidth.added_storage_mb_tt`),
            units: 'MB',
          },
          'deleted_storage_mb': {
            format: value => ReportHelper.numberOrNA(value),
            title: this._translate.instant(`app.bandwidth.deleted_storage_mb`),
            tooltip: this._translate.instant(`app.bandwidth.deleted_storage_mb_tt`),
            units: 'MB',
          },
          'total_storage_mb': {
            format: value => ReportHelper.numberOrNA(value),
            title: this._translate.instant(`app.bandwidth.total_storage_mb`),
            tooltip: this._translate.instant(`app.bandwidth.total_storage_mb_tt`),
            units: 'MB',
          },
          'added_msecs': {
            format: value => ReportHelper.time(value),
            title: this._translate.instant(`app.bandwidth.added_msecs`),
            tooltip: this._translate.instant(`app.bandwidth.added_msecs_tt`),
          },
          'deleted_msecs': {
            format: value => ReportHelper.time(value),
            title: this._translate.instant(`app.bandwidth.deleted_msecs`),
            tooltip: this._translate.instant(`app.bandwidth.deleted_msecs_tt`),
          },
          'total_msecs': {
            format: value => ReportHelper.time(value),
            title: this._translate.instant(`app.bandwidth.total_msecs`),
            tooltip: this._translate.instant(`app.bandwidth.total_msecs_tt`),
          },
        }
      }
    };
  }
}
