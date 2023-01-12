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
function Sendaddrv2Message(arg, options) {
  Message.call(this, options);
  this.command = 'sendaddrv2';
}
inherits(Sendaddrv2Message, Message);

Sendaddrv2Message.prototype.setPayload = function(payload) {
  console.log('Sendaddrv2Message.prototype.setPayload', payload);
};

Sendaddrv2Message.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = Sendaddrv2Message;
