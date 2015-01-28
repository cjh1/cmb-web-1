angular.module("kitware.cmb.core")
    .directive('cmbTimeFunction',  ['$templateCache', function ($templateCache) {

        return {
            restrict: 'AE',
            template: $templateCache.get('cmb/core/tpls/cmb-time-function-panel.html')
            link: function(scope, element, attrs) {
              // Check we have File API support
              if (typeof window.FileReader === 'undefined') {
                throw 'File API & FileReader available not supported by browser'
              }

              function createChart() {
                  var chart = {}

                  var margin = {top: 20, right: 20, bottom: 30, left: 50},
                  width = 600 - margin.left - margin.right,
                  height = 400 - margin.top - margin.bottom;

                  var x = d3.scale.linear()
                    .range([0, width]);

                  var y = d3.scale.linear()
                    .range([height, 0]);

                  var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom');

                  var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient('left');

                  var line = d3.svg.line()
                    .x(function(d) { return x(d.x); })
                    .y(function(d) { return y(d.y); });

                  var svg = d3.select('#drop-zone-chart').append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                  svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + height + ')')

                  svg.append('g')
                    .attr('class', 'y axis')

                  chart.update = function(data) {

                    console.log(data)

                    console.log(d3.extent(data, function(d) { return d.x; }))

                    x.domain(d3.extent(data, function(d) { return d.x; }));
                    y.domain(d3.extent(data, function(d) { return d.y; }));

                    svg.select('.x.axis')
                      .transition().duration(1000).ease('sin-in-out')
                      .call(xAxis);

                    svg.select('.y.axis')
                    .transition().duration(1000).ease('sin-in-out')
                    .call(yAxis);

                    var path = svg.select('path.line')

                    if (path.empty()) {
                      path = svg.append('path');
                    }

                    path.datum(data)
                      .transition()
                      .duration(1000)
                      .ease('sin-in-out')
                        .attr('class', 'line')
                        .attr('d', line);

                  };

                  return chart;
              }

              var data = [],
              chart = createChart();

                $('#drop-zone-chart').hide();

                $('#drop-zone').on('dragover', function() {
                  return false;
                });

                $('#drop-zone').on('dragend', function() {
                  return false;
                });

                $('input:radio[name=display]').click(function(e) {
                  var show = $(this).val();

                  if (show == 'text') {
                    $('#drop-zone-chart').fadeOut(function() {
                      $('#drop-zone-text').fadeIn();
                    });

                  }
                  else {
                    $('#drop-zone-text').fadeOut(function() {
                      $('#drop-zone-chart').fadeIn();
                    });

                  }
                });

                $('#drop-zone').on('drop', function(de) {
                  de.preventDefault();

                  var dataTransfer = de.originalEvent.dataTransfer;
                      file = dataTransfer.files[0], reader = new FileReader();

                  reader.onload = function(le) {
                    var text = this.result,
                        lines = text.split('\n');

                    data.length = 0;

                    $.each(lines, function(i, line) {
                      if (line.length == 0) {
                        return;
                      }

                      var r = line.match(/([0-9]*[.]?[0-9]*)[ ]*,[ ]*([0-9]*[.]?[0-9]*)/);

                      if (!r) {
                        throw 'Invalid file format';
                      }

                      data.push({
                          x: Number.parseFloat(r[1]),
                          y: Number.parseFloat(r[2])
                      });
                    });

                    $('#drop-zone-text').text(text);
                    chart.update(data);
                  };

                  reader.readAsText(file);

                  return false;


                });
              });


            }
        };
    }]);