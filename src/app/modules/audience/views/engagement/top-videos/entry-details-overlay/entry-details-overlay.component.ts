import { Component, Input } from '@angular/core';
import {VidiunEntryStatus, VidiunMediaType} from 'vidiun-ngx-client';

export interface EntryDetailsOverlayData {
  object_id: string;
  entry_name: string;
  media_type: VidiunMediaType;
  creator_name: string;
  created_at: string;
  duration_msecs: string;
  thumbnailUrl: string;
  status: VidiunEntryStatus;
}

@Component({
  selector: 'app-entry-details-overlay',
  templateUrl: './entry-details-overlay.component.html',
  styleUrls: ['./entry-details-overlay.component.scss'],
})
export class EntryDetailsOverlayComponent {
  @Input() entryData: EntryDetailsOverlayData;
}
