import { Component } from '@angular/core';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
    selector: 'app-bandwidth',
    templateUrl: './bandwidth.component.html',
    styleUrls: ['./bandwidth.component.scss'],
    providers: [
      VidiunLogger.createLogger('BandwidthComponent'),
    ]
})
export class BandwidthComponent  {


  constructor() {
  }


}

