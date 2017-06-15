/**
* It is a wrapper that calls google speech api
* @see google docs for more details
* https://cloud.google.com/speech/docs/streaming-recognize
*/

// Initialize Google Speech API
// in order to make google api works
// a key must be set
// export GOOGLE_APPLICATION_CREDENTIALS=../path/mykeyfile.json

// projectId: 'replicator-speechrecognition'
const Speech = require('@google-cloud/speech');
const speech = Speech({
  projectId: 'arboreal-groove-169604'
});

const encoding = 'LINEAR16';
const sampleRateHertz = 44100;
const languageCode = 'en-US';


const requestFileSpeech = {
  encoding: encoding,
  sampleRateHertz: sampleRateHertz,
  languageCode: languageCode
};

var GoogleSpeechController = {};


GoogleSpeechController.bufferToText = function(buffer){
  return new Promise(function (resolve, reject) {
      return speech.recognize({ content: buffer}, requestFileSpeech).then(function(res){
        console.log("Results: ", res);
        resolve(res);
      }).catch(function(err){
        console.log("API Error: ", err);
        reject(err);
      });
  });
};

/** convert a file speech to a text */
GoogleSpeechController.fileToText = function(filePath, callback) {
  console.log("Sending to google: ", filePath);
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
