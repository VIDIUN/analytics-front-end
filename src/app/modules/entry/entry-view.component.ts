import { Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import {
  BaseEntryGetAction,
  VidiunBaseEntry,
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
  VidiunResponseProfileType, VidiunUser,
  UserGetAction
} from "vidiun-ngx-client";
import {cancelOnDestroy} from "@vidiun-ng/vidiun-common";
import {DateChangeEvent, DateRanges} from "shared/components/date-filter/date-filter.service";
import {RefineFilter} from "shared/components/filter/filter.component";
import {FrameEventManagerService, FrameEvents} from "shared/modules/frame-event-manager/frame-event-manager.service";
import { analyticsConfig } from 'configuration/analytics-config';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-entry',
  templateUrl: './entry-view.component.html',
  styleUrls: ['./entry-view.component.scss']
})
export class EntryViewComponent implements OnInit, OnDestroy {

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
  public _filter: VidiunReportInputFilter = new VidiunReportInputFilter(
    {
      searchInTags: true,
      searchInAdminTags: false
    }
  );

  private requestSubscription: ISubscription;
  private subscription: ISubscription;


  public _entryId = '';
  public _entryName = '';
  public _entryType: VidiunMediaType = null;
  public _owner = '';

  constructor(private _router: Router,
              private route: ActivatedRoute,
              private zone: NgZone,
              private _vidiunClient: VidiunClient,
              private _frameEventManager: FrameEventManagerService) { }

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
      this.subscription = this.route.params.subscribe(params => {
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
    const request = new VidiunMultiRequest(
      new BaseEntryGetAction({ entryId: this._entryId })
        .setRequestOptions({
          responseProfile: new VidiunDetachedResponseProfile({
            type: VidiunResponseProfileType.includeFields,
            fields: 'name,mediaType'
          })
        }),
      new UserGetAction({ userId: null })
        .setRequestOptions(
          new VidiunRequestOptions({
            responseProfile: new VidiunDetachedResponseProfile({
              type: VidiunResponseProfileType.includeFields,
              fields: 'id,fullName'
            })
          }).setDependency(['userId', 0, 'userId'])
        )
    );

    this.requestSubscription = this._vidiunClient
      .multiRequest(request)
      .pipe(
        cancelOnDestroy(this),
        map((responses: VidiunMultiResponse) => {
          if (responses.hasErrors()) {
            throw Error(responses.reduce((acc, val) => `${acc}\n${val.error ? val.error.message : ''}`, ''));
          }
  
          return [responses[0].result, responses[1].result] as [VidiunMediaEntry, VidiunUser];
        })
      )
      .subscribe(
        ([entry, user]) => {
          this._entryName = entry.name;
          this._entryType = entry.mediaType;
          this._owner = user.fullName;
          this.requestSubscription = null;
        },
        error => {
          console.error("Failed to load entry name: " + error.message);
          this.requestSubscription = null;
        });
  }

  public _back(): void {
    if (analyticsConfig.isHosted) {
      this._frameEventManager.publish(FrameEvents.EntryNavigateBack);
    } else {
      this._router.navigateByUrl('/audience/engagement');
    }
  }

  public _navigateToEntry(): void {
    this._frameEventManager.publish(FrameEvents.NavigateTo, '/content/entries/entry/' + this._entryId);
  }

}
