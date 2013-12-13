/**
 * Experimental Draggable points plugin
 * Revised 2013-06-13
 * Author: Torstein Hønsi
 * License: MIT License
 *
 * Modified 13/12/13 to only support inverted columnrange charts
 * Author: Richard Wise (MAT)
 */
(function (Highcharts) {
    var addEvent = Highcharts.addEvent,
        each = Highcharts.each;

    /**
     * Filter by dragMin and dragMax
     */
    function filterRange(newValue, size, series, XOrY) {
        var options = series.options,
            dragMin = options['dragMin' + XOrY],
            dragMax = options['dragMax' + XOrY],
            dragPrecision = options['dragPrecision' + XOrY];

        if (newValue < dragMin) {
            newValue = dragMin;
        } else if (newValue + size > dragMax) {
            newValue = dragMax - size;
        }
        if (dragPrecision) {
            newValue = Math.round(newValue / dragPrecision) * dragPrecision;
        }
        return newValue;
    }

    Highcharts.Chart.prototype.callbacks.push(function (chart) {

        var container = chart.container,
            dragPoint,
            dragX,
            dragY,
            dragPlotX,
            dragPlotY;

        chart.redraw(); // kill animation (why was this again?)

        addEvent(container, 'mousedown', function (e) {
            var hoverPoint = chart.hoverPoint,
                options;
            if (hoverPoint) {
                options = hoverPoint.series.options;
                if (options.draggableX) {
                    dragPoint = hoverPoint;
                    
                    dragX = e.pageY;
                    dragPlotX = dragPoint.plotX;
                }

                if (options.draggableY) {
                    dragPoint = hoverPoint;

                    dragY = e.pageX;
                    
                    dragPlotY = dragPoint.plotY/* + (chart.plotHeight - (dragPoint.yBottom || chart.plotHeight))*/;

                }

                // Disable zooming when dragging
                if (dragPoint) {
                    chart.mouseIsDown = false;
                }
            }
        });

        addEvent(container, 'mousemove', function (e) {
            if (dragPoint) {
                var deltaY = e.pageX - dragY,
                    deltaX = e.pageY - dragX,
                    newPlotX = dragPlotX - deltaX/* dragPoint.series.xAxis.minPixelPaddin*/,
                    newPlotY = chart.plotWidth - dragPlotY + deltaY,
                    newX = dragX === undefined ? dragPoint.x : dragPoint.series.xAxis.translate(newPlotX, true),
                    newY = dragY === undefined ? dragPoint.y : dragPoint.series.yAxis.translate(newPlotY, true),
                    series = dragPoint.series,
                    proceed;

                var diff = dragPoint.high - dragPoint.low;
                newX = filterRange(newX, 0, series, 'X');
                newY = filterRange(newY, diff, series, 'Y');

                // Fire the 'drag' event with a default action to move the point.
                dragPoint.firePointEvent(
                    'drag', {
                    newX: newX,
                    newY: newY
                },

                function () {
                    proceed = true;
                    dragPoint.update([newX, newY, newY + diff], false);
                    if (chart.tooltip) {
                        chart.tooltip.refresh(chart.tooltip.shared ? [dragPoint] : dragPoint);
                    }
                    if (series.stackKey) {
                        chart.redraw();
                    } else {
                        series.redraw();
                    }
                });
                
                // The default handler has not run because of prevented default
                if (!proceed) {
                    drop();
                }
            }
        });

        function drop(e) {
            if (dragPoint) {
                if (e) {
                    var deltaX = e.pageY - dragX,
                        deltaY = e.pageX - dragY,
                        newPlotX = dragPlotX - deltaX/* - dragPoint.series.xAxis.minPixelPadding*/,
                        newPlotY = chart.plotWidth - dragPlotY + deltaY,
                        series = dragPoint.series,
                        newX = dragX === undefined ? dragPoint.x : dragPoint.series.xAxis.translate(newPlotX, true),
                        newY = dragY === undefined ? dragPoint.y : dragPoint.series.yAxis.translate(newPlotY, true);
    
                    var diff = dragPoint.high - dragPoint.low;

                    newX = filterRange(newX, 0, series, 'X');
                    newY = filterRange(newY, diff, series, 'Y');
                    dragPoint.update([newX, newY, newY + diff]);
                }                
                dragPoint.firePointEvent('drop');
            }
            dragPoint = dragX = dragY = undefined;
        }
        addEvent(document, 'mouseup', drop);
        addEvent(container, 'mouseleave', drop);
    });

    /**
     * Extend the column chart tracker by visualizing the tracker object for small points
     */
    var colProto = Highcharts.seriesTypes.column.prototype,
        baseDrawTracker = colProto.drawTracker;

    colProto.drawTracker = function () {
        var series = this;
        baseDrawTracker.apply(series);
        each(series.points, function (point) {
            point.graphic.attr(point.shapeArgs.height < 3 ? {
                'stroke': 'black',
                'stroke-width': 2,
                'dashstyle': 'shortdot'
            } : {
                'stroke-width': series.options.borderWidth,
                'dashstyle': series.options.dashStyle || 'solid'
            });
        });
    };
 
})(Highcharts); 
