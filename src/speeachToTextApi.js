/**
*/

var SpeechToTextAPI = {};

var commandsList = [];
var callbacks = {
  resultMatch: [],
  resultNoMatch: []
};
var resultMatch;

SpeechToTextAPI.init = function(commands) {
  this.commandsList = commands;
  return this;
};


SpeechToTextAPI.onResultMatch = function(callback) {
  var cb = callback;
  this.resultMatch = cb;
};

SpeechToTextAPI.addCallback = function(type, callback, context) {
  var cb = callback;
  if (typeof cb === 'function' && callbacks[type] !== undefined) {
    callbacks[type].push({callback: cb, context: context || this});
  }
};


/** process the transcripts and call events when
 *  it maches
 */
SpeechToTextAPI.process = function(inputs) {
  var text;
  for (let i = 0; i<inputs.length; i++) {
    text = inputs[i].trim();
    for (let j = 0, l = this.commandsList.length; j < l; j++) {
      var currentCommand = this.commandsList[j];
      if (currentCommand == text) {
        invokeCallbacks(callbacks.resultMatch, text);
      }
    }

  }
  return this;
};

var invokeCallbacks = function(callbacks, ...args) {
  callbacks.forEach(function(callback) {
    callback.callback.apply(callback.context, args);
  });
};

module.exports = SpeechToTextAPI;
