import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { VidiunClient, VidiunFilterPager, VidiunUser, VidiunUserFilter, UserListAction } from 'vidiun-ngx-client';
import { Observable, Subject, Unsubscribable } from 'rxjs';
import { map } from 'rxjs/operators';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { TranslateService } from '@ngx-translate/core';
import { DateChangeEvent } from 'shared/components/date-filter/date-filter.service';

@Component({
  selector: 'app-owners-filter',
  template: `
    <app-autocomplete-filter field="id"
                             suggestionLabelField="name"
                             tooltipResolver="__tooltip"
                             classField="__class"
                             [label]="'app.filters.owners' | translate"
                             [selectedFilters]="selectedFilters"
                             [provider]="_usersProvider"
                             (search)="_searchUsers($event)"
                             (itemSelected)="itemSelected.emit($event)"
                             (itemUnselected)="itemUnselected.emit($event)"></app-autocomplete-filter>
  `,
})
export class OwnersFilterComponent implements OnDestroy {
  @Input() selectedFilters: VidiunUser[] = [];
  @Input() dateFilter: DateChangeEvent;

  @Output() itemSelected = new EventEmitter();
  @Output() itemUnselected = new EventEmitter();
  
  private _searchUsersSubscription: Unsubscribable;
  
  public _usersProvider = new Subject();
  
  constructor(private _vidiunServerClient: VidiunClient,
              private _translate: TranslateService) {
  }
  
  ngOnDestroy() {
  
  }
  
  public _searchUsers(event, formControl?): void {
    this._usersProvider.next({ suggestions: [], isLoading: true });
    
    if (this._searchUsersSubscription) {
      // abort previous request
      this._searchUsersSubscription.unsubscribe();
      this._searchUsersSubscription = null;
    }
    
    this._searchUsersSubscription = this._searchUsersRequest(event.query).subscribe(data => {
        const suggestions = [];
        (data || []).forEach((suggestedUser: VidiunUser) => {
          suggestedUser['__tooltip'] = suggestedUser.id;
          let isSelectable = true;
          if (formControl) {
            const owners = this.selectedFilters || [];
            isSelectable = !owners.find(user => user.id === suggestedUser.id);
          }
          suggestions.push({
            name: `${suggestedUser.screenName} (${suggestedUser.id})`,
            item: suggestedUser,
            isSelectable: isSelectable
          });
        });
        this._usersProvider.next({ suggestions: suggestions, isLoading: false });
      },
      (err) => {
        this._usersProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
      });
  }
  
  private _searchUsersRequest(text: string): Observable<VidiunUser[]> {
    return this._vidiunServerClient
      .request(
        new UserListAction({
          filter: new VidiunUserFilter({
            idOrScreenNameStartsWith: text
          }),
          pager: new VidiunFilterPager({
            pageIndex: 0,
            pageSize: 30
          })
        }))
      .pipe(cancelOnDestroy(this), map(response => response.objects));
  }
}
