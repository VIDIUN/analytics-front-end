import { Component } from '@angular/core';
import { VidiunLogger } from '@vidiun-ng/vidiun-logger';

@Component({
    selector: 'app-contributors',
    templateUrl: './contributors.component.html',
    styleUrls: ['./contributors.component.scss'],
    providers: [
      VidiunLogger.createLogger('ContributorsComponent'),
    ]
})
export class ContributorsComponent  {


  constructor() {
  }


}

