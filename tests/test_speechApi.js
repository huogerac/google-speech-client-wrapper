var assert = require('assert');

describe("SpeechToTextAPI", function() {

    before(function() {
    });

    after(function() {
    });

    /******
     * First test
     **********/
    describe('Api', function() {

      it('Should return an Object for the API initialize', function(done) {

        var SpeechToTextApi = require("../src/speeachToTextApi");
        var commands = ["hello"];
        var speech = SpeechToTextApi.init(commands);

        assert.deepEqual( "object" , typeof speech );
        done();

      });

      it('Should match the result: "hello" (1 word)', function(done) {

        var SpeechToTextApi = require("../src/speeachToTextApi");
        var commands = ["hello"];
        var speech = SpeechToTextApi.init(commands);

        var match = '';
        speech.addCallback('resultMatch', function(text) {
          match = text;
        }, this);

        speech.process(["hello"]);

        setTimeout(function () {
          assert.deepEqual( "hello" , match );
          done();
        }, 500);

      });

    });

});
