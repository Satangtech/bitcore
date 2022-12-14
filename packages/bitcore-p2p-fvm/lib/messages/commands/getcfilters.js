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
function GetcfiltersMessage(arg, options) {
  Message.call(this, options);
  this.command = 'getcfilters';
}
inherits(GetcfiltersMessage, Message);

GetcfiltersMessage.prototype.setPayload = function(payload) {
  console.log('GetcfiltersMessage.prototype.setPayload', payload);
};

GetcfiltersMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = GetcfiltersMessage;
