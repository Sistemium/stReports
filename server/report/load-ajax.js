var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

if (system.args.length < 4) {

  console.error('Usage: phantomjs load_ajax.js URL output_filename format');
  phantom.exit(1);

}

var address = system.args[1];
var outputFile = system.args[2];
var format = system.args[3];
var timeoutMs = system.args[4] || 20000;

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

if (format === 'pdf') {
  page.paperSize = {
    width: 1012,
    height: 1395,
    margin: '40px'
    // width: '210mm',
    // height: '297mm',
    // margin: '10mm'
  };
  page.viewportSize = {
    width: 932,
    height: 1315
  };
}

page.zoomFactor = 2;

page.open(address, function (status) {

  console.log('Phantom start. Timeout is', timeoutMs);

  if (status !== "success") {
    return console.log("Unable to access network");
  }

  page.evaluate(function () {
    /* jshint ignore:start */
    console.log('window.devicePixelRatio:', window.devicePixelRatio = 2);
    /* jshint ignore:end */
  });

  waitFor(checkIfReady, done, timeoutMs);

  function checkIfReady() {
    return page.evaluate(function () {
      var ifReady = !!document.getElementById('printReady');
      var ifError = !!document.getElementById('errorReady');
      return ifError && 'error' || ifReady && 'ready';
    });
  }

  function done() {

    try {
      page.render(outputFile, {format: format});
    } catch (e) {
      console.error('Error while writing to the file. ' + e.message);
      phantom.exit(1);
    }

    console.log('Phantom finish render');
    console.log(outputFile);
    phantom.exit();

  }

});


function waitFor(testFx, onReady, timeOutMillis) {

  //< Default Max Timout is 20s

  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 20000;
  var start = new Date().getTime();
  var condition = false;
  var interval = setInterval(checkIfFinished, 250);

  function checkIfFinished() {
    if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
      /*jslint evil: true */
      condition = (typeof(testFx) === "string" ? eval(testFx) : testFx());
    } else {
      if (condition === 'error') {
        console.error('Error from webpage:', condition);
        phantom.exit(1);
      } else if (!condition) {
        console.error('waitFor timeout');
        phantom.exit(1);
      } else {
        console.log('waitFor() finished in ' + (new Date().getTime() - start) + 'ms.');
        /*jslint evil: true */
        typeof(onReady) === "string" ? eval(onReady) : onReady();
        clearInterval(interval);
      }
    }
  }

}
