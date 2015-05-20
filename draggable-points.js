/**
 * Draggable points plugin for Highcharts JS
 * Author: Torstein Honsi
 * License: MIT License
 */

/*global document, Highcharts */
(function (Highcharts) {

    'use strict';

    var addEvent = Highcharts.addEvent,
        each = Highcharts.each,
        pick = Highcharts.pick;

    /**
     * Filter by dragMin and dragMax
     */
    function filterRange(newY, series, XOrY) {
        var options = series.options,
            dragMin = pick(options['dragMin' + XOrY], undefined),
            dragMax = pick(options['dragMax' + XOrY], undefined);

        if (newY < dragMin) {
            newY = dragMin;
        } else if (newY > dragMax) {
            newY = dragMax;
        }
        return newY;
    }

    Highcharts.Chart.prototype.callbacks.push(function (chart) {

        var container = chart.container,
            dragPoint,
            dragX,
            dragY,
            dragPlotX,
            dragPlotY;

        function drop(e) {
            if (dragPoint) {
                if (e) {
                    var originalEvent = e.originalEvent || e,
                        pageX = originalEvent.changedTouches ? originalEvent.changedTouches[0].pageX : e.pageX,
                        pageY = originalEvent.changedTouches ? originalEvent.changedTouches[0].pageY : e.pageY,
                        draggableX = dragPoint.series.options.draggableX,
                        draggableY = dragPoint.series.options.draggableY,
                        deltaX = dragX - pageX,
                        deltaY = dragY - pageY,
                        series = dragPoint.series,
                        isScatter = series.type === 'bubble' || series.type === 'scatter',
                        newPlotX = isScatter ? dragPlotX - deltaX : dragPlotX - deltaX - dragPoint.series.xAxis.minPixelPadding,
                        newPlotY = chart.plotHeight - dragPlotY + deltaY,
                        newX = dragX === undefined ? dragPoint.x : dragPoint.series.xAxis.translate(newPlotX, true),
                        newY = dragY === undefined ? dragPoint.y : dragPoint.series.yAxis.translate(newPlotY, true);

                    newX = filterRange(newX, series, 'X');
                    newY = filterRange(newY, series, 'Y');

                    dragPoint.update({
                        x: draggableX ? newX : dragPoint.x,
                        y: draggableY ? newY : dragPoint.y
                    });
                }
                dragPoint.firePointEvent('drop');
            }
            dragPoint = dragX = dragY = undefined;
        }

        function mouseDown(e) {
            var options,
                originalEvent = e.originalEvent || e,
                hoverPoint,
                series;

            if ((originalEvent.target.getAttribute('class') || '').indexOf('highcharts-handle') !== -1) {
                hoverPoint = originalEvent.target.point;
            }

            series = chart.hoverPoint && chart.hoverPoint.series;
            if (!hoverPoint && chart.hoverPoint && (!series.useDragHandle || !series.useDragHandle())) {
                hoverPoint = chart.hoverPoint;
            }

            if (hoverPoint) {
                options = hoverPoint.series.options;
                if (options.draggableX) {
                    dragPoint = hoverPoint;
                    dragX = originalEvent.changedTouches ? originalEvent.changedTouches[0].pageX : e.pageX;
                    dragPlotX = dragPoint.plotX;
                }

                if (options.draggableY) {
                    dragPoint = hoverPoint;

                    dragY = originalEvent.changedTouches ? originalEvent.changedTouches[0].pageY : e.pageY;
                    dragPlotY = dragPoint.plotY + (chart.plotHeight - (dragPoint.yBottom || chart.plotHeight));
                }

                // Disable zooming when dragging
                if (dragPoint) {
                    chart.mouseIsDown = false;
                }
            }
        }

        function mouseMove(e) {

            e.preventDefault();

            if (dragPoint) {
                var originalEvent = e.originalEvent || e,
                    pageX = originalEvent.changedTouches ? originalEvent.changedTouches[0].pageX : e.pageX,
                    pageY = originalEvent.changedTouches ? originalEvent.changedTouches[0].pageY : e.pageY,
                    deltaY = dragY - pageY,
                    deltaX = dragX - pageX,
                    draggableX = dragPoint.series.options.draggableX,
                    draggableY = dragPoint.series.options.draggableY,
                    series = dragPoint.series,
                    isScatter = series.type === 'bubble' || series.type === 'scatter',
                    newPlotX = isScatter ? dragPlotX - deltaX : dragPlotX - deltaX - dragPoint.series.xAxis.minPixelPadding,
                    newPlotY = chart.plotHeight - dragPlotY + deltaY,
                    newX = dragX === undefined ? dragPoint.x : dragPoint.series.xAxis.translate(newPlotX, true),
                    newY = dragY === undefined ? dragPoint.y : dragPoint.series.yAxis.translate(newPlotY, true),
                    proceed;

                newX = filterRange(newX, series, 'X');
                newY = filterRange(newY, series, 'Y');

                // Fire the 'drag' event with a default action to move the point.
                dragPoint.firePointEvent(
                    'drag',
                    {
                        newX: draggableX ? newX : dragPoint.x,
                        newY: draggableY ? newY : dragPoint.y
                    },
                    function () {
                        proceed = true;

                        dragPoint.update({
                            x: draggableX ? newX : dragPoint.x,
                            y: draggableY ? newY : dragPoint.y
                        }, false);

                        // Hide halo while dragging (#14)
                        if (series.halo) {
                            series.halo = series.halo.destroy();
                        }

                        if (chart.tooltip) {
                            chart.tooltip.refresh(chart.tooltip.shared ? [dragPoint] : dragPoint);
                        }
                        if (series.stackKey) {
                            chart.redraw();
                        } else {
                            series.redraw();
                        }
                    }
                );

                // The default handler has not run because of prevented default
                if (!proceed) {
                    drop();
                }
            }
        }

        // Kill animation on first drag when chart.animation is set to false.
        chart.redraw();

        // Add'em
        addEvent(container, 'mousemove', mouseMove);
        addEvent(container, 'touchmove', mouseMove);
        addEvent(container, 'mousedown', mouseDown);
        addEvent(container, 'touchstart', mouseDown);
        addEvent(document, 'mouseup', drop);
        addEvent(document, 'touchend', drop);
        addEvent(container, 'mouseleave', drop);
    });

    /**
     * Extend the column chart tracker by visualizing the tracker object for small points
     */
    Highcharts.seriesTypes.column.prototype.useDragHandle = function () {
        var is3d = this.chart.is3d && this.chart.is3d();
        return !is3d;
    };

    Highcharts.seriesTypes.column.prototype.dragHandlePath = function (shapeArgs, strokeW) {
        var x1 = shapeArgs.x,
            y = shapeArgs.y,
            x2 = shapeArgs.x + shapeArgs.width;

        return [
            'M', x1, y + 6 * strokeW,
            'L', x1, y,
            'L', x2, y,
            'L', x2, y + 2 * strokeW,
            'L', x1, y + 2 * strokeW,
            'L', x2, y + 2 * strokeW,
            'L', x2, y + 4 * strokeW,
            'L', x1, y + 4 * strokeW,
            'L', x2, y + 4 * strokeW,
            'L', x2, y + 6 * strokeW
        ];
    };

    Highcharts.wrap(Highcharts.seriesTypes.column.prototype, 'drawTracker', function (proceed) {
        var series = this,
            options = series.options,
            strokeW = series.borderWidth || 0;

        proceed.apply(series);

        if (this.useDragHandle() && (options.draggableX || options.draggableY)) {

            each(series.points, function (point) {

                var path = (options.dragHandlePath || series.dragHandlePath)(point.shapeArgs, strokeW);

                if (!point.handle) {
                    point.handle = series.chart.renderer.path(path)
                        .attr({
                            fill: options.dragHandleFill || 'rgba(0,0,0,0.5)',
                            'class': 'highcharts-handle',
                            'stroke-width': strokeW,
                            'stroke': options.dragHandleStroke || options.borderColor || 1
                        })
                        .css({
                            cursor: 'ns-resize'
                        })
                        .add(series.group);

                    point.handle.element.point = point;
                } else {
                    point.handle.attr({ d: path });
                }
            });
        }
    });

}(Highcharts));
