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
function Addrv2Message(arg, options) {
  Message.call(this, options);
  this.command = 'addrv2';
}
inherits(Addrv2Message, Message);

Addrv2Message.prototype.setPayload = function(payload) {
  console.log('Addrv2Message.prototype.setPayload', payload);
};

Addrv2Message.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = Addrv2Message;
