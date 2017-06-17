// buttons
var startRecording = document.getElementById('start-recording');
var stopRecording = document.getElementById('stop-recording');

var speechWebRTC = new SpeechWebRTC;

speechWebRTC.connect("http://localhost:9001").onResults(function(text) {
  console.log('got data: ' + text);
  document.getElementById('txtText').innerHTML = document.getElementById('txtText').innerHTML + text;
});
startRecording.disabled = false;

const bufferSize = 4096;
const sampleRate = 44100;

startRecording.onclick = function() {
  startRecording.disabled = true;
  speechWebRTC.startAudioRecording(bufferSize, sampleRate);
};

stopRecording.onclick = function() {
  startRecording.disabled = false;
  stopRecording.disabled = true;
  speechWebRTC.stopAndSendRecording();
};
