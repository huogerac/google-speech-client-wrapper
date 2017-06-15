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

      it('Should initialize the API', function(done) {

        var SpeechToTextApi = require("../src/speeachToTextApi");
        var commands = ["hello"];
        var speech = SpeechToTextApi.init(commands);

        assert.deepEqual( "object" , typeof speech );
        done();

      });

    });

});
