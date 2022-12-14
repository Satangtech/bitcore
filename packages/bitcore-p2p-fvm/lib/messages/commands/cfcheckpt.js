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
function CfcheckptMessage(arg, options) {
  Message.call(this, options);
  this.command = 'cfcheckpt';
}
inherits(CfcheckptMessage, Message);

CfcheckptMessage.prototype.setPayload = function(payload) {
  console.log('CfcheckptMessage.prototype.setPayload', payload);
};

CfcheckptMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = CfcheckptMessage;
