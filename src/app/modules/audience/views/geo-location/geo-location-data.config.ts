import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ReportDataConfig, ReportDataSection, ReportDataBaseConfig} from 'shared/services/storage-data-base.config';
import {ReportHelper} from 'shared/services';
import {EChartOption} from 'echarts';

@Injectable()
export class GeoLocationDataConfig extends ReportDataBaseConfig {
  constructor(_translate: TranslateService) {
    super(_translate);
  }

  public getConfig(): ReportDataConfig {
    return {
      [ReportDataSection.table]: {
        fields: {
          'object_id': {
            format: value => value,
            nonComparable: true,
          },
          'country': {
            format: value => value,
            nonComparable: true,
          },
          'region': {
            format: value => value,
            nonComparable: true,
          },
          'city': {
            format: value => value,
            nonComparable: true,
          },
          'count_plays': {
            format: value => ReportHelper.numberOrNA(value)
          },
          'unique_known_users': {
            format: value => ReportHelper.numberOrNA(value)
          },
          'avg_view_drop_off': {
            format: value => ReportHelper.percents(value)
          },
          'coordinates': {
            format: value => value
          }
        }
      },
      [ReportDataSection.totals]: {
        units: '',
        preSelected: 'count_plays',
        fields: {
          'count_plays': {
            format: value => ReportHelper.numberOrNA(value),
            title: this._translate.instant(`app.audience.geo.count_plays`),
            tooltip: this._translate.instant(`app.audience.geo.count_plays_tt`),
          },
          'unique_known_users': {
            format: value => ReportHelper.numberOrNA(value),
            title: this._translate.instant(`app.audience.geo.unique_known_users`),
            tooltip: this._translate.instant(`app.audience.geo.unique_known_users_tt`),
          },
          'avg_view_drop_off': {
            format: value => ReportHelper.percents(value),
            title: this._translate.instant(`app.audience.geo.avg_view_drop_off`),
            tooltip: this._translate.instant(`app.audience.geo.avg_view_drop_off_tt`),
          }
        }
      }
    };
  }

  public getMapConfig(scatter: boolean): EChartOption {
    let config =  {
      textStyle: {
        fontFamily: 'Lato',
      },
      grid: {
        top: 24, left: 24, bottom: 24, right: 24, containLabel: true
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#dadada',
        borderWidth: 1,
        padding: 8,
        extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
        textStyle: {
          color: '#333333',
          fontWeight: 'bold'
        },
        formatter: (params) => {
          if (params.name && params.data && params.data.value && params.data.value.length === 3) {
            let tooltip = '<span style="color: #999999">' + params.name + '</span><br/>' + params.seriesName + ' : ' + params.data.value[2];
            if (params.seriesName === 'Avg. Drop Off') {
              tooltip = tooltip + '%';
            }
            return tooltip;
          } else {
            return this._translate.instant('app.common.na');
          }
        }
      },
      visualMap: {
        show: false,
        min: 0,
        max: 1000000,
        left: 16,
        center: [0, 0],
        calculable: true,
        inRange: {
          color: ['#B4E9FF', '#2541B8']
        }
      },
      series: []
    };
    if (scatter) {
      config['geo'] = {
        map: 'world',
          center: [0, 0],
          top: 70,
          zoom: 1.2,
          roam: false,
          label: {
          emphasis: {
            show: true
          }
        },
        itemStyle: {
          areaColor: '#ebebeb',
            borderColor: '#999999',
            emphasis: {
            label: {
              show: true
            },
            areaColor: '#F8A61A'
          }
        },
      };
      config.series = [
        {
          name: 'Plays',
          type: 'scatter',
          selectedMode: 'single',
          coordinateSystem: 'geo',
          animationDurationUpdate: 200,
          animationEasingUpdate: 'cubicInOut',
          data: [],
          symbolSize: 12,
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            }
          },

          itemStyle: {
            normal: {
              color: '#f4e925',
              shadowBlur: 5,
              shadowColor: '#333'
            },
            emphasis: {
              borderColor: '#fff',
              borderWidth: 1
            }
          }
        }
      ];
    } else {
      config.series = [
        {
          name: '',
          type: 'map',
          mapType: 'world',
          roam: false,
          zoom: 1.2,
          top: 40,
          selectedMode: 'single',
          animationDurationUpdate: 200,
          animationEasingUpdate: 'cubicInOut',
          itemStyle: {
            areaColor: '#ebebeb',
            borderColor: '#999999',
            emphasis: {label: {show: true}, areaColor: '#F49616'}
          },
          data: []
        }
      ];
      if (config['geo']) {
        delete config['geo'];
      }
    }
    return config;
  }

  public getCountryName(country: string, toServerName = false): string {
    // map kaltura server country names to gep map county names
    const serveCountryNames = ["Aland Islands",
      "Antigua and Barbuda",
      "Bolivia, Plurinational State of",
      "Bosnia and Herzegovina",
      "British Indian Ocean Territory",
      "Brunei Darussalam",
      "Cayman Islands",
      "Central African Republic",
      "Czech Republic",
      "Dominican Republic",
      "Equatorial Guinea",
      "Falkland Islands (Malvinas)",
      "Faroe Islands",
      "French Polynesia",
      "French Southern Territories",
      "Heard Islans and Mcdonald Islands",
      "Iran, Islamic Republic of",
      "Korea, Democratic People's Republic of",
      "Korea, Republic of",
      "Lao People's Democratic Republic",
      "Libyan Arab Jamahiriya",
      "Macedonia, The Former Yugoslav Republic of",
      "Micronesia, Federated States of",
      "Moldova, Republic of",
      "Russian Federation",
      "Saint Pierre and Miquelon",
      "Saint Vincent and The Grenadines",
      "Sao Tome and Principe",
      "Serbia and Montenegro",
      "Solomon Islands",
      "Syrian Arab Republic",
      "Tanzania, United Republic of",
      "Turks and Caicos Islands",
      "Venezuela, Bolivarian Republic of",
      "Viet Nam"];
    const mapCountryNames = ["Aland",
      "Antigua and Barb.",
      "Bolivia",
      "Bosnia and Herz.",
      "Br. Indian Ocean Ter.",
      "Brunei",
      "Cayman Is.",
      "Central African Rep.",
      "Czech Rep.",
      "Dominican Rep.",
      "Eq. Guinea",
      "Falkland Is.",
      "Faeroe Is.",
      "Fr. Polynesia",
      "Fr. S. Antarctic Lands",
      "Heard I. and McDonald Is.",
      "Iran",
      "Korea",
      "Korea",
      "Lao PDR",
      "Libya",
      "Macedonia",
      "Micronesia",
      "Moldova",
      "Russia",
      "St. Pierre and Miquelon",
      "St. Vin. and Gren.",
      "São Tomé and Principe",
      "Serbia",
      "Solomon Is.",
      "Syria",
      "Tanzania",
      "Turks and Caicos Is.",
      "Venezuela",
      "Vietnam"];

    if (toServerName) {
      const index = mapCountryNames.indexOf(country);
      return index === -1 ? country : serveCountryNames[index];
    } else {
      const index = serveCountryNames.indexOf(country);
      return index === -1 ? country : mapCountryNames[index];
    }
  }
}
