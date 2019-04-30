import { Component } from '@angular/core';
import { LocationsFilterService } from 'shared/components/filter/location-filter/locations-filter.service';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { FilterComponent } from 'shared/components/filter/filter.component';
import { ReportService } from 'shared/services';

@Component({
  selector: 'app-geo-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [ReportService, LocationsFilterService, VidiunLogger.createLogger('GeoFilterComponent')],
  animations: [
    trigger('state', [
      state('visible', style({ height: '*', opacity: 1 })),
      state('hidden', style({ height: '0', opacity: 0 })),
      transition('* => visible', [
        style({ height: '0', opacity: 0 }),
        group([
          animate(300, style({ height: '*' })),
          animate('400ms ease-in-out', style({ 'opacity': '1' }))
        ])
      ]),
      transition('visible => hidden', [
        style({ height: '*', opacity: 1 }),
        group([
          animate(300, style({ height: 0 })),
          animate('200ms ease-in-out', style({ 'opacity': '0' }))
        ])
      ])
    ])
  ]
})
export class GeoFilterComponent extends FilterComponent {
}
