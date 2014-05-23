Module.getLogLevels = Module.cwrap("getLogLevels", 'string');
Module.setLogLevels = Module.cwrap("setLogLevels", null, ['string']);
