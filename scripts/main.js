// webkit shim
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function MainCtrl($scope, $timeout) {
    // DS8500 HART modem
    // http://datasheets.maximintegrated.com/en/ds/DS8500.pdf
    var bitsPerSecond = 1200;
    var onFrequency = 1200; // MARK
    var offFrequency = 2200; // SPACE

    // The buffer size is a tradeoff between latency and dropping information.
    // I'm not sure how to pick a good value here. Maybe webworkers would let
    // us turn this size down.
    var bufferSize = 8192;

    // At something like 1200 baud (bits per second), we don't want to fire
    // an update of the screen 1200 times a second. Instead, we defer
    // updating by storing them up in the pendingBitPusher array, and
    // only periodically flushing them to the angular-ed $scope.receivedBits.
    var MAX_SCREEN_UPDATE_RATE = 10; // updates per second

    function fastMode() {
        return document.location.hash.toLowerCase().indexOf("fast") >= 0;
    }

    function toStringJson(str) {
        var charStr = JSON.stringify(str);
        // remove start and end quotes
        return charStr.substring(1, charStr.length - 1)
    }

    var rs232synthesizer = new Module.Rs232Synthesizer();
    var rs232Listener = {
        bits: [],
        receive: function(bit) {
            this.bits.push(bit);
        }
    };
    rs232synthesizer.connect(Module.boolReceiver.implement(rs232Listener));

    var rs232interpreter = new Module.Rs232Interpreter();
    var bytesListener = {
        chars: [],
        receive: function(ch) {
            if(!fastMode()) {
                this.chars.push(String.fromCharCode(ch));
            }
            stackmatInterpreter.receive(ch);
        }
    };
    rs232interpreter.connect(Module.intReceiver.implement(bytesListener));

    function encode(rs232BytesJson) {
        var bits = "";
        for(var i = 0; i < rs232BytesJson.length; i++) {
            if(rs232BytesJson.charCodeAt(i) >= 255) {
                // send an idle!
                var IDLE_LENGTH = 10;
                for(var i = 0; i < IDLE_LENGTH; i++) {
                    bits += "0";
                }
            } else {
                rs232Listener.bits.length = 0;
                rs232synthesizer.receive(rs232BytesJson.charCodeAt(i));
                bits += rs232Listener.bits.map(function(bit) { return bit ? "1" : "0"; }).join("");
            }
            bits += " ";
        }
        return bits.trim();
    }

    var stackmatState = {
        commandByte: "!",
        generation: "2",
        millis: "0"
    };
    var rs232BytesJson = "Hello, world!";
    var eightN1bits = null;
    Object.defineProperty($scope, "stackmatState", {
        get: function() {
            return stackmatState;
        },
        set: function(newState) {
            eightN1bits = null;
            rs232BytesJson = null;
            stackmatState = newState;
        }
    });

    var stackmatSynthesizer = new Module.StackmatSynthesizer();
    var stackmatCharsReceiver = {
        chars: [],
        receive: function(ch) {
            this.chars.push(ch);
        }
    };
    stackmatSynthesizer.connect(Module.intReceiver.implement(stackmatCharsReceiver));
    Object.defineProperty($scope, "rs232BytesJson", {
        get: function() {
            if($scope.stackmatState !== null) {
                var stackmatState = {};
                stackmatState.generation = parseInt($scope.stackmatState.generation || 2);
                stackmatState.millis = parseInt($scope.stackmatState.millis || 0);
                stackmatState.commandByte = ($scope.stackmatState.commandByte || " ").charCodeAt(0);
                stackmatState.on = true;
                stackmatCharsReceiver.chars.length = 0;
                stackmatSynthesizer.receive(stackmatState);
                var chars = stackmatCharsReceiver.chars.map(function(ch) { return String.fromCharCode(ch); }).join("");
                return toStringJson(chars);
            }
            return rs232BytesJson;
        },
        set: function(newMessage) {
            eightN1bits = null;
            rs232BytesJson = newMessage;
            stackmatState = null;
        }
    });
    Object.defineProperty($scope, "eightN1bits", {
        get: function() {
            if($scope.rs232BytesJson !== null) {
                return encode(JSON.parse('"' + $scope.rs232BytesJson + '"'));
            }
            return eightN1bits;
        },
        set: function(newEncodedMessage) {
            eightN1bits = newEncodedMessage;
            rs232BytesJson = null;
            stackmatState = null;
        }
    });

    var audioContext = new AudioContext();
    audioContext.createScriptProcessor = audioContext.createScriptProcessor ||audioContext.createJavaScriptNode;
    $scope.sampleRate = audioContext.sampleRate;

    var stackmatInterpreter = new Module.StackmatInterpreter();
    var stackmatReceiver = {
        receive: function(state) {
            state.commandByte = String.fromCharCode(state.commandByte);
            $scope.receivedStackmatState = state;
        }
    };
    stackmatInterpreter.connect(Module.stackmatstateReceiver.implement(stackmatReceiver));

    var fskParams = {};
    fskParams.samplesPerSecond = audioContext.sampleRate;
    fskParams.bitsPerSecond = bitsPerSecond;
    fskParams.markFrequency = onFrequency;
    fskParams.spaceFrequency = offFrequency;
    var modulator = new Module.Modulator(fskParams);
    var demodulator = new Module.Demodulator(fskParams);
    $scope.receivedBits = '';
    $scope.receivedMessageJson = function() {
        if(fastMode()) {
            return "FAST MODE";
        }
        return toStringJson(bytesListener.chars.join(""));
    };
    $scope.receivedStackmatState = null;
    var pendingBitPusher = null;
    var batchedBits = [];
    function bitPusher() {
        pendingBitPusher = null;
        for(var i = 0; i < batchedBits.length; i++) {
            var bit = batchedBits[i];
            if(($scope.receivedBits.length + 1) % 11 == 0) {
                $scope.receivedBits += " ";
            }
            rs232interpreter.receive(bit);
            $scope.receivedBits += (bit ? "1" : "0");
        }
        batchedBits.length = 0;
        if(fastMode()) {
            $scope.receivedBits = "FAST MODE";
        }
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
        var bits = $scope.eightN1bits.replace(/ /g, "").split("").map(function(b) { return parseInt(b); });
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
        $scope.receivedStackmatState = null;
        batchedBits = [];
        stackmatInterpreter.reset();
        rs232interpreter.reset();
        bytesListener.chars.length = 0;
    };
}

// Allow blob links.
var app = angular.module('modemTestModule', []).config([
    '$compileProvider',
    function($compileProvider) {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
    }
]);


app.directive('stackmat', function() {
    return {
        restrict: 'E',
        scope: {
            state: "=",
            readonly: "="
        },
        template: '<span style="display: inline-block"><label><input type="text" ng-readonly="readonly" size="7" maxlength="7" ng-model="state.millis"></input>millis</label>' +
        '<input type="text" ng-readonly="readonly" size="1" maxlength="1" ng-model="state.commandByte"></input><br>' +
        '<label><input type="radio" ng-disabled="readonly" ng-model="state.generation" value="2">gen2</label>' +
        '<label><input type="radio" ng-disabled="readonly" ng-model="state.generation" value="3">gen3</label></span>'
    };
});
