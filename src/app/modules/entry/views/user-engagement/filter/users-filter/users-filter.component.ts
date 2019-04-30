import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { VidiunClient, VidiunFilterPager, VidiunUser, VidiunUserFilter, UserListAction } from 'vidiun-ngx-client';
import { Observable, Subject, Unsubscribable } from 'rxjs';
import { map } from 'rxjs/operators';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { AutoComplete, SuggestionsProviderData } from '@vidiun-ng/vidiun-primeng-ui';

@Component({
  selector: 'app-engagement-users-filter',
  template: `
    <vAutoComplete #searchUsers
                   appendTo="body"
                   suggestionItemField="item"
                   suggestionLabelField="name"
                   field="screenName"
                   [placeholder]="'app.filters.filterUsers' | translate"
                   [minLength]="3"
                   [suggestionsProvider]="_usersProvider"
                   (onSelect)="_onSuggestionSelected()"
                   (completeMethod)="_searchUsers($event, true)"></vAutoComplete>
  `,
})
export class UsersFilterComponent implements OnDestroy {
  @Input() set selectedUsers(value: VidiunUser[]) {
    if (Array.isArray(value)) {
      this._selectedUsers = value;
    }
  }
  @Output() itemSelected = new EventEmitter();
  
  @ViewChild('searchUsers') _autoComplete: AutoComplete = null;
  
  private _selectedUsers: VidiunUser[] = [];
  private _searchUsersSubscription: Unsubscribable;
  
  public _usersProvider = new Subject<SuggestionsProviderData>();
  
  constructor(private _vidiunServerClient: VidiunClient) {
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
            isSelectable = !(this._selectedUsers || []).find(user => user.id === suggestedUser.id);
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
  
  public _onSuggestionSelected(): void {
    
    const selectedItem = this._autoComplete.getValue() as VidiunUser;
    // clear user text from component
    this._autoComplete.clearValue();
    
    if (selectedItem && !(this._selectedUsers || []).find(user => user.id === selectedItem.id)) {
      this._selectedUsers.push(selectedItem);
      this.itemSelected.emit(selectedItem);
    }
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
