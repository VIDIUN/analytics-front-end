import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { VidiunClient, VidiunDetachedResponseProfile, VidiunResponseProfileType, VidiunUser, UserGetAction } from 'vidiun-ngx-client';
import { Unsubscribable } from 'rxjs';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contributor-details-overlay',
  templateUrl: './contributor-details-overlay.component.html',
  styleUrls: ['./contributor-details-overlay.component.scss'],
})
export class ContributorDetailsOverlayComponent implements OnInit, OnDestroy {
  @Input() userId: string;
  
  private _requestSubscription: Unsubscribable;
  public _data: VidiunUser;
  public _loading = false;
  public _errorMessage: string;
  
  constructor(private _vidiunClient: VidiunClient,
              private _translate: TranslateService) {
    
  }
  
  ngOnInit(): void {
    if (!this.userId) {
      return;
    }
    
    this._loading = true;
    
    if (this._requestSubscription) {
      this._requestSubscription.unsubscribe();
      this._requestSubscription = null;
    }
    
    const action = new UserGetAction({ userId: this.userId }).setRequestOptions({
      responseProfile: new VidiunDetachedResponseProfile({
        type: VidiunResponseProfileType.includeFields,
        fields: 'id,name,fullName,createdAt,roleNames,email'
      })
    });
    this._requestSubscription = this._vidiunClient
      .request(action)
      .pipe(cancelOnDestroy(this))
      .subscribe(
        (data: VidiunUser) => {
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
