var Modem;

(function() {

Modem = function(samplesPerSecond, bitsPerSecond, markFrequency, spaceFrequency) {
    this._samplesPerSecond = samplesPerSecond;
    this._bitsPerSecond = bitsPerSecond;
    this._markFrequency = markFrequency;
    this._spaceFrequency = spaceFrequency;

    this._secondsPerBit = 1.0 / this._bitsPerSecond;
    this._samplesPerBit = this._secondsPerBit * this._samplesPerSecond;

    // Histeresis to avoid issues if the signal wavers around zero.
    // See nexus5helloworld for an example of some noise around zero at the
    // start of transmission.
    this._highThreshold = 0.4;
    this._lowThreshold = -0.4;

    this._bitListeners = [];
    
    this.reset();
};

Modem.prototype.reset = function() {
    this._recordSampleIndex = -1;
    this._lastImportantIndexAndSample = null;
    this._lastZeroCrossingIndex = null;

    this._lastFrequencySeen = null;
    // This counts the number of half periods we've seen of this signal
    this._lastFrequencySeenCount = 0;
    this._insignificantSignalCount = 0;
};

Modem.prototype.sampleIndexToTime = function(sampleIndex) {
    return sampleIndex / this._samplesPerSecond;
};

Modem.prototype.timeToSampleIndex = function(time) {
    return Math.round(time * this._samplesPerSecond);
};

/**
 * Given an array of bits, returns an array of samples
 * that encode the bitstream in FSK.
 */
Modem.prototype.modulate = function(bits) {
    var bufferSize = bits.length * this._samplesPerBit;
    var samples = [];
    var nextX = null;
    while(samples.length < bufferSize) {
        var sampleIndex = samples.length;
        var time = this.sampleIndexToTime(sampleIndex);
        var nextTime = this.sampleIndexToTime(sampleIndex + 1);
        var bitIndex = Math.floor(sampleIndex / this._samplesPerBit);
        var bit = bits[bitIndex];
        var frequency = bit ? this._markFrequency : this._spaceFrequency;

        var x = time * 2 * Math.PI * frequency;
        var offset = 0;
        if(nextX !== null) {
            offset = nextX - x;
        }
        x += offset;
        nextX = nextTime * 2 * Math.PI * frequency + offset;
        samples[sampleIndex] = Math.sin(x);
    }
    return samples;
};

function sign(n) {
    if(n === 0) {
        return 0;
    }
    return n > 0 ? 1 : -1;
}

Modem.prototype.frequencyToBit = function(frequency) {
    return frequency == this._markFrequency ? 1 : 0;
};

/**
 * Assume that whatever frequency we're seeing continues until a bit
 * is fired, then reset our state. This is useful for testing where
 * we send in a signal that ends at precisely 0.
 */
Modem.prototype.flush = function() {
    if(this._lastFrequencySeenCount > 0) {
        this.fireBit(this.frequencyToBit(this._lastFrequencySeen));
    }
    this.reset();
};

/**
 * Called for every half period of a frequency we see.
 */
Modem.prototype._addFrequencySeen = function(frequency) {
    //console.log('Frequency seen! ' + frequency);//<<<
    if(this._lastFrequencySeen === null) {
        this._lastFrequencySeen = frequency;
        this._lastFrequencySeenCount = 0;
    }
    var secondsPerPeriod = 1.0 / this._lastFrequencySeen;
    var periodsPerBit = this._secondsPerBit / secondsPerPeriod;
    var halfPeriodsPerBit = Math.round(2 * periodsPerBit);
    if(frequency == this._lastFrequencySeen) {
        this._lastFrequencySeenCount++;
        //console.log("Saw frequency " + frequency + "hZ this many times so far: " + this._lastFrequencySeenCount);//<<<
        if(this._lastFrequencySeenCount >= halfPeriodsPerBit) {
            var bit = this.frequencyToBit(this._lastFrequencySeen);
            this.fireBit(bit);
            this._lastFrequencySeenCount = 0;
        }
    } else {
        // We've witnessed a change in frequency! Set our frequency
        // seen count to 1. This may mean throwing out data from an
        // incomplete previous frequency, log a message in that case.
        //<<< TODO - comment on this
        if(this._lastFrequencySeenCount > 0 && this._lastFrequencySeenCount >= halfPeriodsPerBit-1) {
            var bit = this.frequencyToBit(this._lastFrequencySeen);
            console.log("Dumping a bit " + bit + " here");//<<<
            this.fireBit(bit);
            //<<<
            //console.log("Throwing away the " + this._lastFrequencySeenCount + " occurrences of " + this._lastFrequencySeen + "hZ halfPeriodsPerBit: " + halfPeriodsPerBit);
            //<<< This is the guy that confused us, just let him go
            this._lastFrequencySeen = frequency;
            this._lastFrequencySeenCount = 0;
            //<<<
        } else {
            this._lastFrequencySeen = frequency;
            this._lastFrequencySeenCount = 1;
        }
    }
};

/**
 * Given the time at which a zero crossing occurred, determine
 * the current frequency of the signal.
 * If the frequency is nonsensical, reset everything.
 * If the frequncy is near the mark or space frequency, 
 */
Modem.prototype._addZeroCrossing = function(index) {
    if(this._lastZeroCrossingIndex !== null) {
        var crossingTimeDelta = this.sampleIndexToTime(index - this._lastZeroCrossingIndex);
        // 1/2th the hZ of a signal is its expected amount of time
        // between zero crossings.
        var markCrossingTime = 0.5/this._markFrequency;
        var spaceCrossingTime = 0.5/this._spaceFrequency;
        var markRatio = crossingTimeDelta / markCrossingTime;
        var spaceRatio = crossingTimeDelta / spaceCrossingTime;
        var distanceToMark = Math.abs(markRatio - 1);
        var distanceToSpace = Math.abs(spaceRatio - 1);
        console.log("Zero crossing! @" + index + " " + this._lastZeroCrossingIndex + " " + crossingTimeDelta);//<<<
        console.log('distanceToMark: ' + distanceToMark + " distanceToSpace: " + distanceToSpace);//<<<
        if(distanceToMark < distanceToSpace) {
            this._addFrequencySeen(this._markFrequency);
        } else {
            this._addFrequencySeen(this._spaceFrequency);
        }
    }
    this._lastZeroCrossingIndex = index;
};

/**
 * Takes a single sample or an array of samples.
 * Successive calls will cause bit listeners to fire.
 */
Modem.prototype.demodulate = function(sample) {
    if(sample instanceof Array) {
        var samples = sample;
        for(var i = 0; i < samples.length; i++) {
            this.demodulate(samples[i]);
        }
        return;
    }
    this._recordSampleIndex++;
    var isHigh = sample >= this._highThreshold;
    var isLow = sample <= this._lowThreshold;
    if(!isHigh && !isLow) {
        this._insignificantSignalCount++;
        if(this._insignificantSignalCount > this._samplesPerBit) {
            // We've seen a bunch of insignificant signals in a row.
            // There's probably no signal. Flush what we have.
            this.flush();
            // flush() sets _recordSampleIndex to -1, so increment here.
            this._recordSampleIndex++;
        }
        // Quick bootstrapping. If we haven't seen any "significant"
        // signals yet, and this one is close to zero (ie:
        // "insignificant"), treat it as a zero. Note that we don't
        // call _addZeroCrossing() here, as we may have a bunch
        // of zeros in a row, and we don't want them to be treated as
        // half periods of our signal.
        if(this._lastImportantIndexAndSample === null) {
            this._lastZeroCrossingIndex = this._recordSampleIndex;
        }
        return;
    }
    this._insignificantSignalCount = 0;
    if(this._lastImportantIndexAndSample !== null) {
        var index = this._recordSampleIndex;
        var lastIndex = this._lastImportantIndexAndSample[0];
        var lastSample = this._lastImportantIndexAndSample[1];
        if(sign(lastSample) != sign(sample)) {
            // We've got 2 points that are on opposite sides of the x axis:
            //    point1 = (lastIndex, lastSample)
            //    point2 = (index, sample)
            // Imagine a straight line connecting them. We'd like to know
            // where that line crosses the x axis. Lets call that crossing
            // point (C, 0). The slope from point1 to (C, 0) should be the same
            // as the slope from (C, 0) to point2:
            //   (0 - lastSample) / (C - lastIndex) = (sample - 0) / (index - C)
            //   -lastSample * (index - C) = sample * (C - lastIndex)
            //   -lastSample*index + lastSample*C = sample*C - sample*lastIndex
            //   -lastSample*index + sample*lastIndex = sample*C - C*lastSample
            //   C = (sample*lastIndex - lastSample*index) / (sample - lastSample)
            var crossingIndex = (sample*lastIndex - lastSample*index) / (sample - lastSample);
            // We crossed the x axis in a "significant" way!
            this._addZeroCrossing(crossingIndex);
        }
    }
    this._lastImportantIndexAndSample = [ index, sample ];
};

Modem.prototype.fireBit = function(bit) {
    this._bitListeners.forEach(function(bl) {
        bl(bit);
    });
};

Modem.prototype.addBitListener = function(bitListener) {
    this._bitListeners.push(bitListener);
};

Modem.prototype.removeBitListener = function(bitListener) {
    var i = this._bitListeners.indexOf(bitListener);
    this._bitListeners.splice(i, 1);
};

})();

if(typeof(module) != "undefined") {
    module.exports = Modem;
}
