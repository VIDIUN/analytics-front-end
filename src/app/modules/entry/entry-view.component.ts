import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import {
  BaseEntryGetAction,
  VidiunClient,
  VidiunDetachedResponseProfile,
  VidiunMediaEntry,
  VidiunMediaType,
  VidiunMultiRequest,
  VidiunMultiResponse,
  VidiunReportInputFilter,
  VidiunReportInterval,
  VidiunReportType,
  VidiunRequestOptions,
  VidiunResponseProfileType,
  VidiunUser,
  UserGetAction
} from 'vidiun-ngx-client';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { DateChangeEvent, DateRanges } from 'shared/components/date-filter/date-filter.service';
import { RefineFilter } from 'shared/components/filter/filter.component';
import { FrameEventManagerService, FrameEvents } from 'shared/modules/frame-event-manager/frame-event-manager.service';
import { analyticsConfig } from 'configuration/analytics-config';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { ErrorsManagerService } from 'shared/services';
import { TranslateService } from '@ngx-translate/core';
import { DateFilterUtils } from 'shared/components/date-filter/date-filter-utils';
import { ExportItem } from 'shared/components/export-csv/export-csv.component';
import { EntryExportConfig } from './entry-export.config';

@Component({
  selector: 'app-entry',
  templateUrl: './entry-view.component.html',
  styleUrls: ['./entry-view.component.scss'],
  providers: [
    EntryExportConfig,
  ]
})
export class EntryViewComponent implements OnInit, OnDestroy {
  public _loadingEntry = false;
  public _creationDate: moment.Moment = null;
  public _selectedRefineFilters: RefineFilter = null;
  public _dateRange = DateRanges.Last30D;
  public _timeUnit = VidiunReportInterval.days;
  public _totalCount: number;
  public _reportType: VidiunReportType = VidiunReportType.userUsage;
  public _selectedMetrics: string;
  public _dateFilter: DateChangeEvent = null;
  public _refineFilter: RefineFilter = null;
  public _refineFilterOpened = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _exportConfig: ExportItem[] = [];
  public _filter: VidiunReportInputFilter = new VidiunReportInputFilter(
    {
      searchInTags: true,
      searchInAdminTags: false
    }
  );

  private requestSubscription: ISubscription;
  private subscription: ISubscription;


  public _entryId = '';
  public _duration = 0;
  public _entryName = '';
  public _entryType: VidiunMediaType = null;
  public _owner = '';

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _translate: TranslateService,
              private _vidiunClient: VidiunClient,
              private _errorsManager: ErrorsManagerService,
              private _frameEventManager: FrameEventManagerService,
              private _exportConfigService: EntryExportConfig) {
    this._exportConfig = _exportConfigService.getConfig();
  }

  ngOnInit() {
    if (analyticsConfig.isHosted) {
      this._frameEventManager
        .listen(FrameEvents.UpdateFilters)
        .pipe(cancelOnDestroy(this), filter(Boolean))
        .subscribe(({ queryParams }) => {
          this._entryId = queryParams['id'];
          if (this._entryId) {
            this.loadEntryDetails();
          }
        });
    } else {
      this.subscription = this._route.params.subscribe(params => {
        this._entryId = params['id'];
        if (this._entryId) {
          this.loadEntryDetails();
        }
      });
    }

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    
    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
      this.requestSubscription = null;
    }
  }

  public _onDateFilterChange(event: DateChangeEvent): void {
    this._dateFilter = event;
  }

  public _onRefineFilterChange(event: RefineFilter): void {
    this._refineFilter = event;
  }

  private loadEntryDetails(): void {
    this._loadingEntry = true;
    this._blockerMessage = null;

    const request = new VidiunMultiRequest(
      new BaseEntryGetAction({ entryId: this._entryId })
        .setRequestOptions({
          responseProfile: new VidiunDetachedResponseProfile({
            type: VidiunResponseProfileType.includeFields,
            fields: 'name,mediaType,createdAt,msDuration,userId'
          })
        }),
      new UserGetAction({ userId: null })
        .setDependency(['userId', 0, 'userId'])
        .setRequestOptions(
          new VidiunRequestOptions({
            responseProfile: new VidiunDetachedResponseProfile({
              type: VidiunResponseProfileType.includeFields,
              fields: 'id,fullName'
            })
          })
        )
    );

    this.requestSubscription = this._vidiunClient
      .multiRequest(request)
      .pipe(
        cancelOnDestroy(this),
        map((responses: VidiunMultiResponse) => {
          if (responses.hasErrors()) {
            const err =  Error(responses.reduce((acc, val) => `${acc}\n${val.error ? val.error.message : ''}`, ''));
            this.requestSubscription = null;

            this._blockerMessage = new AreaBlockerMessage({
              title: this._translate.instant('app.common.error'),
              message: err.message,
              buttons: [{
                label: this._translate.instant('app.common.ok'),
                action: () => {
                  this._blockerMessage = null;
                  this._loadingEntry = false;
                }}]
            });
          }
  
          return [responses[0].result, responses[1].result] as [VidiunMediaEntry, VidiunUser];
        })
      )
      .subscribe(
        ([entry, user]) => {
          this._entryName = entry.name;
          this._entryType = entry.mediaType;
          this._duration = entry.msDuration || 0;
          this._creationDate = DateFilterUtils.getMomentDate(entry.createdAt);
          this._owner = user.fullName;
          this.requestSubscription = null;
          this._loadingEntry = false;
        },
        error => {
          this.requestSubscription = null;
          this._loadingEntry = false;
          const actions = {
            'close': () => {
              this._blockerMessage = null;
            },
            'retry': () => {
              this.loadEntryDetails();
            }
          };
          this._blockerMessage = this._errorsManager.getErrorMessage(error, actions);
        });
  }

  public _back(): void {
    if (analyticsConfig.isHosted) {
      this._frameEventManager.publish(FrameEvents.EntryNavigateBack);
    } else {
      this._router.navigate(['audience/engagement'], { queryParams: this._route.snapshot.queryParams });
    }
  }

  public _navigateToEntry(): void {
    if (analyticsConfig.isHosted) {
      this._frameEventManager.publish(FrameEvents.NavigateTo, '/content/entries/entry/' + this._entryId);
    }
  }

}
