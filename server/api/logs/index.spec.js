'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var logCtrlStub = {
  index: 'logCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var logIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './log.controller': logCtrlStub
});

describe('Log API Router:', function() {

  it('should return an express router instance', function() {
    expect(logIndex).to.equal(routerStub);
  });

  describe('GET /report', function() {

    it('should route to report.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'logCtrl.index')
      ).to.have.been.calledOnce;
    });

  });

});
