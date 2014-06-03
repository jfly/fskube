// These are here instead of in embind.cpp because embind can't deal with char*,
// it can only handle std::string. We don't want to use std::string because it
// seriously bloats the size of the generated code.
Module.getLogLevels = Module.cwrap("getLogLevels", 'string');
Module.setLogLevels = Module.cwrap("setLogLevels", null, ['string']);

var methods = {
    initialize: function(sampleRate) {
        Module.fskube_initialize(sampleRate);
    },
    addSample: function(samples) {
        for(var i = 0; i < samples.length; i++) {
            var stateAvailable = Module.fskube_addSample(samples[i]);
            if(stateAvailable) {
                var state = Module.fskube_getState();
                postMessage({
                    method: "newState",
                    args: [ state ]
                });
            }
        }
    },
    setLogLevels: function(levels) {
        Module.setLogLevels(levels);
    },
    getLogLevels: function() {
        postMessage({
            method: "getLogLevels",
            args: [ Module.getLogLevels() ]
        });
    }
};

// TODO - for now we're assuming we're running in a webworker
this.onmessage = function(e) {
    methods[e.data.method].apply(null, e.data.args);
};
