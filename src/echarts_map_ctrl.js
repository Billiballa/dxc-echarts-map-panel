import { PanelCtrl } from 'app/plugins/sdk'; // eslint-disable-line
import _ from 'lodash';
import echarts from './libs/echarts.min'; // eslint-disable-line
import './libs/dark'; // eslint-disable-line
import './css/style.css!'; // eslint-disable-line
import './libs/bmap.js'; // eslint-disable-line
import './libs/getBmap.js'; // eslint-disable-line
export class EchartsMapCtrl extends PanelCtrl { // eslint-disable-line
  constructor($scope, $injector) {
    super($scope, $injector);

    const panelDefaults = {
      EchartsOption: 'option = {}',
      IS_MAP: false,
      map: '',
      sensors: [],
      fakeData: `[{
        branchName: '北京',
        status: '1', // 0 1 2 =>绿 橙 红
        values: [{
          name: '数量',
          value: '100',
          unit: '台',
        }],
        alias: '北京',
        location: '北京',
        coord: [116, 40]
      }]`,
      USE_URL: false,
      USE_FAKE_DATA: false,
      url: '',
      request: '',
      updateInterval: 10000,
    };

    this.maps = ['世界', '中国', '北京'];

    _.defaultsDeep(this.panel, panelDefaults);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-initialized', this.render.bind(this));

    this.updateData();
  }

  // post请求
  updateData() {
    const that = this;
    let xmlhttp;

    if (that.panel.USE_FAKE_DATA) {
      that.data = eval(that.panel.fakeData);
      that.addSensor();
      that.onDataReceived();
    } else {
      if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
      } else {
        xmlhttp = new ActiveXObject('Microsoft.XMLHTTP'); // eslint-disable-line
      }

      xmlhttp.onreadystatuschange = () => {
        if (xmlhttp.readyStatue === 4 && xmlhttp.status === 200) {
          that.data = JSON.parse(xmlhttp.responseText);
          that.addSensor();
          that.onDataReceived();
        }
      };

      if (!that.panel.USE_FAKE_DATA && that.panel.url && that.panel.request) {
        xmlhttp.open('POST', that.panel.url, true);
        xmlhttp.send(that.panel.request);
      }
    }

    that.$timeout(() => { that.updateData(); }, that.panel.updateInterval);
  }

  onDataReceived() {
    this.IS_DATA_CHANGED = true;
    this.render();
    this.IS_DATA_CHANGED = false;
  }

  addSensor() {
    if (!this.data) return;

    const oddSensors = this.panel.sensors.slice(); // 保存原数据
    this.panel.sensors.length = 0; // 清空现有数据

    // 添加新数据，对比原数据，以保留坐标信息
    this.data.forEach((newData, i) => {
      this.panel.sensors.push({
        branchName: newData.branchName,
        status: newData.status,
        values: newData.values,
        alias: newData.branchName,
        location: '北京',
        coord: [116, 40],
      });

      oddSensors.forEach((oddData) => {
        if (newData.branchName === oddData.branchName) {
          this.panel.sensors[i].alias = oddData.alias;
          this.panel.sensors[i].location = oddData.location;
          this.panel.sensors[i].coord = oddData.coord;
        }
      });
    });
  }

  // deleteSensor(index) {
  //   this.panel.sensors.splice(index, 1);
  // }

  onInitEditMode() {
    this.addEditorTab('标记点', 'public/plugins/dxc-echarts-map-panel/partials/editor_mark.html', 2);
    this.addEditorTab('Echarts配置', 'public/plugins/dxc-echarts-map-panel/partials/editor_option.html', 3);
  }

  importMap() {
    if (!this.panel.IS_MAP) return;
    switch (this.panel.map) {
      case '世界':
        System.import(`${this.getPanelPath()}libs/world.js`); // eslint-disable-line
        break;
      case '中国':
        System.import(`${this.getPanelPath()}libs/china.js`); // eslint-disable-line
        break;
      case '北京':
        System.import(`${this.getPanelPath()}libs/beijing.js`); // eslint-disable-line
        break;
      default:
        break;
    }
  }

  getPanelPath() {
    // the system loader preprends publib to the url, add a .. to go back one level
    return `../${grafanaBootData.settings.panels[this.pluginId].baseUrl}/`; // eslint-disable-line
  }

  link(scope, elem, attrs, ctrl) {
    const $panelContainer = elem.find('.echarts_map_container')[0];
    let option = {}; // eslint-disable-line
    let Timer;
    let currentLoc = 0;
    let echartsData = []; // eslint-disable-line

    ctrl.IS_DATA_CHANGED = true;

    const myChart = echarts.init($panelContainer, 'dark');

    ctrl.importMap();

    // bad hank
    setTimeout(() => {
      myChart.resize();
    }, 1000);

    // 轮播计时器
    function setTimer() {
      clearTimeout(Timer);

      if (ctrl.panel.sensors.length > 0) {
        myChart.setOption({
          geo: {
            regions: [{
              name: ctrl.panel.sensors[currentLoc].location,
              selected: true,
            }],
          },
        });

        ctrl.sensor = ctrl.panel.sensors[currentLoc];

        const $panelCard = elem.find('.map_card_container')[0];
        if ($panelCard && ctrl.sensor.values && ctrl.sensor.values.length) {
          let cardInner = '';
          ctrl.sensor.values.forEach((el) => {
            cardInner += `<div class="info">
              <span class="text">${el.name}</span>
              <span class="value">${el.value}</span>
              <span class="text">${el.unit}</span>
            </div>`;
          });

          $panelCard.innerHTML = `<div class = "card">
            <div class="title">
              <i class="icon" style="background:${['#3aae32', '#fe8f02', '#c23531'][ctrl.sensor.status % 3]};"></i>
              ${ctrl.sensor.alias}
            </div>
            ${cardInner}
          </div>`;
        }

        currentLoc = (currentLoc + 1) % ctrl.panel.sensors.length;

        Timer = setTimeout(setTimer, 3600);
      }
    }

    function render() {
      if (!myChart) {
        return;
      }

      if (ctrl.IS_DATA_CHANGED) {
        myChart.clear();
        echartsData = ctrl.panel.sensors;
      }

      eval(ctrl.panel.EchartsOption);
      myChart.setOption(option);

      myChart.resize();

      setTimer();
    }

    this.events.on('render', () => {
      render();
      ctrl.renderingCompleted();
    });
  }
}

EchartsMapCtrl.templateUrl = 'module.html';
