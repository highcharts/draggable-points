Deprecated: Draggable Points for Highcharts
================

This plugin is deprecated as of November 2018, and replaced by the featured
[draggable-points](https://api.highcharts.com/highcharts/plotOptions.series.dragDrop)
Highcharts module that includes the same functionality and more.

_______________________________________________________________________________
This plugin allows the user to drag the points in the chart, making them able to edit data directly in the chart.

The contents of the plugin is located in the javascript file `draggable-points.js`. 
This plugin is published under the MIT license, and the license document is included in the repository.

Online demos:
* [Combined series](http://jsfiddle.net/highcharts/AyUbx/) 
* [Bubble series](http://jsfiddle.net/highcharts/sk3m3o7d/)

### Options

| Option name | Type | Description |
| ----------- | ---- | ----------- |
| `chart.zoomKey` | String | Allows setting zoom key. Can be one of `alt`, `ctrl`, `meta` (the command key on Mac and Windows key on Windows) or `shift`, and should be set different than `chart.panKey`. It is useful when [`series.stickyTracking`](https://api.highcharts.com/highcharts/plotOptions.series.stickyTracking) is enabled. |
| `plotOptions.series.cursor`| String | Highcharts core option. We recommend setting a cursor that indicates to your users that the point can be dragged, for example `ns-resize` or `move`. |
| `plotOptions.series.data.draggableX` | Boolean | If dragging is enabled on the series, set this to false to prevent dragging on a single point. |
| `plotOptions.series.data.draggableY` | Boolean | If dragging is enabled on the series, set this to false to prevent dragging on a single point. |
| `plotOptions.series.draggableX` | Boolean | Enable draggable along the X axis. |
| `plotOptions.series.draggableY` | Boolean | Enable draggable along the Y axis. |
| `plotOptions.series.dragHandlePath` | Function | Column series only. A custom path for the drag handle. |
| `plotOptions.series.dragHandleFill` | Function | Column series only. Fill color for the drag handle. |
| `plotOptions.series.dragHandleStroke` | Function | Column series only. Stroke color for the drag handle. |
| `plotOptions.series.dragMaxX` | Number | The maximum X value to drag to for this series. |
| `plotOptions.series.dragMaxY` | Number | The maximum Y value to drag to for this series. |
| `plotOptions.series.dragMinX` | Number | The minimum X value to drag to for this series. |
| `plotOptions.series.dragMinY` | Number | The minimum Y value to drag to for this series. |
| `plotOptions.series.dragPrecisionX` | Number | The X precision value to drag to for this series. |
| `plotOptions.series.dragPrecisionY` | Number |The Y precision value to drag to for this series.  |
| `plotOptions.series.dragSensitivity` | Number | The amount of pixels to drag the pointer before it counts as a drag operation. This prevents drag/drop to fire when just clicking or selecting points. Defaults to 1. |
| `plotOptions.series.point.events.drag` | Function | Callback that fires while dragging. Temporary point values can be read from `e.newX` and `e.newY`. Original values are available in `e.dragStart`. |
| `plotOptions.series.point.events.drop` | Function | Callback that fires when the point is dropped. Original values are available in `e.dragStart`. The `Point` object is the context. Return false to cancel the drop. |


