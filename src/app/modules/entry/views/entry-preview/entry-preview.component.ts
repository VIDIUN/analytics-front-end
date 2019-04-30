import { Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { Tab } from 'shared/components/report-tabs/report-tabs.component';
import {
  VidiunFilterPager,
  VidiunObjectBaseFactory,
  VidiunReportInputFilter,
  VidiunReportInterval
} from 'vidiun-ngx-client';
import { AreaBlockerMessage } from '@vidiun-ng/vidiun-ui';
import { AuthService, ErrorsManagerService, ReportService } from 'shared/services';
import { CompareService } from 'shared/services/compare.service';
import { ReportDataConfig } from 'shared/services/storage-data-base.config';
import { TranslateService } from '@ngx-translate/core';
import { EntryPreviewConfig } from './entry-preview.config';
import { FrameEventManagerService } from 'shared/modules/frame-event-manager/frame-event-manager.service';
import { analyticsConfig, getVidiunServerUri } from 'configuration/analytics-config';
import { DateChangeEvent } from 'shared/components/date-filter/date-filter.service';
import { VidiunPlayerComponent } from 'shared/player';
import { EntryBase } from '../entry-base/entry-base';

@Component({
  selector: 'app-entry-preview',
  templateUrl: './entry-preview.component.html',
  styleUrls: ['./entry-preview.component.scss'],
  providers: [EntryPreviewConfig, ReportService]
})
export class EntryPreviewComponent extends EntryBase implements OnInit {
  @Input() entryId = '';

  private _dataConfig: ReportDataConfig;

  protected _dateFilter: DateChangeEvent;
  protected _componentId = 'preview';

  public _isBusy: boolean;
  public _blockerMessage: AreaBlockerMessage = null;
  public _tabsData: Tab[] = [];
  public _reportInterval = VidiunReportInterval.days;
  public _compareFilter: VidiunReportInputFilter = null;
  public _pager = new VidiunFilterPager({ pageSize: 25, pageIndex: 1 });
  public _filter = new VidiunReportInputFilter({
    searchInTags: true,
    searchInAdminTags: false
  });

  private playerInstance: any = null;
  public _isPlaying = false;
  private playerInitialized = false;

  public _playerConfig: any = {};
  public serverUri = getVidiunServerUri();
  public _playerPlayed = false;
  public _playProgress = 0;

  public _chartOptions = {};

  @ViewChild('player') player: VidiunPlayerComponent;

  public get _isCompareMode(): boolean {
    return this._compareFilter !== null;
  }
  
  constructor(private _frameEventManager: FrameEventManagerService,
              private _translate: TranslateService,
              private zone: NgZone,
              private _reportService: ReportService,
              private _compareService: CompareService,
              private _errorsManager: ErrorsManagerService,
              private _authService: AuthService,
              private _dataConfigService: EntryPreviewConfig) {
    super();
    this._dataConfig = _dataConfigService.getConfig();
  }

  ngOnInit() {
    this.initPlayer();

    this._chartOptions = {
      grid: {
        left: 0,
        right: 0,
        top: 18,
        bottom: 0
      },
      xAxis: {
        show: false,
        boundaryGap : false,
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      tooltip : {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      yAxis: {
        zlevel: 1,
        type: 'value',
        position: 'right',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          inside: true,
          margin: 4,
          verticalAlign: 'bottom',
          color: '#ffffff'
        }
      },
      series: [{
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        areaStyle: {}
      }]
    };
  }
  
  protected _loadReport(sections = this._dataConfig): void {
    console.log("Load report...");
  }
  
  protected _updateRefineFilter(): void {
  }
  
  protected _updateFilter(): void {
    this._filter.timeZoneOffset = this._dateFilter.timeZoneOffset;
    this._filter.fromDay = this._dateFilter.startDay;
    this._filter.toDay = this._dateFilter.endDay;
    this._filter.interval = this._dateFilter.timeUnits;
    this._reportInterval = this._dateFilter.timeUnits;
    this._pager.pageIndex = 1;
    if (this._dateFilter.compare.active) {
      const compare = this._dateFilter.compare;
      this._compareFilter = Object.assign(VidiunObjectBaseFactory.createObject(this._filter), this._filter);
      this._compareFilter.fromDay = compare.endDay;
      this._compareFilter.toDay = this._dateFilter.endDay;
    } else {
      this._compareFilter = null;
    }
  }


  /* ------------------------ start of player logic --------------------------*/

  private initPlayer(): void {
    if (!this.playerInitialized) {
      this.playerInitialized = true;
      this._playerConfig = {
        uiconfid: analyticsConfig.vidiunServer.previewUIConf,  // serverConfig.vidiunServer.previewUIConf,
        pid: analyticsConfig.pid,
        entryid: this.entryId,
        flashvars: {
          'controlBarContainer': {'plugin': false},
          'largePlayBtn': {'plugin': false},
          'vs': analyticsConfig.vs
        }
      };
      setTimeout(() => {
        this.player.Embed();
      }, 0);
    }
  }

  public onPlayerReady(player): void {
    this.playerInstance = player;
    const entryDuration = this.playerInstance.evaluate('{duration}');
    // register to playhead update event to update our scrubber
    this.playerInstance.vBind('playerUpdatePlayhead', (event) => {
      this.zone.run(() => {
        this._playProgress =  parseFloat((event / this.playerInstance.evaluate('{duration}')).toFixed(2)) * 100;
      });
    });
    this.playerInstance.vBind('playerPlayEnd', (event) => {
      this.zone.run(() => {
        this._playProgress = 100;
      });
    });

    // we need to disable the player receiving clicks that toggle playback
    setTimeout(() => {
      const playerIframe = document.getElementById('vidiun_player_analytics_ifp');
      const doc = playerIframe['contentDocument'] || playerIframe['contentWindow'].document;
      if (doc) {
        doc.getElementsByClassName('mwEmbedPlayer')[0].style.pointerEvents = 'none';
      }
    }, 250); // use a timeout as player ready event still issues some async initialization calls
  }

  public _togglePlayback(): void {
    this._isPlaying = !this._isPlaying;
    this._playerPlayed = true;
    const command = this._isPlaying ? 'doPlay' : 'doPause';
    this.playerInstance.sendNotification(command);
  }

  /* -------------------------- end of player logic --------------------------*/


}


