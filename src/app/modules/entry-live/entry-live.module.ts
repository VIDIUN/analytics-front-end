import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { NgxEchartsModule } from 'shared/ngx-echarts/ngx-echarts.module';

import { routing } from './entry-live.routes';
import { EntryLiveViewComponent } from './entry-live-view.component';
import { SharedModule } from 'shared/shared.module';
import { AreaBlockerModule, KalturaUIModule, TagsModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { TableModule } from 'primeng/table';
import { EntryDetailsComponent } from './views/entry-details/entry-details.component';
import { LivePlayerComponent } from './views/live-player/live-player.component';
import { LiveStatusComponent } from './views/live-status/live-status.component';
import { LiveStatusWidget } from './views/live-status/live-status.widget';
import { EntryLiveService } from './entry-live.service';


@NgModule({
  imports: [
    AreaBlockerModule,
    TagsModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    DropdownModule,
    ButtonModule,
    PaginatorModule,
    SharedModule,
    TableModule,
    TooltipModule,
    NgxEchartsModule,
    RouterModule.forChild(routing),
    KalturaUIModule,
  ],
  declarations: [
    EntryLiveViewComponent,
    EntryDetailsComponent,
    LivePlayerComponent,
    LiveStatusComponent
  ],
  exports: [],
  providers: [
    EntryLiveService,
    LiveStatusWidget,
  ]
})
export class EntryLiveModule {
}