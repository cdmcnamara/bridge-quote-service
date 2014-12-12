var util               = require('util');
var chai               = require('chai');
var chaiAsPromised     = require('chai-as-promised');
var sinon              = require('sinon');
var RippleRestClient   = require('ripple-rest-client');
var RippleQuoteService = require(__dirname + '/../../../../server/lib/services/ripple_quote_service.js');
var fixture            = require(__dirname + '/../../../fixtures/ripple_quote_requests.js');

describe('ripple_quote', function() {

  chai.use(chaiAsPromised);

  it('.validate() should successfully validate a ripple quote request', function(done) {
    RippleQuoteService.validate(fixture.valid)
      .then(done)
      .catch(done);
  });

  it('.validate() should fail to validate a ripple quote (amount)', function() {
    return chai.assert.isRejected(RippleQuoteService.validate(fixture.invalid.destination_amount), 'Amount is not valid number');
  });

  it('.validate() should fail to validate a ripple quote (currency)', function() {
    return chai.assert.isRejected(RippleQuoteService.validate(fixture.invalid.destination_currency), 'Currency is not valid');
  });

  it('.validate() should fail to validate a ripple quote (address)', function() {
    return chai.assert.isRejected(RippleQuoteService.validate(fixture.invalid.destination_address), 'Address is not a valid ripple address');
  });

  it('.validate() should fail to validate a ripple quote (issuer)', function() {
    return chai.assert.isRejected(RippleQuoteService.validate(fixture.invalid.source_address), 'Issuer is not a valid ripple address');
  });

  it('.build() calls ripple-rest with the provided args', function(done) {
    var stub = sinon.stub(RippleRestClient.prototype, 'buildPayment')
      .yields(null, fixture.ripple_rest_response.valid);
    RippleQuoteService.build(fixture.valid)
      .then(function() {
        chai.assert.ok(stub.withArgs({
          amount: fixture.valid.destination.amount,
          currency: fixture.valid.destination.currency,
          recipient: fixture.valid.destination.address
        }).called);
        stub.restore();
        done();
      })
      .catch(function(error) {
        stub.restore();
        if (util.isError(error)) {
          done(error);
        }
        done(new Error(JSON.stringify(error)));
      });
  });
});