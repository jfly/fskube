var Stackmat = Stackmat || {};

// webkit shim
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

(function() {
"use strict";

var fskubeWorkerUrl;
var worker;

var audioContext;
// Leak these nodes so the browser won't clean them up. Gross.
var scriptProcessor;
var microphoneInput;

function createMicrophoneScriptProcessor() {
    navigator.getUserMedia(
        { audio: true },
        function(stream) {
            microphoneInput = audioContext.createMediaStreamSource(stream);
            microphoneInput.connect(scriptProcessor);
            microphoneScriptProcessorCreated();
        },
        function(e) {
            alert('No live audio input: ' + e);
        }
    );

    audioContext = new AudioContext();
    // do the shimmy
    audioContext.createScriptProcessor = ( audioContext.createScriptProcessor ||
                                           audioContext.createJavaScriptNode );

    // A bigger buffer means more latency, but also gives us a better chance of not dropping
    // samples.
    var bufferSize = 8*1024;
    scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);

    // This is silly. Apparently ScriptProcessorNode's need to be connected
    // to an output in order to fire.
    // http://stackoverflow.com/questions/19482155/do-webaudio-scriptprocessornodes-require-an-output-to-be-connected
    var zeroGainNode = audioContext.createGain();
    zeroGainNode.gain = 0;
    scriptProcessor.connect(zeroGainNode);
    zeroGainNode.connect(audioContext.destination);
}

function microphoneScriptProcessorCreated() {
    worker = new Worker(fskubeWorkerUrl);

    var methods = {
        getLogLevels: function(logLevels) {
            if(getLogLevelsCallback) {
                getLogLevelsCallback(logLevels);
                getLogLevelsCallback = null;
            }
        },
        newState: function(state) {
            if(Stackmat.onstackmatstate) {
                Stackmat.onstackmatstate(state);
            }
        }
    };
    worker.addEventListener("message", function(e) {
        methods[e.data.method].apply(null, e.data.args);
    });
    worker.addEventListener("error", function(e) {
        console.error("Worker error: " + e.message + "\n");
        throw error;
    });

    worker.postMessage({
        method: "initialize",
        args: [ audioContext.sampleRate ]
    });

    scriptProcessor.onaudioprocess = function(e) {
        worker.postMessage({
            method: "addSample",
            args: [ e.inputBuffer.getChannelData(0) ]
        });
    };
}

Stackmat.initialize = function(fskubeWorkerUrl_) {
    fskubeWorkerUrl = fskubeWorkerUrl_;
    createMicrophoneScriptProcessor();
};

Stackmat.onstackmatstate = null;

Stackmat.setLogLevels = function(levels) {
    if(!worker) {
        console.error("Must call Stackmat.initialize() first");
        return;
    }
    worker.postMessage({
        method: "setLogLevels",
        args: [ levels ]
    });
};

var getLogLevelsCallback;
Stackmat.getLogLevels = function(cb) {
    if(!worker) {
        console.error("Must call Stackmat.initialize() first");
        return;
    }
    getLogLevelsCallback = cb || function(levels) { console.log(levels); };
    worker.postMessage({
        method: "getLogLevels"
    });
};

Stackmat.getSampleRate = function() {
    return audioContext.sampleRate;
};

})();
