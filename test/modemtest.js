var fs = require('fs');
var path = require('path');
var assert = require('assert');

var Modem = require("../scripts/modem");

// DS8500 HART modem
// http://datasheets.maximintegrated.com/en/ds/DS8500.pdf
var bitsPerSecond = 1200;
var onFrequency = 1200; // MARK
var offFrequency = 2400; // SPACE

var outBits = [];
var correctBits = null;
function bitListener(bit) {
    outBits.push(bit);
    if(correctBits !== null) {
        var correctBitsSlice = correctBits.slice(0, outBits.length);
        assert.deepEqual(outBits, correctBitsSlice);
    }
}

function roundTripTest(modem, inBits) {
    var signal = modem.modulate(inBits);

    /* Uncomment this block to view the signal via gnuplot.
    var gnuPlot = '';
    for(var sampleIndex = 0; sampleIndex < signal.length; sampleIndex++) {
        var time = sampleIndex;
        gnuPlot += time + " " + signal[sampleIndex] + "\n";
    }
    var signalFilename = path.join(__dirname, "signal.data");
    fs.writeFileSync(signalFilename, gnuPlot);
    console.log("Successfully wrote to " + signalFilename);
    console.log("Run ./signal.plot to view!");
    */

    outBits.length = 0;
    correctBits = inBits;
    modem.reset();
    for(var i = 0; i < signal.length; i++) {
        modem.demodulate(signal[i]);
    }
    for(var i = 0; i < 100; i++) {
        modem.demodulate(0);
    }
    assert.deepEqual(inBits, outBits);
}

var inBits = [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1];

[ 16000, 44100 ].forEach(function(samplesPerSecond) {
    console.log("**** Round trip test @ " + samplesPerSecond + "hZ ****");
    var modem = new Modem(samplesPerSecond, bitsPerSecond, onFrequency, offFrequency);
    modem.addBitListener(bitListener);
    roundTripTest(modem, inBits);
});




var tests = fs.readdirSync(__dirname);
tests = tests.filter(function(filename) {
    return filename.match(/\.testdata$/);
});
    
tests.forEach(function(filename) {
    console.log("************ Testing " + filename + " **************");
    var inDataFilename = path.join(__dirname, filename);
    var data = fs.readFileSync(inDataFilename, { encoding: 'utf8' });
    data = data.split("\n");
    var header = data.splice(0, 1);
    correctBits = eval(data.splice(0, 1)[0].substring(1));
    if(typeof(correctBits) == 'string') {
        correctBits = correctBits.replace(/ /g, "").split("").map(function(b) {
            assert(b == "0" || b == "1");
            return b == "0" ? 0 : 1;
        });
    }

    var samplesPerSecond = parseInt(header[0].substring(1).trim());

    outBits.length = 0;
    var modem = new Modem(samplesPerSecond, bitsPerSecond, onFrequency, offFrequency);
    modem.addBitListener(bitListener);

    data.forEach(function(pair) {
        if(pair.trim().length == 0) {
            return;
        }
        var index_sample = pair.split(" ");
        var sampleIndex = parseFloat(index_sample[0]);
        var sample = parseFloat(index_sample[1]);
        modem.demodulate(sample);
    });
    assert.deepEqual(outBits, correctBits);
});
