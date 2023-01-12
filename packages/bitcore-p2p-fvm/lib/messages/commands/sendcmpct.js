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
function SendcmpctMessage(arg, options) {
  Message.call(this, options);
  this.command = 'sendcmpct';
}
inherits(SendcmpctMessage, Message);

SendcmpctMessage.prototype.setPayload = function(payload) {
  console.log('SendcmpctMessage.prototype.setPayload', payload);
};

SendcmpctMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = SendcmpctMessage;
