import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VidiunEntryType } from 'vidiun-ngx-client';

@Pipe({ name: 'appEntryType' })
export class EntryTypePipe implements PipeTransform {
  constructor(private _translate: TranslateService) {
  
  }
  
  transform(type: VidiunEntryType): string {
    switch (type) {
      case VidiunEntryType.mediaClip:
        return this._translate.instant('app.entryType.video');
      case VidiunEntryType.playlist:
        return this._translate.instant('app.entryType.playlist');
      case VidiunEntryType.liveStream:
        return this._translate.instant('app.entryType.live');
      case VidiunEntryType.document:
        return this._translate.instant('app.entryType.document');
      default:
        return this._translate.instant('app.entryType.other');
    }
  }
}
