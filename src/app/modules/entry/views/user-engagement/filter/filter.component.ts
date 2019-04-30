import { Component, Input } from '@angular/core';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { FilterComponent } from 'shared/components/filter/filter.component';

@Component({
  selector: 'app-user-engagement-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [VidiunLogger.createLogger('UserEngagementFilterComponent')],
})
export class UserEngagementFilterComponent extends FilterComponent {
  @Input() totalCount = 0;

  public _onItemSelected(item: any, type: string): void {
    super._onItemSelected(item, type);
    this._apply();
  }
  
  public _apply(forceApply = false): void {
    super._apply(forceApply);
    this._bottomPadding = '0';
  }
}
