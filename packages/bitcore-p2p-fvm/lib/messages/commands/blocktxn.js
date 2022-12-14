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
function BlocktxnMessage(arg, options) {
  Message.call(this, options);
  this.command = 'blocktxn';
}
inherits(BlocktxnMessage, Message);

BlocktxnMessage.prototype.setPayload = function(payload) {
  console.log('BlocktxnMessage.prototype.setPayload', payload);
};

BlocktxnMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = BlocktxnMessage;
