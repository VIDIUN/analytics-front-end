import { Component, OnDestroy, OnInit } from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaAssetParamsOrigin, KalturaClient, KalturaDVRStatus, KalturaEntryServerNode, KalturaEntryServerNodeStatus, KalturaLiveEntry, KalturaRecordStatus } from 'kaltura-ngx-client';
import { analyticsConfig } from 'configuration/analytics-config';
import { FrameEventManagerService, FrameEvents } from 'shared/modules/frame-event-manager/frame-event-manager.service';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { filter, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorsManagerService } from 'shared/services';
import { EntryLiveService } from './entry-live.service';

export interface KalturaExtendedLiveEntry extends KalturaLiveEntry {
  dvr: boolean;
  recording: boolean;
  transcoding: boolean;
  redundancy: boolean;
}

@Component({
  selector: 'app-entry-live',
  templateUrl: './entry-live-view.component.html',
  styleUrls: ['./entry-live-view.component.scss'],
})
export class EntryLiveViewComponent implements OnInit, OnDestroy {
  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage;
  public _entryId: string;
  public _entry: KalturaExtendedLiveEntry;
  
  constructor(private _frameEventManager: FrameEventManagerService,
              private _errorsManager: ErrorsManagerService,
              private _router: Router,
              private _kalturaClient: KalturaClient,
              private _route: ActivatedRoute,
              private _entryLiveService: EntryLiveService) {
  }
  
  
  ngOnInit() {
    if (analyticsConfig.isHosted) {
      this._frameEventManager
        .listen(FrameEvents.UpdateFilters)
        .pipe(
          cancelOnDestroy(this),
          filter(Boolean),
          map(({ queryParams }) => queryParams['id'] || null),
        )
        .subscribe(entryId => {
          this._entryId = entryId;
          this._loadEntryData();
        });
    } else {
      this._route.params
        .pipe(
          cancelOnDestroy(this),
          map(({ id }) => id || null)
        )
        .subscribe(entryId => {
          this._entryId = entryId;
          this._loadEntryData();
        });
    }
  }
  
  ngOnDestroy() {
  
  }
  
  private _getRedundancyStatus(serverNodeList: KalturaEntryServerNode[]): boolean {
    if (serverNodeList.length > 1) {
      return serverNodeList.every(sn => sn.status !== KalturaEntryServerNodeStatus.markedForDeletion);
    }
    return false;
  }
  
  public _loadEntryData(): void {
    if (!this._entryId) {
      return;
    }
    
    this._isBusy = true;
    
    this._entryLiveService.getEntryData(this._entryId)
      .pipe(cancelOnDestroy(this))
      .subscribe(
        ({ profiles, entry, nodes }) => {
          this._blockerMessage = null;
          this._isBusy = false;
          this._entry = Object.assign(entry, {
            dvr: entry.dvrStatus === KalturaDVRStatus.enabled,
            recording: entry.recordStatus !== KalturaRecordStatus.disabled,
            transcoding: !!profiles.find(({ origin }) => origin === KalturaAssetParamsOrigin.convert),
            redundancy: this._getRedundancyStatus(nodes),
          });
        },
        error => {
          this._isBusy = false;
          const actions = {
            'close': () => {
              this._blockerMessage = null;
            },
            'retry': () => {
              this._loadEntryData();
            },
          };
          this._blockerMessage = this._errorsManager.getErrorMessage(error, actions);
        });
  }
  
  public _navigateToEntry(): void {
    if (analyticsConfig.isHosted) {
      this._frameEventManager.publish(FrameEvents.NavigateTo, '/content/entries/entry/' + this._entryId);
    }
  }
  
  public _back(): void {
    if (analyticsConfig.isHosted) {
      this._frameEventManager.publish(FrameEvents.EntryNavigateBack);
    } else {
      this._router.navigate(['audience/engagement'], { queryParams: this._route.snapshot.queryParams });
    }
  }
}