// webkit shim
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function MainCtrl($scope, $timeout) {
    // TODO <<< make bps, onFreq, offFreq, bufferSize(?) configurable
    // DS8500 HART modem
    // http://datasheets.maximintegrated.com/en/ds/DS8500.pdf
    var bitsPerSecond = 1200;
    var onFrequency = 1200; // MARK
    var offFrequency = 2200; // SPACE

    // TODO <<< need to pick a buffer size. This is a tradeoff
    // between latency and dropping information. Maybe webworkers
    // would let us turn this size down.
    var bufferSize = 8192;

    // At something like 1200 baud (bits per second), we don't want to fire
    // an update of the screen 1200 times a second. Instead, we defer
    // updating by storing them up in the pendingBitPusher array, and
    // only periodically flushing them to the angular-ed $scope.receivedBits.
    var MAX_SCREEN_UPDATE_RATE = 10; // updates per second

    var rs232or = new Module.Rs232or();
    var rs232Listener = {
        bits: [],
        receive: function(bit) {
            this.bits.push(bit);
        }
    };
    rs232or.connect(Module.boolReceiver.implement(rs232Listener));

    var deRs232or = new Module.DeRs232or();
    var deRs232Listener = {
        chars: [],
        receive: function(ch) {
            this.chars.push(String.fromCharCode(ch));
        }
    };
    deRs232or.connect(Module.intReceiver.implement(deRs232Listener));

    function encode(message) {
        var bits = "";
        for(var i = 0; i < message.length; i++) {
            rs232Listener.bits.length = 0;
            rs232or.receive(message.charCodeAt(i));
            bits += rs232Listener.bits.map(function(bit) { return bit ? "1" : "0"; }).join("");
            bits += " ";
        }
        return bits.trim();
    }
    function decode(encodedMessage) {
        deRs232or.reset();
        deRs232Listener.chars.length = 0;
        var paddedBits = encodedMessage.replace(/[^01]/g, "");
        for(var i = 0; i < paddedBits.length; i++) {
            var bit = paddedBits[i] == "0" ? 0 : 1;
            deRs232or.receive(bit);
        }
        return deRs232Listener.chars.join("");
    }

    var message = "Hello, world!";
    var encodedMessage = null;
    Object.defineProperty($scope, "message", {
        get: function() {
            return message === null ? decode(encodedMessage) : message;
        },
        set: function(newMessage) {
            encodedMessage = null;
            message = newMessage;
        }
    });
    Object.defineProperty($scope, "encodedMessage", {
        get: function() {
            return encodedMessage === null ? encode(message) : encodedMessage;
        },
        set: function(newEncodedMessage) {
            encodedMessage = newEncodedMessage;
            message = null;
        }
    });

    var audioContext = new AudioContext();
    audioContext.createScriptProcessor = audioContext.createScriptProcessor ||audioContext.createJavaScriptNode;
    $scope.sampleRate = audioContext.sampleRate;

    var fskParams = {};
    fskParams.samplesPerSecond = audioContext.sampleRate;
    fskParams.bitsPerSecond = bitsPerSecond;
    fskParams.markFrequency = onFrequency;
    fskParams.spaceFrequency = offFrequency;
    var modulator = new Module.Modulator(fskParams);
    var demodulator = new Module.Demodulator(fskParams);
    $scope.receivedBits = '';
    $scope.receivedMessage = function() {
        return decode($scope.receivedBits);
    };
    var pendingBitPusher = null;
    var batchedBits = [];
    function bitPusher() {
        pendingBitPusher = null;
        for(var i = 0; i < batchedBits.length; i++) {
            var bit = batchedBits[i];
            if(($scope.receivedBits.length + 1) % 11 == 0) {
                $scope.receivedBits += " ";
            }
            $scope.receivedBits += (bit ? "1" : "0");
        }
        batchedBits.length = 0;
    }
    var bitListener = Module.boolReceiver.implement({
        receive: function(bit) {
            batchedBits.push(bit);
            if(pendingBitPusher === null) {
                pendingBitPusher = $timeout(bitPusher, 1000.0 / MAX_SCREEN_UPDATE_RATE);
            }
        }
    });
    demodulator.connect(bitListener);

    var modulatedSignal = [];
    var modulatorListener = Module.doubleReceiver.implement({
        receive: function(d) {
            modulatedSignal.push(d);
        }
    });
    modulator.connect(modulatorListener);

    $scope.play = function() {
        var bits = $scope.encodedMessage.replace(/ /g, "").split("").map(function(b) { return parseInt(b); });
        modulatedSignal.length = 0;
        modulator.reset();
        bits.forEach(function(bit) {
            modulator.receive(bit);
        });
        var signal = modulatedSignal;
        var signalBuffer = audioContext.createBuffer(1, signal.length, audioContext.sampleRate);
        var output = signalBuffer.getChannelData(0);
        for(var sampleIndex = 0; sampleIndex < signalBuffer.length; sampleIndex++) {
            output[sampleIndex] = signal[sampleIndex];
        }

        if($scope.source == loopbackSource) {
            // Simulate this happening outside of an angular apply().
            setTimeout(function() {
                for(var sampleIndex = 0; sampleIndex < signalBuffer.length; sampleIndex++) {
                    demodulator.receive(signal[sampleIndex]);
                }
            }, 0);
        }

        var signalNode = audioContext.createBufferSource();
        signalNode.buffer = signalBuffer;
        signalNode.connect(audioContext.destination);
        if($scope.source == webRtcloopbackSource) {
            signalNode.connect(processSignalNode);
        }
        signalNode.start(0);
    };

    var processSignalNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
    // Leak this node so the browser won't clean it up. Gross.
    window.processSignalNode = processSignalNode;
    $scope.savingSamples = false;
    var savedSamples = null;
    processSignalNode.onaudioprocess = function(audioProcessingEvent) {
        var inputBuffer = audioProcessingEvent.inputBuffer;
        var inData = inputBuffer.getChannelData(0);
        for(var sampleIndex = 0; sampleIndex < inputBuffer.length; sampleIndex++) {
            if($scope.savingSamples) {
                savedSamples.push(inData[sampleIndex]);
            }
            demodulator.receive(inData[sampleIndex]);
        }
    };

    // This is silly. Apparently ScriptProcessorNode's need to be connected
    // to an output in order to fire.
    // http://stackoverflow.com/questions/19482155/do-webaudio-scriptprocessornodes-require-an-output-to-be-connected
    var zeroGainNode = audioContext.createGain();
    zeroGainNode.gain = 0;
    processSignalNode.connect(zeroGainNode);
    zeroGainNode.connect(audioContext.destination);

    var microphoneSource = 'Microphone';
    var webRtcloopbackSource = 'WebRTC Loopback';
    var loopbackSource = 'Loopback';
    $scope.sources = [ microphoneSource, webRtcloopbackSource, loopbackSource ];
    $scope.source = microphoneSource;
    function updateSource() {
        if($scope.source == microphoneSource) {
            // Don't bother trying to disconnect the buffer if it's
            // currently playing. Just wire up the microphone.
            if(window.microphoneInput) {
                window.microphoneInput.connect(processSignalNode);
            }
        } else if($scope.source == webRtcloopbackSource) {
            // Disconnect the microphone. We'll set up the loopback
            // in the play() method.
            if(window.microphoneInput) {
                window.microphoneInput.disconnect();
            }
        } else if($scope.source == loopbackSource) {
            // Disconnect the microphone
            if(window.microphoneInput) {
                window.microphoneInput.disconnect();
            }
        } else {
            throw "Unrecognized source";
        }
    }
    $scope.$watch("source", updateSource);

    $scope.hasMicrophone = false;
    navigator.getUserMedia(
        {audio: true},
        function(stream) {
            $scope.$apply(function() {
                $scope.hasMicrophone = true;
            });
            var microphoneInput = audioContext.createMediaStreamSource(stream);
            // Leak this node so the browser won't clean it up. Gross.
            window.microphoneInput = microphoneInput;
            updateSource();
        },
        function(e) {
            alert('No live audio input: ' + e);
        }
    );

    $scope.sampleFiles = [];
    $scope.saveSamples = function() {
        $scope.savingSamples = !$scope.savingSamples;
        if($scope.savingSamples) {
            savedSamples = [];
        } else {
            var data = savedSamples.map(function(s, i) { return i + " " + s; }).join("\n");
            var blob = new Blob([data], {type: 'text/plain'});
            $scope.sampleFiles.push(window.URL.createObjectURL(blob));

            savedSamples = null;
        }
    };
    $scope.clear = function() {
        $scope.savingSamples = false;
        $scope.receivedBits = '';
        batchedBits = [];
    };
}

// Allow blob links.
var app = angular.module( 'modemTestModule', [] ).config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
    }
]);
