
import expect from 'expect.js';

import {
  bdd,
  scenarioManager,
} from '../../../support';

import PageObjects from '../../../support/page_objects';

bdd.describe('visualize app', function describeIndexTests() {
  const fromTime = '2015-09-19 06:31:44.000';
  const toTime = '2015-09-23 18:31:44.000';

  bdd.before(function () {
    PageObjects.common.debug('navigateToApp visualize');
    return PageObjects.common.navigateToUrl('visualize', 'new')
    .then(function () {
      PageObjects.common.debug('clickHeatmapChart');
      return PageObjects.visualize.clickHeatmapChart();
    })
    .then(function clickNewSearch() {
      return PageObjects.visualize.clickNewSearch();
    })
    .then(function setAbsoluteRange() {
      PageObjects.common.debug('Set absolute time range from \"' + fromTime + '\" to \"' + toTime + '\"');
      return PageObjects.header.setAbsoluteRange(fromTime, toTime);
    })
    .then(function clickBucket() {
      PageObjects.common.debug('Bucket = X-Axis');
      return PageObjects.visualize.clickBucket('X-Axis');
    })
    .then(function selectAggregation() {
      PageObjects.common.debug('Aggregation = Date Histogram');
      return PageObjects.visualize.selectAggregation('Date Histogram');
    })
    .then(function selectField() {
      PageObjects.common.debug('Field = @timestamp');
      return PageObjects.visualize.selectField('@timestamp');
    })
    // leaving Interval set to Auto
    .then(function clickGo() {
      return PageObjects.visualize.clickGo();
    })
    .then(function () {
      return PageObjects.header.isGlobalLoadingIndicatorHidden();
    })
    .then(function waitForVisualization() {
      return PageObjects.visualize.waitForVisualization();
    });
  });

  bdd.describe('heatmap chart', function indexPatternCreation() {
    const vizName1 = 'Visualization HeatmapChart';

    bdd.it('should save and load', function () {
      return PageObjects.visualize.saveVisualization(vizName1)
      .then(function (message) {
        PageObjects.common.debug('Saved viz message = ' + message);
        expect(message).to.be('Visualization Editor: Saved Visualization \"' + vizName1 + '\"');
      })
      .then(function testVisualizeWaitForToastMessageGone() {
        return PageObjects.visualize.waitForToastMessageGone();
      })
      .then(function () {
        return PageObjects.visualize.loadSavedVisualization(vizName1);
      })
      .then(function () {
        return PageObjects.header.isGlobalLoadingIndicatorHidden();
      })
      .then(function waitForVisualization() {
        return PageObjects.visualize.waitForVisualization();
      });
    });

    bdd.it('should show correct chart, take screenshot', function () {
      const expectedChartValues = ['0 - 400', '0 - 400', '400 - 800', '1200 - 1600',
        '1200 - 1600', '400 - 800', '0 - 400', '0 - 400', '0 - 400', '0 - 400', '400 - 800',
        '1200 - 1600', '1200 - 1600', '400 - 800', '0 - 400', '0 - 400', '0 - 400', '0 - 400',
        '400 - 800', '1200 - 1600', '1200 - 1600', '400 - 800', '0 - 400', '0 - 400' ];

      // Most recent failure on Jenkins usually indicates the bar chart is still being drawn?
      // return arguments[0].getAttribute(arguments[1]);","args":[{"ELEMENT":"592"},"fill"]}] arguments[0].getAttribute is not a function
      // try sleeping a bit before getting that data
      return PageObjects.common.sleep(5000)
      .then(function () {
        return PageObjects.visualize.getHeatmapData();
      })
      .then(function showData(data) {
        PageObjects.common.debug('data=' + data);
        PageObjects.common.debug('data.length=' + data.length);
        PageObjects.common.saveScreenshot('Visualize-heatmap-chart');
        expect(data).to.eql(expectedChartValues);
      });
    });


    bdd.it('should show correct data', function () {
      // this is only the first page of the tabular data.
      const expectedChartData =  [ 'September 20th 2015, 00:00:00.000 37',
        'September 20th 2015, 03:00:00.000 202',
        'September 20th 2015, 06:00:00.000 740',
        'September 20th 2015, 09:00:00.000 1,437',
        'September 20th 2015, 12:00:00.000 1,371',
        'September 20th 2015, 15:00:00.000 751',
        'September 20th 2015, 18:00:00.000 188',
        'September 20th 2015, 21:00:00.000 31',
        'September 21st 2015, 00:00:00.000 42',
        'September 21st 2015, 03:00:00.000 202'
      ];

      return PageObjects.visualize.collapseChart()
      .then(function showData(data) {
        return PageObjects.visualize.getDataTableData();
      })
      .then(function showData(data) {
        PageObjects.common.debug(data.split('\n'));
        expect(data.trim().split('\n')).to.eql(expectedChartData);
      });
    });
  });
});
