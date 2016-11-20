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

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.open(address, function (status) {

  if (status !== "success") {
    return console.log("Unable to access network");
  }

  waitFor(checkIfReady, done);

  function checkIfReady() {
    return page.evaluate(function () {
      return !!document.getElementById('printReady');
    });
  }

  function done() {

    console.log('Phantom start render');

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
      if (!condition) {
        console.log('waitFor timeout');
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
