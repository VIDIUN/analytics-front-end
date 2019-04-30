import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LiveReportsComponent } from './live-reports.component';
import { routing } from './live-reports.routes';
import { VidiunUIModule } from '@vidiun-ng/vidiun-ui';

@NgModule({
  imports: [
    RouterModule.forChild(routing),
    VidiunUIModule
  ],
  declarations: [
    LiveReportsComponent
  ]
})
export class LiveReportsModule {
}
