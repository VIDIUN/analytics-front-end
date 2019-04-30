import { Pipe, PipeTransform } from '@angular/core';
import { VidiunMediaType } from 'vidiun-ngx-client';
import { TranslateService } from '@ngx-translate/core';

@Pipe({name: 'mediaType'})
export class MediaTypePipe implements PipeTransform {

    constructor(private translate: TranslateService) {
    }

    transform(value, isTooltip: boolean): string {
        let className = "";
        let tooltip = "";
        if (typeof(value) !== 'undefined' && value !== null) {
            switch (value) {
                case VidiunMediaType.video:
                    className = 'vIconvideo-small';
                    tooltip = this.translate.instant("app.entry.entryType.video");
                    break;
                case VidiunMediaType.image:
                    tooltip = this.translate.instant("app.entry.entryType.image");
                    className = 'vIconimage-small';
                    break;
                case VidiunMediaType.audio:
                    tooltip = this.translate.instant("app.entry.entryType.audio");
                    className = 'vIconsound-small';
                    break;
                case VidiunMediaType.liveStreamFlash:
                case VidiunMediaType.liveStreamQuicktime:
                case VidiunMediaType.liveStreamRealMedia:
                case VidiunMediaType.liveStreamWindowsMedia:
                    tooltip = this.translate.instant("app.entry.entryType.live");
                    className = 'vIconlive_transcoding';
                    break;
                default:
                    tooltip = this.translate.instant("app.entry.entryType.unknown");
                    className = 'vIconfile-small';
                    break;
            }
        }
        if (isTooltip) {
            return tooltip;
        } else {
            return className;
        }
    }
}
