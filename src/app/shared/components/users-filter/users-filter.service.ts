import { Injectable, OnDestroy } from '@angular/core';
import { VidiunClient, VidiunUserFilter, VidiunFilterPager, UserListAction, VidiunUser } from 'vidiun-ngx-client';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';

@Injectable()
export class UsersFilterService implements OnDestroy {

  constructor(private _vidiunClient: VidiunClient) {
  }

  public searchUsers(text: string): Observable<VidiunUser[]> {
    return Observable.create(
      observer => {
        const requestSubscription: ISubscription = this._vidiunClient.request(
          new UserListAction(
            {
              filter: new VidiunUserFilter({
                idOrScreenNameStartsWith : text
              }),
              pager: new VidiunFilterPager({
                pageIndex : 0,
                pageSize : 30
              })
            }
          )
        )
          .pipe(cancelOnDestroy(this))
          .subscribe(
            result => {
              observer.next(result.objects);
              observer.complete();
            },
            err => {
              observer.error(err);
            }
          );

        return () => {
          console.log('search users: cancelled');
          requestSubscription.unsubscribe();
        };
      });
  }

  ngOnDestroy() {
  }


}

