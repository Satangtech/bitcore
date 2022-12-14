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
function GetblocktxnMessage(arg, options) {
  Message.call(this, options);
  this.command = 'getblocktxn';
}
inherits(GetblocktxnMessage, Message);

GetblocktxnMessage.prototype.setPayload = function(payload) {
  console.log('GetblocktxnMessage.prototype.setPayload', payload);
};

GetblocktxnMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = GetblocktxnMessage;
