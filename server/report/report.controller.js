'use strict';

var path = require('path');
var childProcess = require('child_process');
var fs = require('fs');
var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;
var uuid = require('node-uuid');
var stapi = require('../STAPI/model');
var log = stapi('prt/log');

var domain = process.env.PRINTABLE;

function deleteFile(file) {
  //fs.unlink(file, function (err) {
  //  if (err) console.log('Could not delete file', err);
  //  else console.log(file, 'successfully deleted!');
  //});
}

export function index(req, res) {
  var filename = uuid.v4() + '.pdf';
  var dirName = path.join(__dirname, 'files');
  var pathToFile = path.join(dirName, '/', filename);
  var url = domain + req.query.path;
  var childArgs = [
    path.join(__dirname, 'load-ajax.js'),
    `${url} ${pathToFile}`
  ];
  var logId;

  saveLog({
    url: url,
    isConnectionAborted: true,
    filename: filename,
    fileSize: null,
    processingTime: null
  });

  var start = new Date();
  childProcess.exec(`${binPath} ${childArgs[0]} ${childArgs[1]}`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      console.log('err in childProcess');
      res.send('Something went wrong, the url is incorrect');
    }
    if (stderr) {
      console.log(stderr);
      console.log('stderr in childProcess');
      res.send('Something went wrong, the url is incorrect');
    }

    console.log(stdout);

    res.redirect(path.join('/files', filename));
    log().patch(logId, {
      isConnectionAborted: false,
      fileSize: getFilesizeInBytes(pathToFile),
      processingTime: new Date() - start
    });

  });

  function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename);
    return stats.size;
  }

  function saveLog(data) {
    log().save(data)
      .then((entity) => {
        console.log('Log have been saved:', entity);
        logId = entity.id;
      })
      .catch((err) => {
        console.log('Error occurred:', err);
      })
  }

}

