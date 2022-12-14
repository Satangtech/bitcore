'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('fvmcore-lib');
var BufferUtil = bitcore.util.buffer;

/**
 * A message in response to a version message.
 * @extends Message
 * @constructor
 */
function FeefilterMessage(arg, options) {
  Message.call(this, options);
  this.command = 'feefilter';
}
inherits(FeefilterMessage, Message);

FeefilterMessage.prototype.setPayload = function(payload) {
  console.log('FeefilterMessage.prototype.setPayload', payload);
};

FeefilterMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = FeefilterMessage;
