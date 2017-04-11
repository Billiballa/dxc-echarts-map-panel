# grafana-echarts-map-panel
Echarts map panel for grafana
## How Use
1. Merge **./vendor** folder and **Grafana/public/vendor** folder(You can also download [echarts.js](http://echarts.baidu.com/download.html), [world.js](http://echarts.baidu.com/download-map.html) to **Grafana/public/vendor/** and change `define(['exports', 'echarts'], factory);` to `define(['exports', 'vendor/echarts'], factory);` in dark.js, world.js and china.js.).
2. `$ npm install`
3. `$ grunt`
4. Restart **Grafana-server**.
5. Add your data source to **Data** in edit page.
6. Add your echarts option to **EchartsOption** in edit page.
