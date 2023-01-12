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
function WtxidrelayMessage(arg, options) {
  Message.call(this, options);
  this.command = 'wtxidrelay';
}
inherits(WtxidrelayMessage, Message);

WtxidrelayMessage.prototype.setPayload = function(payload) {
  console.log('WtxidrelayMessage.prototype.setPayload', payload);
};

WtxidrelayMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = WtxidrelayMessage;
