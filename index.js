  if (false /* for Microsoft Edge */) {
    var cameraPreview = document.getElementById('camera-preview');
    cameraPreview.parentNode.innerHTML = '<audio id="camera-preview" controls style="border: 1px solid rgb(15, 158, 238); width: 94%;"></audio> ';
  }

  var socketio = io();
  
  socketio.binaryType = 'arraybuffer';

  var mediaStream = null;
  socketio.on('connect', function() {
      startRecording.disabled = false;
  });

  var startRecording = document.getElementById('start-recording');
  var stopRecording = document.getElementById('stop-recording');
  var recordAudio, recordVideo;
  
  startRecording.onclick = function() {
      startRecording.disabled = true;
      navigator.getUserMedia({
          audio: true,
          video: false
      }, function(stream) {
          mediaStream = stream;
          recordAudio = RecordRTC(stream, {
              bufferSize: 4096,
              sampleRate: 44100,

              type: 'audio',
              recorderType: StereoAudioRecorder,
              numberOfAudioChannels: 1,
              onAudioProcessStarted: function() {
                console.log('started');
              }
          });
          recordAudio.startRecording();
          stopRecording.disabled = false;
      }, function(error) {
          alert(JSON.stringify(error));
      });
  };

  stopRecording.onclick = function() {
      startRecording.disabled = false;
      stopRecording.disabled = true;
      // stop audio recorder
      recordAudio.stopRecording(function() {
        var data = recordAudio.getBlob();
        socketio.emit('message', data);
        if (mediaStream) mediaStream.stop();
      });
  };
  socketio.on('transcript', function(text) {
    console.log('got data: ' + text);
    document.getElementById('txtText').innerHTML = document.getElementById('txtText').innerHTML + text;
  });
