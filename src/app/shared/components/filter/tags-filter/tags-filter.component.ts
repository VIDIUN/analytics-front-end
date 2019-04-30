import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { VidiunClient, VidiunFilterPager, VidiunTagFilter, VidiunTaggedObjectType, TagSearchAction } from 'vidiun-ngx-client';
import { Observable, Subject, Unsubscribable } from 'rxjs';
import { cancelOnDestroy } from '@vidiun-ng/vidiun-common';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tags-filter',
  template: `
    <app-autocomplete-filter [label]="'app.filters.tags' | translate"
                             [selectedFilters]="selectedFilters"
                             [provider]="_tagsProvider"
                             (search)="_searchTags($event)"
                             (itemSelected)="itemSelected.emit($event)"
                             (itemUnselected)="itemUnselected.emit($event)"></app-autocomplete-filter>
  `,
})
export class TagsFilterComponent implements OnDestroy {
  @Input() selectedFilters: string[] = [];
  @Output() itemSelected = new EventEmitter();
  @Output() itemUnselected = new EventEmitter();
  
  private _searchTagsSubscription: Unsubscribable;
  
  public _tagsProvider = new Subject();
  
  constructor(private _vidiunServerClient: VidiunClient) {
  }
  
  ngOnDestroy() {
  
  }
  
  public _searchTags(event: any): void {
    this._tagsProvider.next({ suggestions: [], isLoading: true });
    
    if (this._searchTagsSubscription) {
      // abort previous request
      this._searchTagsSubscription.unsubscribe();
      this._searchTagsSubscription = null;
    }
    
    this._searchTagsSubscription = this._searchTagsRequest(event.query)
      .pipe(cancelOnDestroy(this))
      .subscribe(data => {
          const suggestions = [];
          const entryTags = this.selectedFilters || [];
          
          (data || []).forEach(suggestedTag => {
            const isSelectable = !entryTags.find(tag => tag === suggestedTag);
            suggestions.push({ item: suggestedTag, isSelectable: isSelectable });
          });
          this._tagsProvider.next({ suggestions: suggestions, isLoading: false });
        },
        (err) => {
          this._tagsProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
        });
  }
  
  public _searchTagsRequest(text: string): Observable<string[]> {
    return this._vidiunServerClient
      .request(
        new TagSearchAction({
            tagFilter: new VidiunTagFilter({
              tagStartsWith: text,
              objectTypeEqual: VidiunTaggedObjectType.entry
            }),
            pager: new VidiunFilterPager({
              pageIndex: 0,
              pageSize: 30
            })
          }
        ))
      .pipe(map(result => result.objects.map(item => item.tag)));
  }
}
