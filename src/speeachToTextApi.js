/**
*/

var SpeechToTextAPI = {};

var commandsList = [];


SpeechToTextAPI.init = function(commands) {
  this.commandsList = commands;
  return this;
};

/** process the transcripts and call events when
 *  it maches
 */
SpeechToTextAPI.process = function(input) {
  return this;
};

module.exports = SpeechToTextAPI;
