/**
 * Wrapper over webrtc audio
 * v0.0.1
 * by Roger Camargo
 */
;( function( window ) {
	
	'use strict';

	function SpeechWebRTC() {
    this.bufferSize = null;
    this.sampleRate = null;
    this.mediaStream = null;
    this.recordAudio = null;
	}

  SpeechWebRTC.prototype.connect = function(server) {
    this.socketio = io.connect(server || "http://localhost:9001");
    this.socketio.binaryType = 'arraybuffer';
    this.socketio.on('connect', function() {
      console.log('connected...');
    });
    return this;
  };

	SpeechWebRTC.prototype.startAudioRecording = function(bufferSize, sampleRate) {
      this.bufferSize = bufferSize || 4096;
      this.sampleRate = sampleRate || 44100;
      var that = this;
      navigator.getUserMedia({
          audio: true,
          video: false
      }, function(stream) {
          that.mediaStream = stream;
          that.recordAudio = RecordRTC(stream, {
            bufferSize: that.bufferSize,
            sampleRate: that.sampleRate,
            type: 'audio',
            recorderType: StereoAudioRecorder,
            numberOfAudioChannels: 1,
            onAudioProcessStarted: function() {
              console.log('started');
            }
          });
          that.recordAudio.startRecording();
      }, function(error) {
        alert(JSON.stringify(error));
      });
      return this;
	};

	SpeechWebRTC.prototype.stopAndSendRecording = function() {
    var that = this;
    that.recordAudio.stopRecording(function() {
      var newAudio = that.recordAudio.getBlob();
      that.socketio.emit('message', newAudio);
      if (that.mediaStream) {
        that.mediaStream.stop();
      }
    });
    return this;
	};

	SpeechWebRTC.prototype.onResults = function(cb) {
    this.socketio.on('transcript', function(text) {
      cb(text);
    });
    return this;
	};

	// add to global namespace
	window.SpeechWebRTC = SpeechWebRTC;

})( window );