/**
* It is a wrapper that calls google speech api
* @see google docs for more details
* https://cloud.google.com/speech/docs/streaming-recognize
*/

// Initialize Google Speech API
// in order to make google api works
// a key must be set
// export GOOGLE_APPLICATION_CREDENTIALS=../path/mykeyfile.json

const Speech = require('@google-cloud/speech');
const speech = Speech({
  projectId: 'arboreal-groove-169604'
});

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

const requestStreamSpeech = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode
  },
  interimResults: false
};

const requestFileSpeech = {
  encoding: 'LINEAR16',
  sampleRateHertz: 44100,
  languageCode: 'en-US'
};

var GoogleSpeechController = {};


/** convert a file speech to a text */
GoogleSpeechController.fileToText = function(filePath, callback) {

  speech.recognize(filePath, requestFileSpeech)
    .then((results) => {
      const transcription = results[0];
      console.log('Transcription: ', transcription);
      callback(transcription);

    }).catch((err) => {
      console.error('ERROR:', err);
  });

};


module.exports = GoogleSpeechController;
