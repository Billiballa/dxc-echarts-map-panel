import _ from 'lodash';
import { MetricsPanelCtrl } from 'app/plugins/sdk';
import echarts from 'vendor/echarts';
import 'vendor/dark';
import 'vendor/china';
import './style.css!';

export class EchartsMapCtrl extends MetricsPanelCtrl {

    constructor($scope, $injector) {
        super($scope, $injector);

        const panelDefaults = {
            EchartsOption: 'option = {}',
            valueMaps: [],
            sensors: []
        };

        _.defaults(this.panel, panelDefaults);
        _.defaults(this.panel.EchartsOption, panelDefaults.EchartsOption);

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('panel-initialized', this.render.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    }

    onDataReceived(dataList) {
        this.data = dataList;
        this.dataChanged();
    }

    dataChanged() {
        this.IS_DATA_CHANGED = true;
        this.render();
        this.IS_DATA_CHANGED = false;
    }

    deleteSensor(index) {
        this.panel.sensors.splice(index, 1);
        this.dataChanged();
    }

    addSensor() {
        if (this.panel.sensors.length < this.data.length)
            this.panel.sensors.push({ name: this.data[this.panel.sensors.length].name, status: this.data[this.panel.sensors.length].status, value: this.data[this.panel.sensors.length].value, location: '北京', coord: [116, 40] });
        else {
            let lastSensor = this.panel.sensors[this.panel.sensors.length - 1];
            this.panel.sensors.push({ name: lastSensor.name, status: lastSensor.status, value: lastSensor.value, location: '北京', xAxis: 116.4, yAxis: 40 });
        }
        this.dataChanged();
    }

    onInitEditMode() {
        this.addEditorTab('Echarts options', 'public/plugins/grafana-echarts-map-panel/editor_option.html', 2);
        this.addEditorTab('Mark points', 'public/plugins/grafana-echarts-map-panel/editor_mark.html', 3);
    }

    link(scope, elem, attrs, ctrl) {
        const $panelContainer = elem.find('.echarts_container')[0];
        const $panelCard = elem.find('.echarts_card')[0];
        let option = {},
            echartsData = [],
            echartsDataSum = NaN,
            echartsLegend = [];

        ctrl.IS_DATA_CHANGED = true;

        //init height
        let height = ctrl.height || panel.height || ctrl.row.height;
        if (_.isString(height)) {
            height = parseInt(height.replace('px', ''), 10);
        }
        $panelContainer.style.height = height + 'px';

        //init width
        let width = document.body.clientWidth;
        width = (width - 5.6 * 2) * ctrl.panel.span / 12 - 5.6 * 2 - 1 * 2 - 10 * 2;
        $panelContainer.style.width = width + 'px';

        //init echarts
        let myChart = echarts.init($panelContainer, 'dark');

        let Timer, currentLoc;


        //轮播计时器
        function setTimer() {
            clearInterval(Timer);
            currentLoc = 0;
            Timer = setInterval(function () {
                myChart.setOption({
                    series: [{
                        data: [{
                            name: ctrl.panel.sensors[currentLoc].location,
                            selected: true
                        }],
                        animationDurationUpdate: 1000,
                        animationEasingUpdate: 'cubicInOut'
                    }]
                });
                currentLoc = (currentLoc + 1) % ctrl.panel.sensors.length;

                ctrl.sensor = ctrl.panel.sensors[currentLoc];
                $panelCard.innerHTML = '<div class="title">' + ctrl.sensor.name + '</div>';
                console.log(ctrl.sensor);
                for (let j = 0; j < ctrl.sensor.value.length; j++) {
                    $panelCard.innerHTML += '<div class="info">' + ' <span class="name">' + ctrl.sensor.value[j].name + '</span>' + ' <span class="value">' + ctrl.sensor.value[j].value + '</span>' + '</div>';
                }
            }, 2000);
        }

        function render() {
            if (!myChart || !ctrl.data) {
                return;
            }
            myChart.resize();

            if (ctrl.IS_DATA_CHANGED) {
                myChart.clear();
            }
            setTimer();
            eval(ctrl.panel.EchartsOption);
            myChart.setOption(option);
        }

        this.events.on('render', function () {
            render();
            ctrl.renderingCompleted();
        });
    }
}

EchartsMapCtrl.templateUrl = 'module.html';
