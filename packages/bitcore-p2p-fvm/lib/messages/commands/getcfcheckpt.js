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
function GetcfcheckptMessage(arg, options) {
  Message.call(this, options);
  this.command = 'getcfcheckpt';
}
inherits(GetcfcheckptMessage, Message);

GetcfcheckptMessage.prototype.setPayload = function(payload) {
  console.log('GetcfcheckptMessage.prototype.setPayload', payload);
};

GetcfcheckptMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = GetcfcheckptMessage;
