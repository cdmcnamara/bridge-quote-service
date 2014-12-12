var validator        = require('validator');
var _                = require('lodash');
var Promise          = require('bluebird');
var UInt160          = require('ripple-lib').UInt160;
var logger           = require(__dirname + '/../core/logger.js');
var RippleRestClient = require('ripple-rest-client');

var rippleRestClient = new RippleRestClient({
  api: 'https://api.ripple.com/'
});

function RippleQuoteService() {}

/**
 *  Builds a RippleQuote provided the following:
 *
 *  @param {Object} options                         - Holds various options
 *  @param {String}  [options.source.address]       - Sending ripple address
 *  @param {String}  [options.destination.address]  - Receiving ripple address
 *  @param {String}  [options.destination.amount]   - Amount to be received by destination address
 *  @param {String}  [options.destination.currency] - Currency of amount to be received by destination address
 *
 *  @promise {Object}
 *    @resolve {Object} RippleQuote
 *    @reject  {Error}
 */
RippleQuoteService.prototype.build = function(options) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    _this.validate(options)
      .then(function() {
        rippleRestClient.account = options.source.address;
        rippleRestClient.buildPayment({
          amount: options.destination.amount,
          currency: options.destination.currency,
          recipient: options.destination.address
        }, function(error, response) {
          if (error) {
            logger.warn('[rippe_quote.js:build] Received unsuccessful response from ripple-rest:', error);
            reject(error);
          } else {
            resolve(response.payments);
          }
        });
      }).error(reject);
  });
};

/**
 *  Validates the parameters to be sent to ripple rest to generate a ripple quote
 *
 *  @param {Object} options                         - Holds various options
 *  @param {String}  [options.source.address]       - Sending ripple address
 *  @param {String}  [options.destination.address]  - Receiving ripple address
 *  @param {String}  [options.destination.amount]   - Amount to be received by destination address
 *  @param {String}  [options.destination.currency] - Currency of amount to be received by destination address
 *
 *  @promise {Object}
 *    @resolve {Object}
 *    @reject  {Error}
 */
RippleQuoteService.prototype.validate = function(options) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    if (!_.isNumber(options.destination.amount)) {
      logger.warn('[rippe_quote.js:validate] Destination amount is not valid number [%d]', options.destination.amount);
      return reject(new Error('Destination amount is not valid number'));
    }
    if (!validator.isAlpha(options.destination.currency) || !validator.isLength(options.destination.currency, 3, 3)) {
      logger.warn('[rippe_quote.js:validate] Destination currency is not valid [%s]', options.currency);
      return reject(new Error('Destination currency is not valid'));
    }
    if (!UInt160.is_valid(options.destination.address)) {
      logger.warn('[rippe_quote.js:validate] Destination address is not a valid ripple address [%s]', options.destination.address);
      return reject(new Error('Destination address is not a valid ripple address'));
    }
    if (!UInt160.is_valid(options.source.address)) {
      logger.warn('[rippe_quote.js:validate] Source address is not a valid ripple address [%s]', options.source.address);
      return reject(new Error('Source address is not a valid ripple address'));
    }
    resolve();
  });
};

module.exports = new RippleQuoteService();