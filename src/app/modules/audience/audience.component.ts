import { Component } from '@angular/core';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
    selector: 'app-audience',
    templateUrl: './audience.component.html',
    styleUrls: ['./audience.component.scss'],
    providers: [VidiunLogger.createLogger('AudienceComponent')]
})
export class AudienceComponent  {


  constructor() {
  }


}

