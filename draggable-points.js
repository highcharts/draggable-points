/**
 * Draggable points plugin
 * Author: Torstein Honsi
 * License: MIT License
 *
 */
 (function (Highcharts) {

        var addEvent = Highcharts.addEvent,
            removeEvent = Highcharts.removeEvent,
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

            function mouseDown(e) {
                var hoverPoint = chart.hoverPoint,
                    options,
                    originalEvent = e.originalEvent || e;

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
                        decimals = pick(dragPoint.series.options.decimals, undefined),
                        series = dragPoint.series,
                        isScatter = series.type === 'bubble' || series.type === 'scatter',
                        newPlotX = isScatter ? dragPlotX - deltaX : dragPlotX - deltaX - dragPoint.series.xAxis.minPixelPadding,
                        newPlotY = chart.plotHeight - dragPlotY + deltaY,
                        newX = dragX === undefined ? dragPoint.x : dragPoint.series.xAxis.translate(newPlotX, true),
                        newY = dragY === undefined ? dragPoint.y : dragPoint.series.yAxis.translate(newPlotY, true),
                        proceed;

                    
                    newX = filterRange(newX, series, 'X');
                    newY = filterRange(newY, series, 'Y');

                    if (decimals !== undefined) {
                        newX = Number(Highcharts.numberFormat(newX, decimals));
                        newY = Number(Highcharts.numberFormat(newY, decimals));
                    }

                    // Fire the 'drag' event with a default action to move the point.
                    dragPoint.firePointEvent(
                        'drag', {
                            newX: draggableX ? newX : dragPoint.x,
                            newY: draggableY ? newY : dragPoint.y
                        }, function () {
                            proceed = true;

                            if (newY != dragPoint.y || newX != dragPoint.x) {

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
                        }
                    );

                    // The default handler has not run because of prevented default
                    if (!proceed) {
                        drop();
                    }
                }
            }

            function drop(e) {
                if (dragPoint) {
                    if (e) {
                        var originalEvent = e.originalEvent || e,
                            pageX = originalEvent.changedTouches ? originalEvent.changedTouches[0].pageX : e.pageX,
                            pageY = originalEvent.changedTouches ? originalEvent.changedTouches[0].pageY : e.pageY,
                            draggableX = dragPoint.series.options.draggableX,
                            draggableY = dragPoint.series.options.draggableY,
                            decimals = pick(dragPoint.series.options.decimals, undefined),
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

                        if (decimals !== undefined) {
                            newX = Number(Highcharts.numberFormat(newX, decimals));
                            newY = Number(Highcharts.numberFormat(newY, decimals));
                        }

                        if (newY != dragPoint.y || newX != dragPoint.x) {
                            dragPoint.update({
                                x: draggableX ? newX : dragPoint.x,
                                y: draggableY ? newY : dragPoint.y
                            });
                        }
                    }
                    dragPoint.firePointEvent('drop');
                }
                dragPoint = dragX = dragY = undefined;
            }

            function addInputsToCharts() {
                for (var s = 0, slen = chart.series.length; s < slen; s++) {
                    var series = chart.series[s],
                        options = series.options,
                        points = series.points;
                    if ( options.dragInputs ) {
                        for (var p = 0, plen = points.length; p < plen; p++) {
                            var point = points[p];
                            addInput(point);                        
                        }
                    }
                }


                function addInput(point) {
                    var input = document.createElement('input'),
                        is_keyup = false;

                    container.parentNode.appendChild(input);

                    input.value = point.y;
                    input.style.position = 'absolute';
                    input.style.visibility = 'hidden';
                    input.style.textAlign = 'center';
                    input.className = 'draggable-input-value';

                    function setPosition () {
                        input.style.width = point.pointWidth + 'px';
                        input.style.left = (chart.plotLeft + point.plotX - input.offsetWidth/2) + 'px';
                        //input.style.top = (point.plotY) + 'px';
                        input.style.top = (chart.plotTop - input.offsetHeight/2) + 'px';
                    }

                    addEvent(chart, 'redraw', setPosition);

                    addEvent(input, 'mouseenter', function (event) {
                        var width = Number(this.style.width.slice(0, this.style.width.length -2)),
                            left = Number(this.style.left.slice(0, this.style.left.length -2));
                        this.style.visibility = 'visible'; 
                        this.style.width = (width*2) + 'px';
                        this.style.left = (left - (width/2)) + 'px';
                        addEvent(input, 'mouseleave', function (event) {
                            this.style.width = width + 'px';
                            this.style.left = left + 'px';
                            removeEvent(event);
                        });
                    });

                    addEvent(input, 'focus', function (event) {
                        this.select();
                    });

                    addEvent(input, 'click', function (event) {
                        setTimeout(function () {
                            input.select();
                        }, 5);
                    });

                    addEvent(input, 'keyup', function (event) {
                        is_keyup = true;
                        point.update({
                            x : point.x,
                            y : Number(this.value),
                        });
                        is_keyup = false;
                    });

                    addEvent(point, 'update', function (event) {
                        if (!is_keyup) {
                            input.value = event.options.y;
                        }
                    });

                    addEvent(point, 'click', function (event) {
                        input.focus();
                    });
                }
            }

            function inputDisplay (display_type) {
                return function () {
                    var inputs = container.parentNode.getElementsByClassName('draggable-input-value');
                    for (var i = 0, len = inputs.length; i < len; i++) {
                        var input = inputs[i];
                        input.style.visibility = display_type;
                    }
                }
            }

            addInputsToCharts();

            // Kill animation (why was this again?)
            chart.redraw(); 

            // Add'em
            addEvent(container, 'mouseenter', inputDisplay('visible'));
            addEvent(container, 'mouseleave', inputDisplay('hidden'));
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
        Highcharts.wrap(Highcharts.seriesTypes.column.prototype, 'drawTracker', function (proceed) {
            var series = this,
                options = series.options;
            proceed.apply(series);

            if (options.draggableX || options.draggableY) {

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
            }
        });

    })(Highcharts);
