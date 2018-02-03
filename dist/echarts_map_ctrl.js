'use strict';

System.register(['app/plugins/sdk', 'lodash', './libs/echarts.min', './libs/dark', './css/style.css!', './libs/bmap.js', './libs/getBmap.js'], function (_export, _context) {
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
    }, function (_libsEchartsMin) {
      echarts = _libsEchartsMin.default;
    }, function (_libsDark) {}, function (_cssStyleCss) {}, function (_libsBmapJs) {}, function (_libsGetBmapJs) {}],
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

        // eslint-disable-line
        function EchartsMapCtrl($scope, $injector) {
          _classCallCheck(this, EchartsMapCtrl);

          var _this = _possibleConstructorReturn(this, (EchartsMapCtrl.__proto__ || Object.getPrototypeOf(EchartsMapCtrl)).call(this, $scope, $injector));

          var panelDefaults = {
            EchartsOption: 'option = {}',
            IS_MAP: false,
            map: '',
            sensors: [],
            fakeData: '[{\n        branchName: \'\u5317\u4EAC\',\n        status: \'1\', // 0 1 2 =>\u7EFF \u6A59 \u7EA2\n        values: [{\n          name: \'\u6570\u91CF\',\n          value: \'100\',\n          unit: \'\u53F0\',\n        }],\n        alias: \'\u5317\u4EAC\',\n        location: \'\u5317\u4EAC\',\n        coord: [116, 40]\n      }]',
            USE_URL: false,
            USE_FAKE_DATA: false,
            url: '',
            request: '',
            updateInterval: 10000
          };

          _this.maps = ['世界', '中国', '北京'];

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('panel-initialized', _this.render.bind(_this));

          _this.updateData();
          return _this;
        }

        // post请求


        _createClass(EchartsMapCtrl, [{
          key: 'updateData',
          value: function updateData() {
            var that = this;
            var xmlhttp = void 0;

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

              xmlhttp.onreadystatuschange = function () {
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

            that.$timeout(function () {
              that.updateData();
            }, that.panel.updateInterval);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived() {
            this.IS_DATA_CHANGED = true;
            this.render();
            this.IS_DATA_CHANGED = false;
          }
        }, {
          key: 'addSensor',
          value: function addSensor() {
            var _this2 = this;

            if (!this.data) return;

            var oddSensors = this.panel.sensors.slice(); // 保存原数据
            this.panel.sensors.length = 0; // 清空现有数据

            // 添加新数据，对比原数据，以保留坐标信息
            this.data.forEach(function (newData, i) {
              _this2.panel.sensors.push({
                branchName: newData.branchName,
                status: newData.status,
                values: newData.values,
                alias: newData.branchName,
                location: '北京',
                coord: [116, 40]
              });

              oddSensors.forEach(function (oddData) {
                if (newData.branchName === oddData.branchName) {
                  _this2.panel.sensors[i].alias = oddData.alias;
                  _this2.panel.sensors[i].location = oddData.location;
                  _this2.panel.sensors[i].coord = oddData.coord;
                }
              });
            });
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('标记点', 'public/plugins/dxc-echarts-map-panel/partials/editor_mark.html', 2);
            this.addEditorTab('Echarts配置', 'public/plugins/dxc-echarts-map-panel/partials/editor_option.html', 3);
          }
        }, {
          key: 'importMap',
          value: function importMap() {
            if (!this.panel.IS_MAP) return;
            switch (this.panel.map) {
              case '世界':
                System.import(this.getPanelPath() + 'libs/world.js'); // eslint-disable-line
                break;
              case '中国':
                System.import(this.getPanelPath() + 'libs/china.js'); // eslint-disable-line
                break;
              case '北京':
                System.import(this.getPanelPath() + 'libs/beijing.js'); // eslint-disable-line
                break;
              default:
                break;
            }
          }
        }, {
          key: 'getPanelPath',
          value: function getPanelPath() {
            // the system loader preprends publib to the url, add a .. to go back one level
            return '../' + grafanaBootData.settings.panels[this.pluginId].baseUrl + '/'; // eslint-disable-line
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            var $panelContainer = elem.find('.echarts_map_container')[0];
            var option = {}; // eslint-disable-line
            var Timer = void 0;
            var currentLoc = 0;
            var echartsData = []; // eslint-disable-line

            ctrl.IS_DATA_CHANGED = true;

            var myChart = echarts.init($panelContainer, 'dark');

            ctrl.importMap();

            // bad hank
            setTimeout(function () {
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
                      selected: true
                    }]
                  }
                });

                ctrl.sensor = ctrl.panel.sensors[currentLoc];

                var $panelCard = elem.find('.map_card_container')[0];
                if ($panelCard && ctrl.sensor.values && ctrl.sensor.values.length) {
                  var cardInner = '';
                  ctrl.sensor.values.forEach(function (el) {
                    cardInner += '<div class="info">\n              <span class="text">' + el.name + '</span>\n              <span class="value">' + el.value + '</span>\n              <span class="text">' + el.unit + '</span>\n            </div>';
                  });

                  $panelCard.innerHTML = '<div class = "card">\n            <div class="title">\n              <i class="icon" style="background:' + ['#3aae32', '#fe8f02', '#c23531'][ctrl.sensor.status % 3] + ';"></i>\n              ' + ctrl.sensor.alias + '\n            </div>\n            ' + cardInner + '\n          </div>';
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
