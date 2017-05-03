import {PanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import echarts from 'vendor/echarts';
import 'vendor/dark';
import 'vendor/china';
import './style.css!';

export class EchartsMapCtrl extends PanelCtrl {

    constructor($scope, $injector) {
        super($scope, $injector);

        const panelDefaults = {
            EchartsOption: 'option = {}',
            valueMaps: [],
            sensors: [],
            url: '',
            updateInterval: 3000
        };

        _.defaults(this.panel, panelDefaults);
        _.defaults(this.panel.EchartsOption, panelDefaults.EchartsOption);

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('panel-initialized', this.render.bind(this));

        this.updateClock();
    }

    //post请求
    updateClock() {
        let that = this,
            xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        }
        else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                if (!JSON.parse(xmlhttp.responseText).success) return;

                that.data = JSON.parse(xmlhttp.responseText).data;
                that.addSensor();
            }
        }

        // xmlhttp.open("POST", "http://122.115.49.71/restful/dashboard/getBranchSum", true);
        if (that.panel.url) {
            xmlhttp.open("POST", that.panel.url, true);
            xmlhttp.send("input=grafana");
        }

        // setTimeout(this.updateClock, JSON.stringify(that.panel.updateInterval));
        this.$timeout(() => { this.updateClock(); }, that.panel.updateInterval);
    }

    addSensor() {
        // if (this.panel.sensors.length < this.data.length) {
        //     this.panel.sensors.push({ branchName: this.data[this.panel.sensors.length].branchName, status: this.data[this.panel.sensors.length].status, values: this.data[this.panel.sensors.length].values, alias: this.data[this.panel.sensors.length].branchName, location: '北京', coord: [116, 40] });
        // } else {
        //     let lastSensor = this.panel.sensors[this.panel.sensors.length - 1];
        //     this.panel.sensors.push({ branchName: lastSensor.branchName || '', status: lastSensor.status || 0, values: lastSensor.values || [], alias: lastSensor.branchName, location: '北京', coord: [116, 40] });
        // }
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
        this.dataChanged();
    }

    dataChanged() {
        this.IS_DATA_CHANGED = true;
        this.render();
        this.IS_DATA_CHANGED = false;
    }

    // deleteSensor(index) {
    //     this.panel.sensors.splice(index, 1);
    // }

    onInitEditMode() {
        this.addEditorTab('Data', 'public/plugins/grafana-echarts-map-panel/editor_mark.html', 2);
        this.addEditorTab('Echarts options', 'public/plugins/grafana-echarts-map-panel/editor_option.html', 3);
    }

    link(scope, elem, attrs, ctrl) {
        const $panelContainer = elem.find('.echarts_container')[0];
        let option = {},
            Timer,
            currentLoc = 0,
            colorArr=['#3aae32','#fe8f02','#c23531'],
            echartsData = [];

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

        function render() {
            if (!myChart || !ctrl.panel.sensors) {
                return;
            }
            myChart.resize();

            if (ctrl.IS_DATA_CHANGED) {
                myChart.clear();
                echartsData = ctrl.panel.sensors;
            }

            eval(ctrl.panel.EchartsOption);
            myChart.setOption(option);

            setTimer();
        }

        //轮播计时器
        function setTimer() {
            clearTimeout(Timer);

            if (ctrl.panel.sensors.length > 0) {
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

                ctrl.sensor = ctrl.panel.sensors[currentLoc];

                let $panelCard = elem.find('.echarts_card')[0];
                if($panelCard){
                    $panelCard.innerHTML = '<div class="title"><i class="icon" style="background:'+colorArr[ctrl.sensor.status%3]+';"></i>' + ctrl.sensor.alias + '</div>';

                    for (let j = 0; j < ctrl.sensor.values.length; j++) {
                        $panelCard.innerHTML += '<div class="info">' + ' <span class="text">' + ctrl.sensor.values[j].name + '</span>' + ' <span class="value">' + ctrl.sensor.values[j].value + '</span>' + ' <span class="text">' + ctrl.sensor.values[j].unit + '</span>' + '</div>';
                    }
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
