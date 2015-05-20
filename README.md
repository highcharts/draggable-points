Draggable Points for Highcharts
================
This plugin allows the user to drag the points in the chart, making them able to edit data directly in the chart.

The contents of the plugin is located in the javascript file "draggable-points.js". 
This plugin is published under the MIT license, and the license document is included in the repository.

Online demos:
* [Combined series](http://jsfiddle.net/highcharts/AyUbx/) 
* [Bubble series](http://jsfiddle.net/highcharts/sk3m3o7d/)

### Options

| Option name | Type | Description |
| ----------- | ---- | ----------- |
| `plotOptions.series.cursor`| String | Highcharts core option. We recommend setting a cursor that indicates to your users that the point can be dragged, for example `ns-resize` or `move`. |
| `plotOptions.series.draggableX` | Boolean | Enable draggable along the X axis. |
| `plotOptions.series.draggableY` | Boolean | Enable draggable along the Y axis. |
| `plotOptions.series.dragHandlePath` | Function | Column series only. A custom path for the drag handle. |
| `plotOptions.series.dragHandleFill` | Function | Column series only. Fill color for the drag handle. |
| `plotOptions.series.dragHandleStroke` | Function | Column series only. Stroke color for the drag handle. |
| `plotOptions.series.dragMaxX` | Number | The maximum X value to drag to for this series. |
| `plotOptions.series.dragMaxY` | Number | The maximum Y value to drag to for this series. |
| `plotOptions.series.dragMinX` | Number | The minimum X value to drag to for this series. |
| `plotOptions.series.dragMinY` | Number | The minimum Y value to drag to for this series. |
| `plotOptions.series.point.events.drag` | Function | Callback that fires while dragging. Temporary point values can be read from `e.newX` and `e.newY`. |
| `plotOptions.series.point.events.drop` | Function | Callback that fires when the point is dropped. The `Point` object is the context. |


