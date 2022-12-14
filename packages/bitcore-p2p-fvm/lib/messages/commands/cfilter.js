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
function CfilterMessage(arg, options) {
  Message.call(this, options);
  this.command = 'cfilter';
}
inherits(CfilterMessage, Message);

CfilterMessage.prototype.setPayload = function(payload) {
  console.log('CfilterMessage.prototype.setPayload', payload);
};

CfilterMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = CfilterMessage;
