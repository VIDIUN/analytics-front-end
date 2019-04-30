import { Pipe, PipeTransform } from '@angular/core';
import { TableModes } from '../video-performance.component';

@Pipe({
  name: 'tableModeIcon'
})
export class TableModeIconPipe implements PipeTransform {
  transform(value: TableModes): string {
    switch (value) {
      case TableModes.users:
        return 'vIconuser';
      case TableModes.dates:
        return 'vIconcalendar';
      default:
        return '';
    }
  }

}
