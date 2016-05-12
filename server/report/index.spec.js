'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var reportCtrlStub = {
  index: 'reportCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var reportIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './report.controller': reportCtrlStub
});

describe('Report API Router:', function() {

  it('should return an express router instance', function() {
    expect(reportIndex).to.equal(routerStub);
  });

  describe('GET /report', function() {

    it('should route to report.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'reportCtrl.index')
      ).to.have.been.calledOnce;
    });

  });

});
