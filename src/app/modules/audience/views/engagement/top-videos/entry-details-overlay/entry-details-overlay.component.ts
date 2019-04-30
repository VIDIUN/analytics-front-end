import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  BaseEntryGetAction,
  VidiunClient,
  VidiunDetachedResponseProfile,
  VidiunMediaEntry,
  VidiunMediaType,
  VidiunMultiRequest,
  VidiunMultiResponse,
  VidiunRequestOptions,
  VidiunResponseProfileType,
  VidiunUser,
  UserGetAction
} from 'vidiun-ngx-client';
import { Unsubscribable } from 'rxjs';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { map } from 'rxjs/operators';
import { analyticsConfig } from 'configuration/analytics-config';
import { TranslateService } from '@ngx-translate/core';

export interface EntryDetailsOverlayData {
  name: string;
  type: VidiunMediaType;
  creator: string;
  creationDate: Date;
  duration: number;
  thumbnailUrl: string;
}

@Component({
  selector: 'app-entry-details-overlay',
  templateUrl: './entry-details-overlay.component.html',
  styleUrls: ['./entry-details-overlay.component.scss'],
})
export class EntryDetailsOverlayComponent implements OnInit, OnDestroy {
  @Input() entryId: string;
  
  private _requestSubscription: Unsubscribable;
  private _partnerId = analyticsConfig.pid;
  private _apiUrl = analyticsConfig.vidiunServer.uri.startsWith('http')
    ? analyticsConfig.vidiunServer.uri
    : `${location.protocol}//${analyticsConfig.vidiunServer.uri}`;
  
  public _data: EntryDetailsOverlayData;
  public _loading = false;
  public _errorMessage: string;
  
  constructor(private _vidiunClient: VidiunClient,
              private _translate: TranslateService) {
    
  }
  
  ngOnInit(): void {
    if (!this.entryId) {
      return;
    }
    
    this._loading = true;
    
    if (this._requestSubscription) {
      this._requestSubscription.unsubscribe();
      this._requestSubscription = null;
    }
    
    const request = new VidiunMultiRequest(
      new BaseEntryGetAction({ entryId: this.entryId })
        .setRequestOptions({
          responseProfile: new VidiunDetachedResponseProfile({
            type: VidiunResponseProfileType.includeFields,
            fields: 'id,name,mediaType,createdAt,msDuration,userId'
          })
        }),
      new UserGetAction({ userId: '' })
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
    
    this._requestSubscription = this._vidiunClient
      .multiRequest(request)
      .pipe(
        cancelOnDestroy(this),
        map((responses: VidiunMultiResponse) => {
          if (responses.hasErrors()) {
            throw Error(this._translate.instant('app.engagement.topVideosReport.errorLoadingEntry'));
          }
          
          const entry = responses[0].result as VidiunMediaEntry;
          const user = responses[1].result as VidiunUser;
          
          return {
            name: entry.name,
            type: entry.mediaType,
            creator: user.fullName,
            creationDate: entry.createdAt,
            duration: entry.msDuration,
            thumbnailUrl: `${this._apiUrl}/p/${this._partnerId}/sp/${this._partnerId}00/thumbnail/entry_id/${entry.id}/width/450/height/210?rnd=${Math.random()}`
          };
        })
      )
      .subscribe(
        (data: EntryDetailsOverlayData) => {
          this._loading = false;
          this._data = data;
        },
        error => {
          this._loading = false;
          this._errorMessage = error.message;
        });
  }
  
  ngOnDestroy(): void {
  
  }
}
