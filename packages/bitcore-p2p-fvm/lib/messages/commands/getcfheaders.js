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
function GetcfheadersMessage(arg, options) {
  Message.call(this, options);
  this.command = 'getcfheaders';
}
inherits(GetcfheadersMessage, Message);

GetcfheadersMessage.prototype.setPayload = function(payload) {
  console.log('GetcfheadersMessage.prototype.setPayload', payload);
};

GetcfheadersMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = GetcfheadersMessage;
