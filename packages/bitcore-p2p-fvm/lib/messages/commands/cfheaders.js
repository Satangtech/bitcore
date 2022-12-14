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
function CfheadersMessage(arg, options) {
  Message.call(this, options);
  this.command = 'cfheaders';
}
inherits(CfheadersMessage, Message);

CfheadersMessage.prototype.setPayload = function(payload) {
  console.log('CfheadersMessage.prototype.setPayload', payload);
};

CfheadersMessage.prototype.getPayload = function() {
  return BufferUtil.EMPTY_BUFFER;
};

module.exports = CfheadersMessage;
