'use strict';

System.register(['app/plugins/sdk', 'lodash', './libs/echarts', './libs/dark', './libs/china', './libs/beijing', './libs/\u90B9\u57CE', './style.css!'], function (_export, _context) {
    "use strict";

    var PanelCtrl, _, echarts, _createClass, EchartsMapCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    return {
        setters: [function (_appPluginsSdk) {
            PanelCtrl = _appPluginsSdk.PanelCtrl;
        }, function (_lodash) {
            _ = _lodash.default;
        }, function (_libsEcharts) {
            echarts = _libsEcharts.default;
        }, function (_libsDark) {}, function (_libsChina) {}, function (_libsBeijing) {}, function (_libs) {}, function (_styleCss) {}],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _export('EchartsMapCtrl', EchartsMapCtrl = function (_PanelCtrl) {
                _inherits(EchartsMapCtrl, _PanelCtrl);

                function EchartsMapCtrl($scope, $injector) {
                    _classCallCheck(this, EchartsMapCtrl);

                    var _this = _possibleConstructorReturn(this, (EchartsMapCtrl.__proto__ || Object.getPrototypeOf(EchartsMapCtrl)).call(this, $scope, $injector));

                    var panelDefaults = {
                        EchartsOption: 'option = {}',
                        valueMaps: [],
                        sensors: [],
                        url: '',
                        updateInterval: 10000
                    };

                    _.defaults(_this.panel, panelDefaults);
                    _.defaults(_this.panel.EchartsOption, panelDefaults.EchartsOption);

                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.events.on('panel-initialized', _this.render.bind(_this));

                    _this.updateClock();
                    return _this;
                }

                //post请求


                _createClass(EchartsMapCtrl, [{
                    key: 'updateClock',
                    value: function updateClock() {
                        var _this2 = this;

                        var that = this,
                            xmlhttp = void 0;

                        if (window.XMLHttpRequest) {
                            xmlhttp = new XMLHttpRequest();
                        } else {
                            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                        }

                        xmlhttp.onreadystatechange = function () {
                            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                                if (!JSON.parse(xmlhttp.responseText).success) return;
                                that.data = JSON.parse(xmlhttp.responseText).data;
                                that.addSensor();
                            }
                        };

                        if (that.panel.url) {
                            xmlhttp.open("POST", that.panel.url, true);
                            xmlhttp.send("input=grafana");
                        }

                        this.$timeout(function () {
                            _this2.updateClock();
                        }, that.panel.updateInterval);
                    }
                }, {
                    key: 'addSensor',
                    value: function addSensor() {
                        var oddSensors = this.panel.sensors.slice(); // 保存原数据
                        this.panel.sensors.length = 0; // 清空现有数据

                        // 添加新数据，对比原数据，以保留坐标信息
                        for (var i = 0; i < this.data.length; i++) {
                            this.panel.sensors.push({ branchName: this.data[i].branchName, status: this.data[i].status, values: this.data[i].values, alias: this.data[i].branchName, location: '北京', coord: [116, 40] });

                            for (var j = 0; j < oddSensors.length; j++) {
                                if (this.data[i].branchName == oddSensors[j].branchName) {
                                    this.panel.sensors[i].alias = oddSensors[j].alias;
                                    this.panel.sensors[i].location = oddSensors[j].location;
                                    this.panel.sensors[i].coord = oddSensors[j].coord;
                                }
                            }
                        }
                        this.dataChanged();
                    }
                }, {
                    key: 'dataChanged',
                    value: function dataChanged() {
                        this.IS_DATA_CHANGED = true;
                        this.render();
                        this.IS_DATA_CHANGED = false;
                    }
                }, {
                    key: 'onInitEditMode',
                    value: function onInitEditMode() {
                        this.addEditorTab('Data', 'public/plugins/grafana-echarts-map-panel/editor_mark.html', 2);
                        this.addEditorTab('Echarts options', 'public/plugins/grafana-echarts-map-panel/editor_option.html', 3);
                    }
                }, {
                    key: 'link',
                    value: function link(scope, elem, attrs, ctrl) {
                        var $panelContainer = elem.find('.echarts_container')[0];
                        var option = {},
                            Timer = void 0,
                            currentLoc = 0,
                            colorArr = ['#3aae32', '#fe8f02', '#c23531'],
                            echartsData = [];

                        ctrl.IS_DATA_CHANGED = true;

                        //init height
                        var height = ctrl.height || panel.height || ctrl.row.height;
                        if (_.isString(height)) {
                            height = parseInt(height.replace('px', ''), 10);
                        }
                        height -= 5;
                        height -= ctrl.panel.title ? 24 : 9;
                        $panelContainer.style.height = height + 'px';

                        //init width
                        var width = document.body.clientWidth;
                        width = (width - 5.6 * 2) * ctrl.panel.span / 12 - 5.6 * 2 - 1 * 2 - 10 * 2;
                        $panelContainer.style.width = width + 'px';

                        //init echarts
                        var myChart = echarts.init($panelContainer, 'dark');

                        function render() {
                            if (!myChart) {
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
                                    geo: {
                                        regions: [{
                                            name: ctrl.panel.sensors[currentLoc].location,
                                            selected: true
                                        }]
                                    }
                                });

                                ctrl.sensor = ctrl.panel.sensors[currentLoc];

                                var $panelCard = elem.find('.echarts_card')[0];
                                if ($panelCard) {
                                    $panelCard.innerHTML = '<div class="title"><i class="icon" style="background:' + colorArr[ctrl.sensor.status % 3] + ';"></i>' + ctrl.sensor.alias + '</div>';

                                    for (var j = 0; j < ctrl.sensor.values.length; j++) {
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
                }]);

                return EchartsMapCtrl;
            }(PanelCtrl));

            _export('EchartsMapCtrl', EchartsMapCtrl);

            EchartsMapCtrl.templateUrl = 'module.html';
        }
    };
});
//# sourceMappingURL=echarts_map_ctrl.js.map
