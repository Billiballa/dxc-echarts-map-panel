import { PanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import echarts from './libs/echarts.min';
import './libs/dark';
import './style.css!';
import './libs/bmap.js';
import './libs/getBmap.js';
export class EchartsMapCtrl extends PanelCtrl {

    constructor($scope, $injector) {
        super($scope, $injector);

        const panelDefaults = {
            EchartsOption: 'option = {}',
            IS_MAP: false,
            map: '',
            sensors: [],
            fakeData: '',
            USE_URL: false,
            url: '',
            request: '',
            updateInterval: 10000
        };

        this.maps = ['世界', '中国', '北京'];

        _.defaultsDeep(this.panel, panelDefaults);

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('panel-initialized', this.render.bind(this));

        this.updateData();
    }

    //post请求
    updateData() {
        let that = this, xmlhttp;

        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatuschange = function () {
            if (xmlhttp.readyStatue == 4 && xmlhttp.status == 200) {
                that.data = JSON.parse(xmlhttp.responseText);
                that.onDataReceived();
            }
        };

        if (that.panel.USE_URL && that.panel.url && that.panel.request) {
            xmlhttp.open("POST", that.panel.url, true);
            xmlhttp.send(that.panel.request);
        }

        this.$timeout(() => { this.updateData(); }, that.panel.updateInterval);
    }

    onDataReceived() {
        if (!this.panel.USE_URL && this.panel.fakeData) {
            this.data = eval(this.panel.fakeData); // jshint ignore:line
        }
        
        this.addSensor();

        this.IS_DATA_CHANGED = true;
        this.render();
        this.IS_DATA_CHANGED = false;
    }

    addSensor() {
        let oddSensors = this.panel.sensors.slice(); // 保存原数据
        this.panel.sensors.length = 0; // 清空现有数据

        // 添加新数据，对比原数据，以保留坐标信息
        for (let i = 0; i < this.data.length; i++) {
            this.panel.sensors.push({ branchName: this.data[i].branchName, status: this.data[i].status, values: this.data[i].values, alias: this.data[i].branchName, location: '北京', coord: [116, 40] });

            for (let j = 0; j < oddSensors.length; j++) {
                if (this.data[i].branchName == oddSensors[j].branchName) {
                    this.panel.sensors[i].alias = oddSensors[j].alias;
                    this.panel.sensors[i].location = oddSensors[j].location;
                    this.panel.sensors[i].coord = oddSensors[j].coord;
                }
            }
        }
    }

    // deleteSensor(index) {
    //     this.panel.sensors.splice(index, 1);
    // }

    onInitEditMode() {
        this.addEditorTab('数据', 'public/plugins/dxc-echarts-map-panel/editor_mark.html', 2);
        this.addEditorTab('Echarts配置', 'public/plugins/dxc-echarts-map-panel/editor_option.html', 3);
    }

    importMap() {
        if (!this.panel.IS_MAP) return;
        switch (this.panel.map) {
            case '世界':
                System.import(this.getPanelPath() + 'libs/world.js');
                break;
            case '中国':
                System.import(this.getPanelPath() + 'libs/china.js');
                break;
            case '北京':
                System.import(this.getPanelPath() + 'libs/beijing.js');
                break;
            default:
                break;
        }
    }

    getPanelPath() {
        // the system loader preprends publib to the url, add a .. to go back one level
        return '../' + grafanaBootData.settings.panels[this.pluginId].baseUrl + '/';
    }

    link(scope, elem, attrs, ctrl) {
        const $panelContainer = elem.find('.echarts_map_container')[0];
        let option = {},
            Timer,
            cardInner = '',
            currentLoc = 0,
            colorArr = ['#3aae32', '#fe8f02', '#c23531'],
            echartsData = [];

        ctrl.IS_DATA_CHANGED = true;

        function setHeight() {
            let height = ctrl.height || panel.height || ctrl.row.height;
            if (_.isString(height)) {
                height = parseInt(height.replace('px', ''), 10);
            }
            // height -= 7;
            // height -= ctrl.panel.title ? 25 : 9;
            $panelContainer.style.height = height + 'px';
        }

        // function setWidth() {
        //     let width = document.body.clientWidth;
        //     width = (width - 5.6 * 2) * ctrl.panel.span / 12 - 5.6 * 2 - 1 * 2 - 10 * 2;
        //     $panelContainer.style.width = width + 'px';
        // }

        setHeight();
        // setWidth();

        let myChart = echarts.init($panelContainer, 'dark');

        ctrl.importMap();

        // bad hank
        setTimeout(function () {
            myChart.resize();
        }, 1000);

        // 防止重复触发事件
        var callInterval = function callInterval() {
            var timeout, result;

            function func(callBack, interval) {
                var context = this; // jshint ignore:line
                var args = arguments;

                if (timeout) clearInterval(timeout);

                timeout = setInterval(function () {
                    result = callBack.apply(context, args);
                }, interval);

                return result;
            }

            return func;
        }();

        function render() {
            if (!myChart) {
                return;
            }

            setHeight();
            myChart.resize();

            if (ctrl.IS_DATA_CHANGED) {
                myChart.clear();
                echartsData = ctrl.panel.sensors;
            }

            eval(ctrl.panel.EchartsOption); // jshint ignore:line
            myChart.setOption(option);

            setTimer();
        }

        //轮播计时器
        function setTimer() {
            clearTimeout(Timer);

            if (ctrl.panel.sensors.length > 0) {
                myChart.setOption({
                    geo: {
                        regions: [{
                            name: ctrl.panel.sensors[currentLoc].location,
                            selected: true
                        }]
                    }
                });

                ctrl.sensor = ctrl.panel.sensors[currentLoc];

                let $panelCard = elem.find('.map_card_container')[0];
                if ($panelCard) {
                    cardInner = '<div class = "card"><div class="title"><i class="icon" style="background:' + colorArr[ctrl.sensor.status % 3] + ';"></i>' + ctrl.sensor.alias + '</div>';

                    for (let j = 0; j < ctrl.sensor.values.length; j++) {
                        cardInner += '<div class="info">' + ' <span class="text">' + ctrl.sensor.values[j].name + '</span>' + ' <span class="value">' + ctrl.sensor.values[j].value + '</span>' + ' <span class="text">' + ctrl.sensor.values[j].unit + '</span>' + '</div>';
                    }

                    $panelCard.innerHTML = cardInner + '</div>';
                }

                currentLoc = (currentLoc + 1) % ctrl.panel.sensors.length;

                Timer = setTimeout(setTimer, 3600);
            }
        }

        this.events.on('render', function () {
            render();
            ctrl.renderingCompleted();
        });
    }
}

EchartsMapCtrl.templateUrl = 'module.html';
