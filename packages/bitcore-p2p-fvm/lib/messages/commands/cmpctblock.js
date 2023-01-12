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
function CmpctblockMessage(arg, options) {
  Message.call(this, options);
  this.command = 'cmpctblock';
}
inherits(CmpctblockMessage, Message);

CmpctblockMessage.prototype.setPayload = function(payload) {
  console.log('CmpctblockMessage.prototype.setPayload', payload);
};

CmpctblockMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = CmpctblockMessage;
