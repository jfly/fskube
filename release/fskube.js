// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [null,null,null,null,null,null,null,null,null,null],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;

function jsCall() {
  var args = Array.prototype.slice.call(arguments);
  return Runtime.functionPointers[args[0]].apply(null, args.slice(1));
}








//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))>>0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))>>0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===
var __ZTIt = 14848;
var __ZTIs = 14832;
var __ZTIm = 14912;
var __ZTIl = 14896;
var __ZTVN10__cxxabiv119__pointer_type_infoE = 14608;
var __ZTIi = 14864;
var __ZTIh = 14800;
var __ZTIj = 14880;
var __ZTId = 14944;
var __ZTVN10__cxxabiv117__class_type_infoE = 14568;
var __ZTIf = 14928;
var __ZTIa = 14816;
var __ZTVN10__cxxabiv120__si_class_type_infoE = 14952;
var __ZTIc = 14784;




STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(15715);
/* global initializers */ __ATINIT__.push({ func: function() { __GLOBAL__I_a() } }, { func: function() { __GLOBAL__I_a65() } }, { func: function() { __GLOBAL__I_a81() } }, { func: function() { __GLOBAL__I_a101() } }, { func: function() { __GLOBAL__I_a125() } }, { func: function() { __GLOBAL__I_a136() } }, { func: function() { __GLOBAL__I_a159() } });


/* memory initializer */ allocate([70,115,107,80,97,114,97,109,115,0,0,0,0,0,0,0,115,97,109,112,108,101,115,80,101,114,83,101,99,111,110,100,0,0,0,0,0,0,0,0,98,105,116,115,80,101,114,83,101,99,111,110,100,0,0,0,109,97,114,107,70,114,101,113,117,101,110,99,121,0,0,0,115,112,97,99,101,70,114,101,113,117,101,110,99,121,0,0,83,116,97,99,107,109,97,116,83,116,97,116,101,0,0,0,109,105,108,108,105,115,0,0,103,101,110,101,114,97,116,105,111,110,0,0,0,0,0,0,99,104,101,99,107,115,117,109,0,0,0,0,0,0,0,0,99,111,109,112,117,116,101,100,67,104,101,99,107,115,117,109,0,0,0,0,0,0,0,0,108,102,0,0,0,0,0,0,99,114,0,0,0,0,0,0,99,111,109,109,97,110,100,66,121,116,101,0,0,0,0,0,111,110,0,0,0,0,0,0,102,115,107,117,98,101,95,105,110,105,116,105,97,108,105,122,101,0,0,0,0,0,0,0,98,111,111,108,82,101,99,101,105,118,101,114,0,0,0,0,98,111,111,108,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,0,0,0,0,0,100,111,117,98,108,101,82,101,99,101,105,118,101,114,0,0,100,111,117,98,108,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,0,0,0,105,110,116,82,101,99,101,105,118,101,114,0,0,0,0,0,105,110,116,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,0,0,0,0,0,0,115,116,97,99,107,109,97,116,115,116,97,116,101,82,101,99,101,105,118,101,114,0,0,0,115,116,97,99,107,109,97,116,115,116,97,116,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,0,0,0,0,98,111,111,108,82,101,99,101,105,118,101,114,95,100,111,117,98,108,101,83,101,110,100,101,114,0,0,0,0,0,0,0,99,111,110,110,101,99,116,0,100,111,117,98,108,101,82,101,99,101,105,118,101,114,95,98,111,111,108,83,101,110,100,101,114,0,0,0,0,0,0,0,105,110,116,82,101,99,101,105,118,101,114,95,98,111,111,108,83,101,110,100,101,114,0,0,98,111,111,108,82,101,99,101,105,118,101,114,95,105,110,116,83,101,110,100,101,114,0,0,105,110,116,82,101,99,101,105,118,101,114,95,115,116,97,99,107,109,97,116,115,116,97,116,101,83,101,110,100,101,114,0,115,116,97,99,107,109,97,116,115,116,97,116,101,82,101,99,101,105,118,101,114,95,105,110,116,83,101,110,100,101,114,0,77,111,100,117,108,97,116,111,114,0,0,0,0,0,0,0,114,101,115,101,116,0,0,0,68,101,109,111,100,117,108,97,116,111,114,0,0,0,0,0,102,108,117,115,104,0,0,0,82,115,50,51,50,83,121,110,116,104,101,115,105,122,101,114,0,0,0,0,0,0,0,0,82,115,50,51,50,73,110,116,101,114,112,114,101,116,101,114,0,0,0,0,0,0,0,0,83,116,97,99,107,109,97,116,83,121,110,116,104,101,115,105,122,101,114,0,0,0,0,0,83,116,97,99,107,109,97,116,73,110,116,101,114,112,114,101,116,101,114,0,0,0,0,0,118,105,105,0,0,0,0,0,80,78,54,102,115,107,117,98,101,49,57,83,116,97,99,107,109,97,116,73,110,116,101,114,112,114,101,116,101,114,69,0,24,57,0,0,240,2,0,0,0,0,0,0,184,23,0,0,105,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,105,78,83,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,69,69,0,0,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,105,69,69,0,0,0,240,56,0,0,112,3,0,0,112,58,0,0,72,3,0,0,136,3,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,49,57,83,116,97,99,107,109,97,116,73,110,116,101,114,112,114,101,116,101,114,69,0,0,0,0,0,0,0,0,24,57,0,0,160,3,0,0,1,0,0,0,184,23,0,0,105,105,0,0,0,0,0,0,80,78,54,102,115,107,117,98,101,49,57,83,116,97,99,107,109,97,116,83,121,110,116,104,101,115,105,122,101,114,69,0,24,57,0,0,224,3,0,0,0,0,0,0,136,23,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,78,83,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,105,69,69,0,0,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,78,83,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,69,69,0,240,56,0,0,88,4,0,0,112,58,0,0,48,4,0,0,128,4,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,49,57,83,116,97,99,107,109,97,116,83,121,110,116,104,101,115,105,122,101,114,69,0,0,0,0,0,0,0,0,24,57,0,0,152,4,0,0,1,0,0,0,136,23,0,0,118,105,105,0,0,0,0,0,80,78,54,102,115,107,117,98,101,49,54,82,115,50,51,50,73,110,116,101,114,112,114,101,116,101,114,69,0,0,0,0,24,57,0,0,216,4,0,0,0,0,0,0,136,22,0,0,105,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,105,69,69,0,0,0,0,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,98,69,69,0,0,0,240,56,0,0,72,5,0,0,112,58,0,0,48,5,0,0,96,5,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,49,54,82,115,50,51,50,73,110,116,101,114,112,114,101,116,101,114,69,0,0,0,24,57,0,0,120,5,0,0,1,0,0,0,136,22,0,0,105,105,0,0,0,0,0,0,80,78,54,102,115,107,117,98,101,49,54,82,115,50,51,50,83,121,110,116,104,101,115,105,122,101,114,69,0,0,0,0,24,57,0,0,176,5,0,0,0,0,0,0,88,22,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,105,98,69,69,0,0,0,0,112,58,0,0,0,6,0,0,136,3,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,49,54,82,115,50,51,50,83,121,110,116,104,101,115,105,122,101,114,69,0,0,0,24,57,0,0,40,6,0,0,1,0,0,0,88,22,0,0,118,105,105,0,0,0,0,0,80,78,54,102,115,107,117,98,101,49,49,68,101,109,111,100,117,108,97,116,111,114,69,0,24,57,0,0,96,6,0,0,0,0,0,0,184,21,0,0,105,105,105,0,0,0,0,0,78,54,102,115,107,117,98,101,57,70,115,107,80,97,114,97,109,115,69,0,0,0,0,0,240,56,0,0,144,6,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,100,98,69,69,0,0,0,0,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,100,69,69,0,0,0,240,56,0,0,232,6,0,0,112,58,0,0,208,6,0,0,0,7,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,49,49,68,101,109,111,100,117,108,97,116,111,114,69,0,0,0,0,0,0,0,0,24,57,0,0,24,7,0,0,1,0,0,0,184,21,0,0,118,105,105,0,0,0,0,0,80,78,54,102,115,107,117,98,101,57,77,111,100,117,108,97,116,111,114,69,0,0,0,0,24,57,0,0,80,7,0,0,0,0,0,0,144,21,0,0,105,105,105,0,0,0,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,100,69,69,0,0,0,0,112,58,0,0,160,7,0,0,96,5,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,57,77,111,100,117,108,97,116,111,114,69,0,0,0,24,57,0,0,200,7,0,0,1,0,0,0,144,21,0,0,118,105,105,105,0,0,0,0,80,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,105,69,69,0,0,24,57,0,0,248,7,0,0,0,0,0,0,136,3,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,78,83,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,105,69,69,0,24,57,0,0,32,8,0,0,0,0,0,0,136,4,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,78,83,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,105,69,69,0,0,0,0,0,0,0,0,24,57,0,0,120,8,0,0,1,0,0,0,136,4,0,0,118,105,105,105,0,0,0,0,80,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,78,83,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,69,69,0,0,0,0,0,0,0,0,24,57,0,0,192,8,0,0,0,0,0,0,128,4,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,105,78,83,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,69,69,0,24,57,0,0,0,9,0,0,0,0,0,0,144,3,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,105,78,83,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,69,69,0,0,0,0,0,0,0,0,24,57,0,0,88,9,0,0,1,0,0,0,144,3,0,0,118,105,105,105,0,0,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,105,69,69,0,0,0,24,57,0,0,160,9,0,0,0,0,0,0,104,5,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,105,69,69,0,0,24,57,0,0,232,9,0,0,1,0,0,0,104,5,0,0,118,105,105,105,0,0,0,0,80,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,98,69,69,0,0,24,57,0,0,24,10,0,0,0,0,0,0,96,5,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,105,98,69,69,0,0,0,24,57,0,0,64,10,0,0,0,0,0,0,24,6,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,105,98,69,69,0,0,24,57,0,0,136,10,0,0,1,0,0,0,24,6,0,0,118,105,105,105,0,0,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,100,98,69,69,0,0,0,24,57,0,0,184,10,0,0,0,0,0,0,8,7,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,100,98,69,69,0,0,24,57,0,0,0,11,0,0,1,0,0,0,8,7,0,0,118,105,105,105,0,0,0,0,80,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,100,69,69,0,0,24,57,0,0,48,11,0,0,0,0,0,0,0,7,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,100,69,69,0,0,0,24,57,0,0,88,11,0,0,0,0,0,0,184,7,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,100,69,69,0,0,24,57,0,0,160,11,0,0,1,0,0,0,184,7,0,0,105,109,112,108,101,109,101,110,116,0,0,0,0,0,0,0,0,0,0,0,112,12,0,0,22,0,0,0,23,0,0,0,24,0,0,0,0,0,0,0,78,54,102,115,107,117,98,101,50,56,115,116,97,99,107,109,97,116,115,116,97,116,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,55,119,114,97,112,112,101,114,73,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,78,83,49,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,69,69,69,69,0,0,0,0,0,0,0,0,112,58,0,0,24,12,0,0,128,4,0,0,0,0,0,0,112,58,0,0,240,11,0,0,96,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,78,54,102,115,107,117,98,101,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,0,0,0,0,0,0,0,0,240,56,0,0,144,12,0,0,0,0,0,0,96,12,0,0,25,0,0,0,26,0,0,0,27,0,0,0,0,0,0,0,105,105,105,0,0,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,51,118,97,108,69,0,0,0,0,0,0,240,56,0,0,216,12,0,0,80,78,54,102,115,107,117,98,101,50,56,115,116,97,99,107,109,97,116,115,116,97,116,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,0,0,24,57,0,0,248,12,0,0,0,0,0,0,112,12,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,50,56,115,116,97,99,107,109,97,116,115,116,97,116,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,0,24,57,0,0,88,13,0,0,1,0,0,0,112,12,0,0,118,105,105,105,0,0,0,0,118,105,0,0,0,0,0,0,118,0,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,78,83,95,49,51,83,116,97,99,107,109,97,116,83,116,97,116,101,69,69,69,0,0,0,0,0,0,0,24,57,0,0,184,13,0,0,1,0,0,0,128,4,0,0,0,0,0,0,112,14,0,0,28,0,0,0,29,0,0,0,30,0,0,0,0,0,0,0,78,54,102,115,107,117,98,101,49,56,105,110,116,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,55,119,114,97,112,112,101,114,73,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,105,69,69,69,69,0,0,0,112,58,0,0,48,14,0,0,136,3,0,0,0,0,0,0,112,58,0,0,16,14,0,0,96,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,14,0,0,31,0,0,0,32,0,0,0,27,0,0,0,0,0,0,0,105,105,105,0,0,0,0,0,80,78,54,102,115,107,117,98,101,49,56,105,110,116,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,24,57,0,0,176,14,0,0,0,0,0,0,112,14,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,49,56,105,110,116,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,24,57,0,0,0,15,0,0,1,0,0,0,112,14,0,0,118,105,105,105,0,0,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,105,69,69,0,24,57,0,0,72,15,0,0,1,0,0,0,136,3,0,0,0,0,0,0,240,15,0,0,33,0,0,0,34,0,0,0,35,0,0,0,0,0,0,0,78,54,102,115,107,117,98,101,50,49,100,111,117,98,108,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,55,119,114,97,112,112,101,114,73,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,100,69,69,69,69,0,0,0,112,58,0,0,176,15,0,0,0,7,0,0,0,0,0,0,112,58,0,0,136,15,0,0,224,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,15,0,0,36,0,0,0,37,0,0,0,27,0,0,0,0,0,0,0,105,105,105,0,0,0,0,0,80,78,54,102,115,107,117,98,101,50,49,100,111,117,98,108,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,0,24,57,0,0,48,16,0,0,0,0,0,0,240,15,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,50,49,100,111,117,98,108,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,24,57,0,0,136,16,0,0,1,0,0,0,240,15,0,0,118,105,105,100,0,0,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,100,69,69,0,24,57,0,0,216,16,0,0,1,0,0,0,0,7,0,0,0,0,0,0,120,17,0,0,38,0,0,0,39,0,0,0,40,0,0,0,0,0,0,0,78,54,102,115,107,117,98,101,49,57,98,111,111,108,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,55,119,114,97,112,112,101,114,73,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,98,69,69,69,69,0,0,0,112,58,0,0,56,17,0,0,96,5,0,0,0,0,0,0,112,58,0,0,24,17,0,0,104,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,17,0,0,41,0,0,0,42,0,0,0,27,0,0,0,0,0,0,0,105,105,105,0,0,0,0,0,80,78,54,102,115,107,117,98,101,49,57,98,111,111,108,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,24,57,0,0,184,17,0,0,0,0,0,0,120,17,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,49,57,98,111,111,108,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,0,0,24,57,0,0,8,18,0,0,1,0,0,0,120,17,0,0,118,105,105,105,0,0,0,0,118,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,98,69,69,0,24,57,0,0,88,18,0,0,1,0,0,0,96,5,0,0,105,105,0,0,0,0,0,0,105,105,100,0,0,0,0,0,118,105,105,0,0,0,0,0,118,105,105,105,0,0,0,0,105,105,105,0,0,0,0,0,118,105,105,105,0,0,0,0,105,105,105,0,0,0,0,0,118,105,105,105,0,0,0,0,105,105,105,0,0,0,0,0,118,105,0,0,0,0,0,0,105,0,0,0,0,0,0,0,118,105,105,105,0,0,0,0,105,105,105,0,0,0,0,0,118,105,0,0,0,0,0,0,105,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,115,107,0,0,0,0,0,0,0,0,0,144,21,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,0,0,0,0,184,21,0,0,47,0,0,0,48,0,0,0,49,0,0,0,0,0,0,0,102,115,107,46,109,97,114,107,70,114,101,113,117,101,110,99,121,32,60,32,102,115,107,46,115,112,97,99,101,70,114,101,113,117,101,110,99,121,0,0,98,108,100,47,102,115,107,46,99,112,112,0,0,0,0,0,115,101,116,70,115,107,80,97,114,97,109,115,0,0,0,0,37,115,47,37,100,32,102,108,117,115,104,40,41,32,108,97,115,116,70,114,101,113,117,101,110,99,121,72,97,108,102,83,101,101,110,67,111,117,110,116,32,37,100,32,108,97,115,116,70,114,101,113,117,101,110,99,121,72,97,108,102,83,101,101,110,32,37,100,10,0,0,0,37,115,47,37,100,32,115,101,110,100,105,110,103,32,98,105,116,32,37,100,10,0,0,0,118,97,108,117,101,32,60,61,32,49,46,48,0,0,0,0,118,97,108,117,101,32,62,61,32,45,49,46,48,0,0,0,37,115,47,37,100,32,68,101,109,111,100,117,108,97,116,111,114,58,58,114,101,99,101,105,118,101,40,37,102,41,32,115,97,109,112,108,101,73,110,100,101,120,58,32,37,108,108,117,10,0,0,0,0,0,0,0,37,115,47,37,100,32,114,101,99,101,105,118,101,40,41,32,37,102,32,37,100,32,37,102,10,0,0,0,0,0,0,0,37,115,47,37,100,32,90,101,114,111,32,99,114,111,115,115,105,110,103,33,32,64,37,108,108,117,43,37,102,32,40,108,97,115,116,32,111,110,101,32,119,97,115,32,97,116,32,37,108,108,117,43,37,102,32,105,115,86,97,108,105,100,58,32,37,100,41,10,0,0,0,0,37,115,47,37,100,32,90,101,114,111,32,99,114,111,115,115,105,110,103,32,111,102,32,37,102,32,115,101,99,111,110,100,115,32,40,100,105,115,116,97,110,99,101,84,111,77,97,114,107,58,32,37,102,32,100,105,115,116,97,110,99,101,84,111,83,112,97,99,101,58,32,37,102,41,10,0,0,0,0,0,37,115,47,37,100,32,73,103,110,111,114,105,110,103,32,122,101,114,111,32,99,114,111,115,115,105,110,103,10,0,0,0,37,115,47,37,100,32,90,101,114,111,32,99,114,111,115,115,105,110,103,32,105,115,32,110,111,119,32,37,108,108,117,43,37,102,32,105,115,86,97,108,105,100,58,32,37,100,10,0,37,115,47,37,100,32,70,114,101,113,117,101,110,99,121,32,115,101,101,110,33,32,37,117,104,90,32,40,104,97,100,32,115,101,101,110,32,37,117,104,90,32,37,117,32,116,105,109,101,115,41,10,0,0,0,0,78,54,102,115,107,117,98,101,57,77,111,100,117,108,97,116,111,114,69,0,0,0,0,0,112,58,0,0,120,21,0,0,184,7,0,0,0,0,0,0,78,54,102,115,107,117,98,101,49,49,68,101,109,111,100,117,108,97,116,111,114,69,0,0,112,58,0,0,160,21,0,0,8,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,114,115,50,51,50,0,0,0,0,0,0,0,88,22,0,0,50,0,0,0,51,0,0,0,52,0,0,0,0,0,0,0,0,0,0,0,136,22,0,0,53,0,0,0,54,0,0,0,55,0,0,0,0,0,0,0,37,115,47,37,100,32,84,104,114,111,119,105,110,103,32,97,119,97,121,32,105,110,99,111,109,112,108,101,116,101,32,99,104,97,114,97,99,116,101,114,32,37,100,10,0,0,0,0,78,54,102,115,107,117,98,101,49,54,82,115,50,51,50,83,121,110,116,104,101,115,105,122,101,114,69,0,0,0,0,0,112,58,0,0,56,22,0,0,24,6,0,0,0,0,0,0,78,54,102,115,107,117,98,101,49,54,82,115,50,51,50,73,110,116,101,114,112,114,101,116,101,114,69,0,0,0,0,0,112,58,0,0,104,22,0,0,104,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,116,97,99,107,109,97,116,0,0,0,0,0,0,0,0,0,0,0,0,136,23,0,0,56,0,0,0,57,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,184,23,0,0,59,0,0,0,60,0,0,0,61,0,0,0,0,0,0,0,37,115,47,37,100,32,83,116,97,99,107,109,97,116,73,110,116,101,114,112,114,101,116,101,114,58,58,114,101,99,101,105,118,101,40,37,100,41,10,0,114,101,99,101,105,118,101,0,37,115,47,37,100,32,84,104,114,111,119,105,110,103,32,97,119,97,121,32,112,97,114,116,105,97,108,32,115,105,103,110,97,108,32,111,102,32,37,100,32,98,121,116,101,115,10,0,37,115,47,37,100,32,84,104,114,111,119,105,110,103,32,97,119,97,121,32,114,117,110,32,111,110,32,115,105,103,110,97,108,10,0,0,0,0,0,0,78,54,102,115,107,117,98,101,49,57,83,116,97,99,107,109,97,116,83,121,110,116,104,101,115,105,122,101,114,69,0,0,112,58,0,0,104,23,0,0,136,4,0,0,0,0,0,0,78,54,102,115,107,117,98,101,49,57,83,116,97,99,107,109,97,116,73,110,116,101,114,112,114,101,116,101,114,69,0,0,112,58,0,0,152,23,0,0,144,3,0,0,0,0,0,0,44,0,0,0,0,0,0,0,42], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([102,97,108,115,101,0,0,0,98,108,100,47,108,111,103,103,105,110,103,46,99,112,112,0,99,114,101,97,116,101,76,111,103,72,97,110,100,108,101], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+9432);
/* memory initializer */ allocate([70,83,75,85,66,69,95,76,79,71,71,73,78,71,0,0,0,0,0,0,0,0,0,0,99,97,112,105,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,105,110,105,116,105,97,108,105,122,101,100,0,0,0,0,0,98,108,100,47,99,97,112,105,46,99,112,112,0,0,0,0,102,115,107,117,98,101,95,97,100,100,83,97,109,112,108,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,115,47,37,100,32,115,101,101,110,32,37,100,32,115,97,109,112,108,101,115,32,119,105,116,104,111,117,116,32,100,97,116,97,44,32,97,115,115,117,109,105,110,103,32,115,116,97,99,107,109,97,116,32,105,115,32,111,102,102,32,111,114,32,117,110,108,117,103,103,101,100,10,0,0,0,0,0,0,0,102,115,107,117,98,101,95,103,101,116,83,116,97,116,101,0,0,0,0,0,224,52,0,0,62,0,0,0,63,0,0,0,64,0,0,0,0,0,0,0,50,49,83,116,97,99,107,109,97,116,83,116,97,116,101,82,101,99,101,105,118,101,114,0,112,58,0,0,200,52,0,0,128,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,105,103,105,116,105,122,101,114,0,0,0,0,0,0,0,0,0,0,0,120,53,0,0,65,0,0,0,66,0,0,0,67,0,0,0,68,0,0,0,37,115,47,37,100,32,97,102,116,101,114,32,37,100,32,115,97,109,112,108,101,115,44,32,115,101,110,100,105,110,103,32,37,100,10,0,0,0,0,0,37,115,47,37,100,32,114,101,99,101,105,118,101,40,37,102,41,10,0,0,0,0,0,0,78,54,102,115,107,117,98,101,57,68,105,103,105,116,105,122,101,114,69,0,0,0,0,0,112,58,0,0,96,53,0,0,8,7,0,0,0,0,0,0,118,111,105,100,0,0,0,0,98,111,111,108,0,0,0,0,99,104,97,114,0,0,0,0,115,105,103,110,101,100,32,99,104,97,114,0,0,0,0,0,117,110,115,105,103,110,101,100,32,99,104,97,114,0,0,0,115,104,111,114,116,0,0,0,117,110,115,105,103,110,101,100,32,115,104,111,114,116,0,0,105,110,116,0,0,0,0,0,117,110,115,105,103,110,101,100,32,105,110,116,0,0,0,0,108,111,110,103,0,0,0,0,117,110,115,105,103,110,101,100,32,108,111,110,103,0,0,0,102,108,111,97,116,0,0,0,100,111,117,98,108,101,0,0,115,116,100,58,58,115,116,114,105,110,103,0,0,0,0,0,115,116,100,58,58,98,97,115,105,99,95,115,116,114,105,110,103,60,117,110,115,105,103,110,101,100,32,99,104,97,114,62,0,0,0,0,0,0,0,0,115,116,100,58,58,119,115,116,114,105,110,103,0,0,0,0,101,109,115,99,114,105,112,116,101,110,58,58,118,97,108,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,69,0,0,0,0,0,240,56,0,0,136,54,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,0,0,240,56,0,0,240,54,0,0,208,58,0,0,176,54,0,0,0,0,0,0,1,0,0,0,24,55,0,0,0,0,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,104,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,104,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,104,69,69,69,69,0,0,208,58,0,0,56,55,0,0,0,0,0,0,1,0,0,0,24,55,0,0,0,0,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,208,58,0,0,144,55,0,0,0,0,0,0,1,0,0,0,24,55,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,240,56,0,0,240,55,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,112,58,0,0,8,56,0,0,0,56,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,112,58,0,0,64,56,0,0,48,56,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,112,58,0,0,160,56,0,0,48,56,0,0,0,0,0,0,112,58,0,0,120,56,0,0,200,56,0,0,0,0,0,0,0,0,0,0,104,56,0,0,69,0,0,0,70,0,0,0,71,0,0,0,72,0,0,0,73,0,0,0,74,0,0,0,75,0,0,0,76,0,0,0,0,0,0,0,216,56,0,0,69,0,0,0,77,0,0,0,71,0,0,0,72,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,120,57,0,0,69,0,0,0,79,0,0,0,71,0,0,0,72,0,0,0,80,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,112,58,0,0,80,57,0,0,48,56,0,0,0,0,0,0,118,0,0,0,0,0,0,0,56,57,0,0,136,57,0,0,68,110,0,0,0,0,0,0,56,57,0,0,152,57,0,0,98,0,0,0,0,0,0,0,56,57,0,0,168,57,0,0,99,0,0,0,0,0,0,0,56,57,0,0,184,57,0,0,104,0,0,0,0,0,0,0,56,57,0,0,200,57,0,0,97,0,0,0,0,0,0,0,56,57,0,0,216,57,0,0,115,0,0,0,0,0,0,0,56,57,0,0,232,57,0,0,116,0,0,0,0,0,0,0,56,57,0,0,248,57,0,0,105,0,0,0,0,0,0,0,56,57,0,0,8,58,0,0,106,0,0,0,0,0,0,0,56,57,0,0,24,58,0,0,108,0,0,0,0,0,0,0,56,57,0,0,40,58,0,0,109,0,0,0,0,0,0,0,56,57,0,0,56,58,0,0,102,0,0,0,0,0,0,0,56,57,0,0,72,58,0,0,100,0,0,0,0,0,0,0,56,57,0,0,88,58,0,0,0,0,0,0,184,58,0,0,69,0,0,0,81,0,0,0,71,0,0,0,72,0,0,0,73,0,0,0,82,0,0,0,83,0,0,0,84,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,112,58,0,0,144,58,0,0,104,56,0,0,0,0,0,0,0,0,0,0,24,59,0,0,69,0,0,0,85,0,0,0,71,0,0,0,72,0,0,0,73,0,0,0,86,0,0,0,87,0,0,0,88,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,112,58,0,0,240,58,0,0,104,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,61,0,0,89,0,0,0,90,0,0,0,91,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,112,58,0,0,72,61,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+12936);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function __embind_register_value_object() {
  Module['printErr']('missing function: _embind_register_value_object'); abort(-1);
  }

   
  Module["_i64Subtract"] = _i64Subtract;

  var _DtoILow=true;

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  function __embind_register_void() {
  Module['printErr']('missing function: _embind_register_void'); abort(-1);
  }

  function __emval_get_method_caller() {
  Module['printErr']('missing function: _emval_get_method_caller'); abort(-1);
  }

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  
  
  var ___cxa_last_thrown_exception=0;function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr;
    }
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr;
    }

   
  Module["_memset"] = _memset;

  function __embind_register_bool() {
  Module['printErr']('missing function: _embind_register_bool'); abort(-1);
  }

  var _emscripten_landingpad=true;

  function _abort() {
      Module['abort']();
    }

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[((textIndex)>>0)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)>>0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)>>0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)>>0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)>>0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)>>0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)>>0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[((i)>>0)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }

  function __emval_call_method() {
  Module['printErr']('missing function: _emval_call_method'); abort(-1);
  }

  function __embind_register_std_wstring() {
  Module['printErr']('missing function: _embind_register_std_wstring'); abort(-1);
  }

  var _UItoF=true;

  function __embind_register_value_object_field() {
  Module['printErr']('missing function: _embind_register_value_object_field'); abort(-1);
  }

  function __embind_register_class() {
  Module['printErr']('missing function: _embind_register_class'); abort(-1);
  }


  function __emval_decref() {
  Module['printErr']('missing function: _emval_decref'); abort(-1);
  }

   
  Module["_i64Add"] = _i64Add;

  var _emscripten_postinvoke=true;

  function __embind_register_integer() {
  Module['printErr']('missing function: _embind_register_integer'); abort(-1);
  }

  
  
  
  
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
  
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr;
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
  
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
  
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _setenv(envname, envval, overwrite) {
      // int setenv(const char *envname, const char *envval, int overwrite);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/setenv.html
      if (envname === 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      }
      var name = Pointer_stringify(envname);
      var val = Pointer_stringify(envval);
      if (name === '' || name.indexOf('=') !== -1) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      }
      if (ENV.hasOwnProperty(name) && !overwrite) return 0;
      ENV[name] = val;
      ___buildEnvironment(ENV);
      return 0;
    }

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
          function pointerLockChange() {
            Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                  document['mozPointerLockElement'] === canvas ||
                                  document['webkitPointerLockElement'] === canvas ||
                                  document['msPointerLockElement'] === canvas;
          }
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  function _rint(x) {
      if (Math.abs(x % 1) !== 0.5) return Math.round(x);
      return x + x % 2 + ((x < 0) ? 1 : -1);
    }

  function __embind_register_emval() {
  Module['printErr']('missing function: _embind_register_emval'); abort(-1);
  }

  var _UItoD=true;

  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  var _sin=Math_sin;

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }

  function __embind_register_class_constructor() {
  Module['printErr']('missing function: _embind_register_class_constructor'); abort(-1);
  }

  function __embind_register_float() {
  Module['printErr']('missing function: _embind_register_float'); abort(-1);
  }

  function ___cxa_guard_release() {}

  function __embind_register_class_class_function() {
  Module['printErr']('missing function: _embind_register_class_class_function'); abort(-1);
  }

  var _emscripten_resume=true;

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[((variable)>>0)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[((variable)>>0)]=1;
        return 1;
      }
      return 0;
    }

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  function __embind_register_function() {
  Module['printErr']('missing function: _embind_register_function'); abort(-1);
  }

  
  var ___cxa_caught_exceptions=[];function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }

  function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
  
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _llvm_stackrestore(p) {
      var self = _llvm_stacksave;
      var ret = self.LLVM_SAVEDSTACKS[p];
      self.LLVM_SAVEDSTACKS.splice(p, 1);
      Runtime.stackRestore(ret);
    }

  var _DtoIHigh=true;

  function __embind_finalize_value_object() {
  Module['printErr']('missing function: _embind_finalize_value_object'); abort(-1);
  }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _llvm_stacksave() {
      var self = _llvm_stacksave;
      if (!self.LLVM_SAVEDSTACKS) {
        self.LLVM_SAVEDSTACKS = [];
      }
      self.LLVM_SAVEDSTACKS.push(Runtime.stackSave());
      return self.LLVM_SAVEDSTACKS.length-1;
    }

  function ___cxa_guard_abort() {}

  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }

  function __emval_run_destructors() {
  Module['printErr']('missing function: _emval_run_destructors'); abort(-1);
  }

  var _emscripten_preinvoke=true;

  function ___gxx_personality_v0() {
    }

  function __ZNSt9exceptionD2Ev() {}

   
  Module["_strcpy"] = _strcpy;

  function __embind_register_memory_view() {
  Module['printErr']('missing function: _embind_register_memory_view'); abort(-1);
  }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function ___errno_location() {
      return ___errno_state;
    }

  function __embind_register_class_function() {
  Module['printErr']('missing function: _embind_register_class_function'); abort(-1);
  }

  function __embind_register_std_string() {
  Module['printErr']('missing function: _embind_register_std_string'); abort(-1);
  }

  var __ZTISt9exception=allocate([allocate([1,0,0,0,0,0,0], "i8", ALLOC_STATIC)+8, 0], "i32", ALLOC_STATIC);

FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
___buildEnvironment(ENV);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function nullFunc_iiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viiiiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_vid(x) { Module["printErr"]("Invalid function pointer called with signature 'vid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_i(x) { Module["printErr"]("Invalid function pointer called with signature 'i'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_vi(x) { Module["printErr"]("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_vii(x) { Module["printErr"]("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_ii(x) { Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_iid(x) { Module["printErr"]("Invalid function pointer called with signature 'iid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viii(x) { Module["printErr"]("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_v(x) { Module["printErr"]("Invalid function pointer called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viid(x) { Module["printErr"]("Invalid function pointer called with signature 'viid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_iii(x) { Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_id(x) { Module["printErr"]("Invalid function pointer called with signature 'id'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  try {
    Module["dynCall_viiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vid(index,a1,a2) {
  try {
    Module["dynCall_vid"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iid(index,a1,a2) {
  try {
    return Module["dynCall_iid"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viid(index,a1,a2,a3) {
  try {
    Module["dynCall_viid"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_id(index,a1) {
  try {
    return Module["dynCall_id"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'almost asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var cttz_i8=env.cttz_i8|0;
  var ctlz_i8=env.ctlz_i8|0;
  var __ZTISt9exception=env.__ZTISt9exception|0;
  var _stderr=env._stderr|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = +env.NaN, inf = +env.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var jsCall=env.jsCall;
  var nullFunc_iiii=env.nullFunc_iiii;
  var nullFunc_viiiiiiiiii=env.nullFunc_viiiiiiiiii;
  var nullFunc_vid=env.nullFunc_vid;
  var nullFunc_viiiii=env.nullFunc_viiiii;
  var nullFunc_i=env.nullFunc_i;
  var nullFunc_vi=env.nullFunc_vi;
  var nullFunc_vii=env.nullFunc_vii;
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_iid=env.nullFunc_iid;
  var nullFunc_viii=env.nullFunc_viii;
  var nullFunc_v=env.nullFunc_v;
  var nullFunc_viid=env.nullFunc_viid;
  var nullFunc_viiiiii=env.nullFunc_viiiiii;
  var nullFunc_iii=env.nullFunc_iii;
  var nullFunc_id=env.nullFunc_id;
  var nullFunc_viiii=env.nullFunc_viiii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_viiiiiiiiii=env.invoke_viiiiiiiiii;
  var invoke_vid=env.invoke_vid;
  var invoke_viiiii=env.invoke_viiiii;
  var invoke_i=env.invoke_i;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_ii=env.invoke_ii;
  var invoke_iid=env.invoke_iid;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_viid=env.invoke_viid;
  var invoke_viiiiii=env.invoke_viiiiii;
  var invoke_iii=env.invoke_iii;
  var invoke_id=env.invoke_id;
  var invoke_viiii=env.invoke_viiii;
  var _sin=env._sin;
  var _send=env._send;
  var __embind_register_memory_view=env.__embind_register_memory_view;
  var __ZSt9terminatev=env.__ZSt9terminatev;
  var ___cxa_pure_virtual=env.___cxa_pure_virtual;
  var ___cxa_guard_acquire=env.___cxa_guard_acquire;
  var __reallyNegative=env.__reallyNegative;
  var ___cxa_is_number_type=env.___cxa_is_number_type;
  var ___gxx_personality_v0=env.___gxx_personality_v0;
  var __embind_register_integer=env.__embind_register_integer;
  var _llvm_stackrestore=env._llvm_stackrestore;
  var ___assert_fail=env.___assert_fail;
  var __embind_register_void=env.__embind_register_void;
  var ___cxa_find_matching_catch=env.___cxa_find_matching_catch;
  var __embind_register_value_object_field=env.__embind_register_value_object_field;
  var ___buildEnvironment=env.___buildEnvironment;
  var _fflush=env._fflush;
  var ___cxa_guard_release=env.___cxa_guard_release;
  var _time=env._time;
  var _pwrite=env._pwrite;
  var ___setErrNo=env.___setErrNo;
  var _sbrk=env._sbrk;
  var __embind_register_class_class_function=env.__embind_register_class_class_function;
  var __embind_register_std_wstring=env.__embind_register_std_wstring;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fileno=env._fileno;
  var __embind_register_bool=env.__embind_register_bool;
  var ___resumeException=env.___resumeException;
  var __embind_register_value_object=env.__embind_register_value_object;
  var _sysconf=env._sysconf;
  var ___cxa_begin_catch=env.___cxa_begin_catch;
  var ___cxa_call_unexpected=env.___cxa_call_unexpected;
  var __embind_register_emval=env.__embind_register_emval;
  var __embind_finalize_value_object=env.__embind_finalize_value_object;
  var __embind_register_class_function=env.__embind_register_class_function;
  var __emval_decref=env.__emval_decref;
  var _llvm_stacksave=env._llvm_stacksave;
  var _getenv=env._getenv;
  var __embind_register_float=env.__embind_register_float;
  var __embind_register_class=env.__embind_register_class;
  var __ZSt18uncaught_exceptionv=env.__ZSt18uncaught_exceptionv;
  var __embind_register_function=env.__embind_register_function;
  var _write=env._write;
  var ___errno_location=env.___errno_location;
  var __emval_call_method=env.__emval_call_method;
  var __embind_register_class_constructor=env.__embind_register_class_constructor;
  var __emval_run_destructors=env.__emval_run_destructors;
  var __ZNSt9exceptionD2Ev=env.__ZNSt9exceptionD2Ev;
  var _mkport=env._mkport;
  var ___cxa_does_inherit=env.___cxa_does_inherit;
  var __exit=env.__exit;
  var _abort=env._abort;
  var ___cxa_allocate_exception=env.___cxa_allocate_exception;
  var _fwrite=env._fwrite;
  var ___cxa_throw=env.___cxa_throw;
  var _fprintf=env._fprintf;
  var __formatString=env.__formatString;
  var _rint=env._rint;
  var _exit=env._exit;
  var __embind_register_std_string=env.__embind_register_std_string;
  var _setenv=env._setenv;
  var ___cxa_guard_abort=env.___cxa_guard_abort;
  var __emval_get_method_caller=env.__emval_get_method_caller;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS
function stackAlloc(size) {
  size = size|0;
  var ret = 0;
  ret = STACKTOP;
  STACKTOP = (STACKTOP + size)|0;
STACKTOP = (STACKTOP + 7)&-8;
  return ret|0;
}
function stackSave() {
  return STACKTOP|0;
}
function stackRestore(top) {
  top = top|0;
  STACKTOP = top;
}
function setThrew(threw, value) {
  threw = threw|0;
  value = value|0;
  if ((__THREW__|0) == 0) {
    __THREW__ = threw;
    threwValue = value;
  }
}
function copyTempFloat(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
  HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
  HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
  HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
}
function copyTempDouble(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
  HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
  HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
  HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
  HEAP8[tempDoublePtr+4>>0] = HEAP8[ptr+4>>0];
  HEAP8[tempDoublePtr+5>>0] = HEAP8[ptr+5>>0];
  HEAP8[tempDoublePtr+6>>0] = HEAP8[ptr+6>>0];
  HEAP8[tempDoublePtr+7>>0] = HEAP8[ptr+7>>0];
}
function setTempRet0(value) {
  value = value|0;
  tempRet0 = value;
}
function getTempRet0() {
  return tempRet0|0;
}

function __ZN10emscripten12value_objectIN6fskube9FskParamsEE5fieldIS2_jEERS3_PKcMT_T0_($this,$fieldName,$field) {
 $this = $this|0;
 $fieldName = $fieldName|0;
 $field = $field|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_malloc(4)|0);
 $1 = ($0|0)==(0|0);
 if (!($1)) {
  HEAP32[$0>>2] = $field;
 }
 $2 = (_malloc(4)|0);
 $3 = ($2|0)==(0|0);
 if (!($3)) {
  HEAP32[$2>>2] = $field;
 }
 __embind_register_value_object_field((1704|0),($fieldName|0),(14880|0),(4832|0),(92|0),($0|0),(14880|0),(4824|0),(93|0),($2|0));
 STACKTOP = sp;return ($this|0);
}
function __ZN10emscripten12value_objectIN6fskube13StackmatStateEE5fieldIS2_jEERS3_PKcMT_T0_($this,$fieldName,$field) {
 $this = $this|0;
 $fieldName = $fieldName|0;
 $field = $field|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_malloc(4)|0);
 $1 = ($0|0)==(0|0);
 if (!($1)) {
  HEAP32[$0>>2] = $field;
 }
 $2 = (_malloc(4)|0);
 $3 = ($2|0)==(0|0);
 if (!($3)) {
  HEAP32[$2>>2] = $field;
 }
 __embind_register_value_object_field((3248|0),($fieldName|0),(14880|0),(4800|0),(94|0),($0|0),(14880|0),(4792|0),(95|0),($2|0));
 STACKTOP = sp;return ($this|0);
}
function __ZN10emscripten12value_objectIN6fskube13StackmatStateEE5fieldIS2_hEERS3_PKcMT_T0_($this,$fieldName,$field) {
 $this = $this|0;
 $fieldName = $fieldName|0;
 $field = $field|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_malloc(4)|0);
 $1 = ($0|0)==(0|0);
 if (!($1)) {
  HEAP32[$0>>2] = $field;
 }
 $2 = (_malloc(4)|0);
 $3 = ($2|0)==(0|0);
 if (!($3)) {
  HEAP32[$2>>2] = $field;
 }
 __embind_register_value_object_field((3248|0),($fieldName|0),(14800|0),(4784|0),(96|0),($0|0),(14800|0),(4776|0),(97|0),($2|0));
 STACKTOP = sp;return ($this|0);
}
function __ZN6fskube6SenderIbdE7connectEPNS_8ReceiverIdEE($this,$next) {
 $this = $this|0;
 $next = $next|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 4|0);
 HEAP32[$0>>2] = $next;
 STACKTOP = sp;return;
}
function __ZN6fskube6SenderIdbE7connectEPNS_8ReceiverIbEE($this,$next) {
 $this = $this|0;
 $next = $next|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 4|0);
 HEAP32[$0>>2] = $next;
 STACKTOP = sp;return;
}
function __ZN6fskube6SenderIibE7connectEPNS_8ReceiverIbEE($this,$next) {
 $this = $this|0;
 $next = $next|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 4|0);
 HEAP32[$0>>2] = $next;
 STACKTOP = sp;return;
}
function __ZN6fskube6SenderIbiE7connectEPNS_8ReceiverIiEE($this,$next) {
 $this = $this|0;
 $next = $next|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 4|0);
 HEAP32[$0>>2] = $next;
 STACKTOP = sp;return;
}
function __ZN6fskube6SenderIiNS_13StackmatStateEE7connectEPNS_8ReceiverIS1_EE($this,$next) {
 $this = $this|0;
 $next = $next|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 4|0);
 HEAP32[$0>>2] = $next;
 STACKTOP = sp;return;
}
function __ZN6fskube6SenderINS_13StackmatStateEiE7connectEPNS_8ReceiverIiEE($this,$next) {
 $this = $this|0;
 $next = $next|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 4|0);
 HEAP32[$0>>2] = $next;
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube19StackmatInterpreterEFvvEvPS3_JEE6invokeERKS5_S6_($method,$wireThis) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vi[$8 & 255]($1);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vi[$8 & 255]($1);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal12operator_newIN6fskube19StackmatInterpreterEJEEEPT_DpT0_() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index2 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(52)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   $15 = (($0) + 4|0);
   HEAP32[$15>>2] = 0;
   HEAP32[$0>>2] = ((5832 + 8|0));
   $16 = (($0) + 48|0);
   HEAP32[$16>>2] = 0;
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN10emscripten8internal7InvokerIPN6fskube19StackmatInterpreterEJEE6invokeEPFS4_vE($fn) {
 $fn = $fn|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (FUNCTION_TABLE_i[$fn & 255]()|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN10emscripten8internal13getActualTypeIN6fskube19StackmatInterpreterEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube19StackmatInterpreterEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube6SenderIiNS1_13StackmatStateEEEE14convertPointerIS4_NS1_19StackmatInterpreterEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube6SenderIiNS1_13StackmatStateEEEE14convertPointerINS1_19StackmatInterpreterES4_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal12operator_newIN6fskube19StackmatSynthesizerEJEEEPT_DpT0_() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(8)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   $15 = (($0) + 4|0);
   HEAP32[$15>>2] = 0;
   HEAP32[$0>>2] = ((5808 + 8|0));
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN10emscripten8internal7InvokerIPN6fskube19StackmatSynthesizerEJEE6invokeEPFS4_vE($fn) {
 $fn = $fn|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (FUNCTION_TABLE_i[$fn & 255]()|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN10emscripten8internal13getActualTypeIN6fskube19StackmatSynthesizerEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube19StackmatSynthesizerEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube6SenderINS1_13StackmatStateEiEEE14convertPointerIS4_NS1_19StackmatSynthesizerEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube6SenderINS1_13StackmatStateEiEEE14convertPointerINS1_19StackmatSynthesizerES4_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube16Rs232InterpreterEFvvEvPS3_JEE6invokeERKS5_S6_($method,$wireThis) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vi[$8 & 255]($1);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vi[$8 & 255]($1);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal12operator_newIN6fskube16Rs232InterpreterEJEEEPT_DpT0_() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0;
 var $lpad$phi$i$index2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(24)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   $15 = (($0) + 4|0);
   HEAP32[$15>>2] = 0;
   HEAP32[$0>>2] = ((5616 + 8|0));
   $16 = (($0) + 8|0);
   HEAP8[$16>>0] = 1;
   $17 = (($0) + 12|0);
   HEAP32[$17>>2] = 0;
   $18 = (($0) + 16|0);
   HEAP8[$18>>0] = 0;
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN10emscripten8internal7InvokerIPN6fskube16Rs232InterpreterEJEE6invokeEPFS4_vE($fn) {
 $fn = $fn|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (FUNCTION_TABLE_i[$fn & 255]()|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN10emscripten8internal13getActualTypeIN6fskube16Rs232InterpreterEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube16Rs232InterpreterEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube6SenderIbiEEE14convertPointerIS3_NS1_16Rs232InterpreterEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube6SenderIbiEEE14convertPointerINS1_16Rs232InterpreterES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal12operator_newIN6fskube16Rs232SynthesizerEJEEEPT_DpT0_() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(8)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   $15 = (($0) + 4|0);
   HEAP32[$15>>2] = 0;
   HEAP32[$0>>2] = ((5592 + 8|0));
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN10emscripten8internal7InvokerIPN6fskube16Rs232SynthesizerEJEE6invokeEPFS4_vE($fn) {
 $fn = $fn|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (FUNCTION_TABLE_i[$fn & 255]()|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN10emscripten8internal13getActualTypeIN6fskube16Rs232SynthesizerEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube16Rs232SynthesizerEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube6SenderIibEEE14convertPointerIS3_NS1_16Rs232SynthesizerEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube6SenderIibEEE14convertPointerINS1_16Rs232SynthesizerES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube11DemodulatorEFvvEvPS3_JEE6invokeERKS5_S6_($method,$wireThis) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vi[$8 & 255]($1);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vi[$8 & 255]($1);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal12operator_newIN6fskube11DemodulatorEJNS2_9FskParamsEEEEPT_DpT0_($args) {
 $args = $args|0;
 var $$sroa$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $lpad$phi$i$index = 0, $lpad$phi$i$index13 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $$sroa$0 = sp + 64|0;
 $0 = sp + 32|0;
 $1 = sp;
 while(1) {
  $2 = (_malloc(120)|0);
  $3 = ($2|0)==(0|0);
  if (!($3)) {
   label = 12;
   break;
  }
  $4 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($4+0)|0);
  $5 = ($4|0)==(0);
  if ($5) {
   label = 9;
   break;
  }
  $6 = $4;
  __THREW__ = 0;
  invoke_v($6|0);
  $7 = __THREW__; __THREW__ = 0;
  $8 = $7&1;
  if ($8) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $10 = tempRet0;
   $lpad$phi$i$index = $9;$lpad$phi$i$index13 = $10;
  }
  else if ((label|0) == 9) {
   $14 = (___cxa_allocate_exception(4)|0);
   HEAP32[$14>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($14|0),(15704|0),(89|0));
   $15 = __THREW__; __THREW__ = 0;
   $16 = $15&1;
   if ($16) {
    $11 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $12 = tempRet0;
    $lpad$phi$i$index = $11;$lpad$phi$i$index13 = $12;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   $17 = (($args) + 8|0);
   $18 = HEAP32[$17>>2]|0;
   $19 = (($args) + 12|0);
   $20 = HEAP32[$19>>2]|0;
   $21 = (($2) + 4|0);
   HEAP32[$21>>2] = 0;
   HEAP32[$2>>2] = ((4896 + 8|0));
   $22 = (($2) + 24|0);
   $23 = $22;
   $24 = $23;
   HEAP32[$24>>2] = 0;
   $25 = (($23) + 4)|0;
   $26 = $25;
   HEAP32[$26>>2] = 0;
   $27 = $args;
   $28 = $27;
   $29 = HEAP32[$28>>2]|0;
   $30 = (($27) + 4)|0;
   $31 = $30;
   $32 = HEAP32[$31>>2]|0;
   $33 = $$sroa$0;
   $34 = $33;
   HEAP32[$34>>2] = $29;
   $35 = (($33) + 4)|0;
   $36 = $35;
   HEAP32[$36>>2] = $32;
   $37 = ($18>>>0)<($20>>>0);
   if ($37) {
    $40 = (($2) + 8|0);
    $41 = $$sroa$0;
    $42 = $41;
    $43 = HEAP32[$42>>2]|0;
    $44 = (($41) + 4)|0;
    $45 = $44;
    $46 = HEAP32[$45>>2]|0;
    $47 = $40;
    $48 = $47;
    HEAP32[$48>>2] = $43;
    $49 = (($47) + 4)|0;
    $50 = $49;
    HEAP32[$50>>2] = $46;
    $51 = (($2) + 16|0);
    HEAP32[$51>>2] = $18;
    $52 = (($2) + 20|0);
    HEAP32[$52>>2] = $20;
    $53 = (($2) + 32|0);
    ;HEAP32[$0+0>>2]=0|0;HEAP32[$0+4>>2]=0|0;HEAP32[$0+8>>2]=0|0;HEAP32[$0+12>>2]=0|0;HEAP32[$0+16>>2]=0|0;HEAP32[$0+20>>2]=0|0;HEAP32[$0+24>>2]=0|0;HEAP32[$0+28>>2]=0|0;
    ;HEAP32[$53+0>>2]=HEAP32[$0+0>>2]|0;HEAP32[$53+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[$53+8>>2]=HEAP32[$0+8>>2]|0;HEAP32[$53+12>>2]=HEAP32[$0+12>>2]|0;HEAP32[$53+16>>2]=HEAP32[$0+16>>2]|0;HEAP32[$53+20>>2]=HEAP32[$0+20>>2]|0;HEAP32[$53+24>>2]=HEAP32[$0+24>>2]|0;HEAP32[$53+28>>2]=HEAP32[$0+28>>2]|0;
    $54 = (($2) + 64|0);
    HEAP32[$54>>2] = 0;
    $55 = (($2) + 72|0);
    ;HEAP32[$1+0>>2]=0|0;HEAP32[$1+4>>2]=0|0;HEAP32[$1+8>>2]=0|0;HEAP32[$1+12>>2]=0|0;HEAP32[$1+16>>2]=0|0;HEAP32[$1+20>>2]=0|0;HEAP32[$1+24>>2]=0|0;HEAP32[$1+28>>2]=0|0;
    ;HEAP32[$55+0>>2]=HEAP32[$1+0>>2]|0;HEAP32[$55+4>>2]=HEAP32[$1+4>>2]|0;HEAP32[$55+8>>2]=HEAP32[$1+8>>2]|0;HEAP32[$55+12>>2]=HEAP32[$1+12>>2]|0;HEAP32[$55+16>>2]=HEAP32[$1+16>>2]|0;HEAP32[$55+20>>2]=HEAP32[$1+20>>2]|0;HEAP32[$55+24>>2]=HEAP32[$1+24>>2]|0;HEAP32[$55+28>>2]=HEAP32[$1+28>>2]|0;
    $56 = (($2) + 104|0);
    ;HEAP32[$56+0>>2]=0|0;HEAP32[$56+4>>2]=0|0;HEAP32[$56+8>>2]=0|0;HEAP32[$56+12>>2]=0|0;
    STACKTOP = sp;return ($2|0);
   }
   __THREW__ = 0;
   invoke_viiii(99,(4920|0),(4960|0),45,(4976|0));
   $38 = __THREW__; __THREW__ = 0;
   $39 = $38&1;
   if ($39) {
    $57 = ___cxa_find_matching_catch(-1,-1)|0;
    $58 = tempRet0;
    _free($2);
    ___resumeException($57|0);
    // unreachable;
   } else {
    // unreachable;
   }
  }
 } while(0);
 $13 = ($lpad$phi$i$index13|0)<(0);
 if ($13) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN10emscripten8internal7InvokerIPN6fskube11DemodulatorEJNS2_9FskParamsEEE6invokeEPFS4_S5_EPS5_($fn,$args) {
 $fn = $fn|0;
 $args = $args|0;
 var $0 = 0, $args$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $args$byval_copy = sp;
 ;HEAP32[$args$byval_copy+0>>2]=HEAP32[$args+0>>2]|0;HEAP32[$args$byval_copy+4>>2]=HEAP32[$args+4>>2]|0;HEAP32[$args$byval_copy+8>>2]=HEAP32[$args+8>>2]|0;HEAP32[$args$byval_copy+12>>2]=HEAP32[$args+12>>2]|0;
 $0 = (FUNCTION_TABLE_ii[$fn & 255]($args$byval_copy)|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN10emscripten8internal13getActualTypeIN6fskube11DemodulatorEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube11DemodulatorEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube6SenderIdbEEE14convertPointerIS3_NS1_11DemodulatorEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube6SenderIdbEEE14convertPointerINS1_11DemodulatorES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube9ModulatorEFvvEvPS3_JEE6invokeERKS5_S6_($method,$wireThis) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vi[$8 & 255]($1);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vi[$8 & 255]($1);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal12operator_newIN6fskube9ModulatorEJNS2_9FskParamsEEEEPT_DpT0_($args) {
 $args = $args|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index3 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(32)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index3 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index3 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   $15 = (($0) + 4|0);
   HEAP32[$15>>2] = 0;
   HEAP32[$0>>2] = ((4872 + 8|0));
   $16 = (($0) + 8|0);
   ;HEAP32[$16+0>>2]=HEAP32[$args+0>>2]|0;HEAP32[$16+4>>2]=HEAP32[$args+4>>2]|0;HEAP32[$16+8>>2]=HEAP32[$args+8>>2]|0;HEAP32[$16+12>>2]=HEAP32[$args+12>>2]|0;
   __ZN6fskube9Modulator5resetEv($0);
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index3|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN10emscripten8internal7InvokerIPN6fskube9ModulatorEJNS2_9FskParamsEEE6invokeEPFS4_S5_EPS5_($fn,$args) {
 $fn = $fn|0;
 $args = $args|0;
 var $0 = 0, $args$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $args$byval_copy = sp;
 ;HEAP32[$args$byval_copy+0>>2]=HEAP32[$args+0>>2]|0;HEAP32[$args$byval_copy+4>>2]=HEAP32[$args+4>>2]|0;HEAP32[$args$byval_copy+8>>2]=HEAP32[$args+8>>2]|0;HEAP32[$args$byval_copy+12>>2]=HEAP32[$args+12>>2]|0;
 $0 = (FUNCTION_TABLE_ii[$fn & 255]($args$byval_copy)|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN10emscripten8internal13getActualTypeIN6fskube9ModulatorEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube9ModulatorEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube6SenderIbdEEE14convertPointerIS3_NS1_9ModulatorEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube6SenderIbdEEE14convertPointerINS1_9ModulatorES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderINS2_13StackmatStateEiEEFvPNS2_8ReceiverIiEEEvPS5_JS8_EE6invokeERKSA_SB_S8_($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = $args|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderINS2_13StackmatStateEiEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderINS2_13StackmatStateEiEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverINS1_13StackmatStateEEEE14convertPointerIS4_NS1_6SenderIS3_iEEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverINS1_13StackmatStateEEEE14convertPointerINS1_6SenderIS3_iEES4_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIiNS2_13StackmatStateEEEFvPNS2_8ReceiverIS4_EEEvPS5_JS8_EE6invokeERKSA_SB_S8_($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = $args|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderIiNS2_13StackmatStateEEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderIiNS2_13StackmatStateEEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_6SenderIiNS1_13StackmatStateEEEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_6SenderIiNS1_13StackmatStateEEES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIbiEEFvPNS2_8ReceiverIiEEEvPS4_JS7_EE6invokeERKS9_SA_S7_($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = $args|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderIbiEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderIbiEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_6SenderIbiEEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_6SenderIbiEES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIibEEFvPNS2_8ReceiverIbEEEvPS4_JS7_EE6invokeERKS9_SA_S7_($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = $args|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderIibEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderIibEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_6SenderIibEEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_6SenderIibEES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIdbEEFvPNS2_8ReceiverIbEEEvPS4_JS7_EE6invokeERKS9_SA_S7_($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = $args|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderIdbEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderIdbEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerIS3_NS1_6SenderIdbEEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerINS1_6SenderIdbEES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIbdEEFvPNS2_8ReceiverIdEEEvPS4_JS7_EE6invokeERKS9_SA_S7_($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = $args|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderIbdEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderIbdEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_6SenderIbdEEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_6SenderIbdEES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal11wrapped_newIPN6fskube28stackmatstateReceiverWrapperES3_JNS_3valEEEET_DpOT1_($args) {
 $args = $args|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index2 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(8)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   HEAP32[$0>>2] = ((3256 + 8|0));
   $15 = (($0) + 4|0);
   $16 = HEAP32[$args>>2]|0;
   HEAP32[$15>>2] = $16;
   HEAP32[$args>>2] = 0;
   HEAP32[$0>>2] = ((3032 + 8|0));
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN6fskube28stackmatstateReceiverWrapperD1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((3256 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN6fskube28stackmatstateReceiverWrapperD0Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((3256 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  _free($this);
  STACKTOP = sp;return;
 }
}
function __ZN6fskube28stackmatstateReceiverWrapper7receiveENS_13StackmatStateE($this,$s) {
 $this = $this|0;
 $s = $s|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $args$i$i$i$i$i = 0, $argv$i$i$i = 0, $destructors$i$i$i = 0, $lpad$phi$i$i$i$i$i$i$i$index = 0, $lpad$phi$i$i$i$i$i$i$i$index2 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $args$i$i$i$i$i = sp + 12|0;
 $argv$i$i$i = sp;
 $destructors$i$i$i = sp + 8|0;
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = HEAP8[3208>>0]|0;
 $3 = ($2<<24>>24)==(0);
 do {
  if ($3) {
   $4 = (___cxa_guard_acquire((3208|0))|0);
   $5 = ($4|0)==(0);
   if (!($5)) {
    HEAP32[$args$i$i$i$i$i>>2] = 2;
    $6 = (($args$i$i$i$i$i) + 4|0);
    HEAP32[$6>>2] = 14736;
    $7 = (($args$i$i$i$i$i) + 8|0);
    HEAP32[$7>>2] = 3248;
    __THREW__ = 0;
    $8 = (invoke_iii(101,2,($6|0))|0);
    $9 = __THREW__; __THREW__ = 0;
    $10 = $9&1;
    if ($10) {
     $11 = ___cxa_find_matching_catch(-1,-1)|0;
     $12 = tempRet0;
     ___cxa_guard_abort((3208|0));
     ___resumeException($11|0);
     // unreachable;
    } else {
     HEAP32[3200>>2] = $8;
     ___cxa_guard_release((3208|0));
     break;
    }
   }
  }
 } while(0);
 $13 = HEAP32[3200>>2]|0;
 while(1) {
  $14 = (_malloc(20)|0);
  $15 = ($14|0)==(0|0);
  if (!($15)) {
   label = 17;
   break;
  }
  $16 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($16+0)|0);
  $17 = ($16|0)==(0);
  if ($17) {
   label = 14;
   break;
  }
  $18 = $16;
  __THREW__ = 0;
  invoke_v($18|0);
  $19 = __THREW__; __THREW__ = 0;
  $20 = $19&1;
  if ($20) {
   label = 10;
   break;
  }
 }
 do {
  if ((label|0) == 10) {
   $21 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $22 = tempRet0;
   $lpad$phi$i$i$i$i$i$i$i$index = $21;$lpad$phi$i$i$i$i$i$i$i$index2 = $22;
  }
  else if ((label|0) == 14) {
   $26 = (___cxa_allocate_exception(4)|0);
   HEAP32[$26>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($26|0),(15704|0),(89|0));
   $27 = __THREW__; __THREW__ = 0;
   $28 = $27&1;
   if ($28) {
    $23 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $24 = tempRet0;
    $lpad$phi$i$i$i$i$i$i$i$index = $23;$lpad$phi$i$i$i$i$i$i$i$index2 = $24;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 17) {
   ;HEAP32[$14+0>>2]=HEAP32[$s+0>>2]|0;HEAP32[$14+4>>2]=HEAP32[$s+4>>2]|0;HEAP32[$14+8>>2]=HEAP32[$s+8>>2]|0;HEAP32[$14+12>>2]=HEAP32[$s+12>>2]|0;HEAP32[$14+16>>2]=HEAP32[$s+16>>2]|0;
   HEAP32[$argv$i$i$i>>2] = $14;
   (+__emval_call_method(($13|0),($1|0),(5896|0),($destructors$i$i$i|0),($argv$i$i$i|0)));
   $29 = HEAP32[$destructors$i$i$i>>2]|0;
   __THREW__ = 0;
   invoke_vi(102,($29|0));
   $30 = __THREW__; __THREW__ = 0;
   $31 = $30&1;
   if ($31) {
    $32 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
    $33 = tempRet0;
    ___clang_call_terminate($32);
    // unreachable;
   } else {
    STACKTOP = sp;return;
   }
  }
 } while(0);
 $25 = ($lpad$phi$i$i$i$i$i$i$i$index2|0)<(0);
 if ($25) {
  ___cxa_call_unexpected(($lpad$phi$i$i$i$i$i$i$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$i$i$i$i$i$i$index|0);
  // unreachable;
 }
}
function ___clang_call_terminate($0) {
 $0 = $0|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 (___cxa_begin_catch(($0|0))|0);
 __ZSt9terminatev();
 // unreachable;
}
function __ZN10emscripten7wrapperIN6fskube8ReceiverINS1_13StackmatStateEEEED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((3256 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten7wrapperIN6fskube8ReceiverINS1_13StackmatStateEEEED0Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((3256 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  _free($this);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal7InvokerIPN6fskube28stackmatstateReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE($fn,$args) {
 $fn = $fn|0;
 $args = $args|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = sp;
 HEAP32[$0>>2] = $args;
 __THREW__ = 0;
 $1 = (invoke_ii($fn|0,($0|0))|0);
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $9 = ___cxa_find_matching_catch(-1,-1)|0;
  $10 = tempRet0;
  $11 = HEAP32[$0>>2]|0;
  __THREW__ = 0;
  invoke_vi(100,($11|0));
  $12 = __THREW__; __THREW__ = 0;
  $13 = $12&1;
  if ($13) {
   $14 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
   $15 = tempRet0;
   ___clang_call_terminate($14);
   // unreachable;
  } else {
   ___resumeException($9|0);
   // unreachable;
  }
 } else {
  $4 = HEAP32[$0>>2]|0;
  __THREW__ = 0;
  invoke_vi(100,($4|0));
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   $7 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
   $8 = tempRet0;
   ___clang_call_terminate($7);
   // unreachable;
  } else {
   STACKTOP = sp;return ($1|0);
  }
 }
 return 0|0;
}
function __ZN10emscripten8internal13getActualTypeIN6fskube28stackmatstateReceiverWrapperEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube28stackmatstateReceiverWrapperEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverINS1_13StackmatStateEEEE14convertPointerIS4_NS1_28stackmatstateReceiverWrapperEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverINS1_13StackmatStateEEEE14convertPointerINS1_28stackmatstateReceiverWrapperES4_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverINS2_13StackmatStateEEEFvS4_EvPS5_JS4_EE6invokeERKS7_S8_PS4_($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = $args|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $args$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $args$byval_copy = sp;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
 }
 ;HEAP32[$args$byval_copy+0>>2]=HEAP32[$args+0>>2]|0;HEAP32[$args$byval_copy+4>>2]=HEAP32[$args+4>>2]|0;HEAP32[$args$byval_copy+8>>2]=HEAP32[$args+8>>2]|0;HEAP32[$args$byval_copy+12>>2]=HEAP32[$args+12>>2]|0;HEAP32[$args$byval_copy+16>>2]=HEAP32[$args+16>>2]|0;
 FUNCTION_TABLE_vii[$8 & 255]($1,$args$byval_copy);
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverINS2_13StackmatStateEEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverINS2_13StackmatStateEEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal11wrapped_newIPN6fskube18intReceiverWrapperES3_JNS_3valEEEET_DpOT1_($args) {
 $args = $args|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index2 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(8)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   HEAP32[$0>>2] = ((3728 + 8|0));
   $15 = (($0) + 4|0);
   $16 = HEAP32[$args>>2]|0;
   HEAP32[$15>>2] = $16;
   HEAP32[$args>>2] = 0;
   HEAP32[$0>>2] = ((3576 + 8|0));
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN6fskube18intReceiverWrapperD1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((3728 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN6fskube18intReceiverWrapperD0Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((3728 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  _free($this);
  STACKTOP = sp;return;
 }
}
function __ZN6fskube18intReceiverWrapper7receiveEi($this,$b) {
 $this = $this|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $args$i$i$i$i$i = 0;
 var $argv$i$i$i = 0, $destructors$i$i$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $args$i$i$i$i$i = sp + 12|0;
 $argv$i$i$i = sp;
 $destructors$i$i$i = sp + 8|0;
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = HEAP8[3720>>0]|0;
 $3 = ($2<<24>>24)==(0);
 do {
  if ($3) {
   $4 = (___cxa_guard_acquire((3720|0))|0);
   $5 = ($4|0)==(0);
   if (!($5)) {
    HEAP32[$args$i$i$i$i$i>>2] = 2;
    $6 = (($args$i$i$i$i$i) + 4|0);
    HEAP32[$6>>2] = 14736;
    $7 = (($args$i$i$i$i$i) + 8|0);
    HEAP32[$7>>2] = 14864;
    __THREW__ = 0;
    $8 = (invoke_iii(101,2,($6|0))|0);
    $9 = __THREW__; __THREW__ = 0;
    $10 = $9&1;
    if ($10) {
     $11 = ___cxa_find_matching_catch(-1,-1)|0;
     $12 = tempRet0;
     ___cxa_guard_abort((3720|0));
     ___resumeException($11|0);
     // unreachable;
    } else {
     HEAP32[3712>>2] = $8;
     ___cxa_guard_release((3720|0));
     break;
    }
   }
  }
 } while(0);
 $13 = HEAP32[3712>>2]|0;
 HEAP32[$argv$i$i$i>>2] = $b;
 (+__emval_call_method(($13|0),($1|0),(5896|0),($destructors$i$i$i|0),($argv$i$i$i|0)));
 $14 = HEAP32[$destructors$i$i$i>>2]|0;
 __THREW__ = 0;
 invoke_vi(102,($14|0));
 $15 = __THREW__; __THREW__ = 0;
 $16 = $15&1;
 if ($16) {
  $17 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $18 = tempRet0;
  ___clang_call_terminate($17);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten7wrapperIN6fskube8ReceiverIiEEED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((3728 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten7wrapperIN6fskube8ReceiverIiEEED0Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((3728 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  _free($this);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal7InvokerIPN6fskube18intReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE($fn,$args) {
 $fn = $fn|0;
 $args = $args|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = sp;
 HEAP32[$0>>2] = $args;
 __THREW__ = 0;
 $1 = (invoke_ii($fn|0,($0|0))|0);
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $9 = ___cxa_find_matching_catch(-1,-1)|0;
  $10 = tempRet0;
  $11 = HEAP32[$0>>2]|0;
  __THREW__ = 0;
  invoke_vi(100,($11|0));
  $12 = __THREW__; __THREW__ = 0;
  $13 = $12&1;
  if ($13) {
   $14 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
   $15 = tempRet0;
   ___clang_call_terminate($14);
   // unreachable;
  } else {
   ___resumeException($9|0);
   // unreachable;
  }
 } else {
  $4 = HEAP32[$0>>2]|0;
  __THREW__ = 0;
  invoke_vi(100,($4|0));
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   $7 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
   $8 = tempRet0;
   ___clang_call_terminate($7);
   // unreachable;
  } else {
   STACKTOP = sp;return ($1|0);
  }
 }
 return 0|0;
}
function __ZN10emscripten8internal13getActualTypeIN6fskube18intReceiverWrapperEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube18intReceiverWrapperEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_18intReceiverWrapperEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_18intReceiverWrapperES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIiEEFviEvPS4_JiEE6invokeERKS6_S7_i($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = $args|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIiEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIiEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal11wrapped_newIPN6fskube21doubleReceiverWrapperES3_JNS_3valEEEET_DpOT1_($args) {
 $args = $args|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index2 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(8)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   HEAP32[$0>>2] = ((4112 + 8|0));
   $15 = (($0) + 4|0);
   $16 = HEAP32[$args>>2]|0;
   HEAP32[$15>>2] = $16;
   HEAP32[$args>>2] = 0;
   HEAP32[$0>>2] = ((3952 + 8|0));
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN6fskube21doubleReceiverWrapperD1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((4112 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN6fskube21doubleReceiverWrapperD0Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((4112 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  _free($this);
  STACKTOP = sp;return;
 }
}
function __ZN6fskube21doubleReceiverWrapper7receiveEd($this,$b) {
 $this = $this|0;
 $b = +$b;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $args$i$i$i$i$i = 0;
 var $argv$i$i$i = 0, $destructors$i$i$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $args$i$i$i$i$i = sp + 12|0;
 $argv$i$i$i = sp;
 $destructors$i$i$i = sp + 8|0;
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = HEAP8[4104>>0]|0;
 $3 = ($2<<24>>24)==(0);
 do {
  if ($3) {
   $4 = (___cxa_guard_acquire((4104|0))|0);
   $5 = ($4|0)==(0);
   if (!($5)) {
    HEAP32[$args$i$i$i$i$i>>2] = 2;
    $6 = (($args$i$i$i$i$i) + 4|0);
    HEAP32[$6>>2] = 14736;
    $7 = (($args$i$i$i$i$i) + 8|0);
    HEAP32[$7>>2] = 14944;
    __THREW__ = 0;
    $8 = (invoke_iii(101,2,($6|0))|0);
    $9 = __THREW__; __THREW__ = 0;
    $10 = $9&1;
    if ($10) {
     $11 = ___cxa_find_matching_catch(-1,-1)|0;
     $12 = tempRet0;
     ___cxa_guard_abort((4104|0));
     ___resumeException($11|0);
     // unreachable;
    } else {
     HEAP32[4096>>2] = $8;
     ___cxa_guard_release((4104|0));
     break;
    }
   }
  }
 } while(0);
 $13 = HEAP32[4096>>2]|0;
 HEAPF64[$argv$i$i$i>>3] = $b;
 (+__emval_call_method(($13|0),($1|0),(5896|0),($destructors$i$i$i|0),($argv$i$i$i|0)));
 $14 = HEAP32[$destructors$i$i$i>>2]|0;
 __THREW__ = 0;
 invoke_vi(102,($14|0));
 $15 = __THREW__; __THREW__ = 0;
 $16 = $15&1;
 if ($16) {
  $17 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $18 = tempRet0;
  ___clang_call_terminate($17);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten7wrapperIN6fskube8ReceiverIdEEED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((4112 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten7wrapperIN6fskube8ReceiverIdEEED0Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((4112 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  _free($this);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal7InvokerIPN6fskube21doubleReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE($fn,$args) {
 $fn = $fn|0;
 $args = $args|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = sp;
 HEAP32[$0>>2] = $args;
 __THREW__ = 0;
 $1 = (invoke_ii($fn|0,($0|0))|0);
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $9 = ___cxa_find_matching_catch(-1,-1)|0;
  $10 = tempRet0;
  $11 = HEAP32[$0>>2]|0;
  __THREW__ = 0;
  invoke_vi(100,($11|0));
  $12 = __THREW__; __THREW__ = 0;
  $13 = $12&1;
  if ($13) {
   $14 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
   $15 = tempRet0;
   ___clang_call_terminate($14);
   // unreachable;
  } else {
   ___resumeException($9|0);
   // unreachable;
  }
 } else {
  $4 = HEAP32[$0>>2]|0;
  __THREW__ = 0;
  invoke_vi(100,($4|0));
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   $7 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
   $8 = tempRet0;
   ___clang_call_terminate($7);
   // unreachable;
  } else {
   STACKTOP = sp;return ($1|0);
  }
 }
 return 0|0;
}
function __ZN10emscripten8internal13getActualTypeIN6fskube21doubleReceiverWrapperEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube21doubleReceiverWrapperEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerIS3_NS1_21doubleReceiverWrapperEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerINS1_21doubleReceiverWrapperES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIdEEFvdEvPS4_JdEE6invokeERKS6_S7_d($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = +$args;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vid[$8 & 127]($1,$args);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vid[$8 & 127]($1,$args);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIdEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIdEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal11wrapped_newIPN6fskube19boolReceiverWrapperES3_JNS_3valEEEET_DpOT1_($args) {
 $args = $args|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index2 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(8)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   HEAP32[$0>>2] = ((4504 + 8|0));
   $15 = (($0) + 4|0);
   $16 = HEAP32[$args>>2]|0;
   HEAP32[$15>>2] = $16;
   HEAP32[$args>>2] = 0;
   HEAP32[$0>>2] = ((4352 + 8|0));
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN6fskube19boolReceiverWrapperD1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((4504 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN6fskube19boolReceiverWrapperD0Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((4504 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  _free($this);
  STACKTOP = sp;return;
 }
}
function __ZN6fskube19boolReceiverWrapper7receiveEb($this,$b) {
 $this = $this|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $args$i$i$i$i$i = 0, $argv$i$i$i = 0, $destructors$i$i$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $args$i$i$i$i$i = sp + 12|0;
 $argv$i$i$i = sp;
 $destructors$i$i$i = sp + 8|0;
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = HEAP8[4496>>0]|0;
 $3 = ($2<<24>>24)==(0);
 do {
  if ($3) {
   $4 = (___cxa_guard_acquire((4496|0))|0);
   $5 = ($4|0)==(0);
   if (!($5)) {
    HEAP32[$args$i$i$i$i$i>>2] = 2;
    $6 = (($args$i$i$i$i$i) + 4|0);
    HEAP32[$6>>2] = 14736;
    $7 = (($args$i$i$i$i$i) + 8|0);
    HEAP32[$7>>2] = 14768;
    __THREW__ = 0;
    $8 = (invoke_iii(101,2,($6|0))|0);
    $9 = __THREW__; __THREW__ = 0;
    $10 = $9&1;
    if ($10) {
     $11 = ___cxa_find_matching_catch(-1,-1)|0;
     $12 = tempRet0;
     ___cxa_guard_abort((4496|0));
     ___resumeException($11|0);
     // unreachable;
    } else {
     HEAP32[4488>>2] = $8;
     ___cxa_guard_release((4496|0));
     break;
    }
   }
  }
 } while(0);
 $13 = HEAP32[4488>>2]|0;
 $14 = $b&1;
 HEAP32[$argv$i$i$i>>2] = $14;
 (+__emval_call_method(($13|0),($1|0),(5896|0),($destructors$i$i$i|0),($argv$i$i$i|0)));
 $15 = HEAP32[$destructors$i$i$i>>2]|0;
 __THREW__ = 0;
 invoke_vi(102,($15|0));
 $16 = __THREW__; __THREW__ = 0;
 $17 = $16&1;
 if ($17) {
  $18 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $19 = tempRet0;
  ___clang_call_terminate($18);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten7wrapperIN6fskube8ReceiverIbEEED1Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((4504 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten7wrapperIN6fskube8ReceiverIbEEED0Ev($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = ((4504 + 8|0));
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 __THREW__ = 0;
 invoke_vi(100,($1|0));
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $4 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $5 = tempRet0;
  ___clang_call_terminate($4);
  // unreachable;
 } else {
  _free($this);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal7InvokerIPN6fskube19boolReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE($fn,$args) {
 $fn = $fn|0;
 $args = $args|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = sp;
 HEAP32[$0>>2] = $args;
 __THREW__ = 0;
 $1 = (invoke_ii($fn|0,($0|0))|0);
 $2 = __THREW__; __THREW__ = 0;
 $3 = $2&1;
 if ($3) {
  $9 = ___cxa_find_matching_catch(-1,-1)|0;
  $10 = tempRet0;
  $11 = HEAP32[$0>>2]|0;
  __THREW__ = 0;
  invoke_vi(100,($11|0));
  $12 = __THREW__; __THREW__ = 0;
  $13 = $12&1;
  if ($13) {
   $14 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
   $15 = tempRet0;
   ___clang_call_terminate($14);
   // unreachable;
  } else {
   ___resumeException($9|0);
   // unreachable;
  }
 } else {
  $4 = HEAP32[$0>>2]|0;
  __THREW__ = 0;
  invoke_vi(100,($4|0));
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   $7 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
   $8 = tempRet0;
   ___clang_call_terminate($7);
   // unreachable;
  } else {
   STACKTOP = sp;return ($1|0);
  }
 }
 return 0|0;
}
function __ZN10emscripten8internal13getActualTypeIN6fskube19boolReceiverWrapperEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube19boolReceiverWrapperEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_19boolReceiverWrapperEEEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_19boolReceiverWrapperES3_EEPT0_PT_($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return ($ptr|0);
}
function __ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIbEEFvbEvPS4_JbEE6invokeERKS6_S7_b($method,$wireThis,$args) {
 $method = $method|0;
 $wireThis = $wireThis|0;
 $args = $args|0;
 var $$field = 0, $$field2 = 0, $$index1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$field = HEAPU8[$method>>0]|(HEAPU8[$method+1>>0]<<8)|(HEAPU8[$method+2>>0]<<16)|(HEAPU8[$method+3>>0]<<24);
 $$index1 = (($method) + 4|0);
 $$field2 = HEAPU8[$$index1>>0]|(HEAPU8[$$index1+1>>0]<<8)|(HEAPU8[$$index1+2>>0]<<16)|(HEAPU8[$$index1+3>>0]<<24);
 $0 = $$field2 >> 1;
 $1 = (($wireThis) + ($0)|0);
 $2 = $$field2 & 1;
 $3 = ($2|0)==(0);
 if ($3) {
  $7 = $$field;
  $8 = $7;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 } else {
  $4 = HEAP32[$1>>2]|0;
  $5 = (($4) + ($$field)|0);
  $6 = HEAP32[$5>>2]|0;
  $8 = $6;
  FUNCTION_TABLE_vii[$8 & 255]($1,$args);
  STACKTOP = sp;return;
 }
}
function __ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIbEEEEPKNS0_7_TYPEIDEPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$ptr>>2]|0;
 $1 = (($0) + -4|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIbEEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = HEAP32[$ptr>>2]|0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 FUNCTION_TABLE_vi[$3 & 255]($ptr);
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal7InvokerIN6fskube13StackmatStateEJEE6invokeEPFS3_vE($fn) {
 $fn = $fn|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$i$index = 0, $lpad$phi$i$i$index2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = sp;
 FUNCTION_TABLE_vi[$fn & 255]($0);
 while(1) {
  $1 = (_malloc(20)|0);
  $2 = ($1|0)==(0|0);
  if (!($2)) {
   label = 12;
   break;
  }
  $3 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($3+0)|0);
  $4 = ($3|0)==(0);
  if ($4) {
   label = 9;
   break;
  }
  $5 = $3;
  __THREW__ = 0;
  invoke_v($5|0);
  $6 = __THREW__; __THREW__ = 0;
  $7 = $6&1;
  if ($7) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $8 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $9 = tempRet0;
   $lpad$phi$i$i$index = $8;$lpad$phi$i$i$index2 = $9;
  }
  else if ((label|0) == 9) {
   $13 = (___cxa_allocate_exception(4)|0);
   HEAP32[$13>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($13|0),(15704|0),(89|0));
   $14 = __THREW__; __THREW__ = 0;
   $15 = $14&1;
   if ($15) {
    $10 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $11 = tempRet0;
    $lpad$phi$i$i$index = $10;$lpad$phi$i$i$index2 = $11;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   ;HEAP32[$1+0>>2]=HEAP32[$0+0>>2]|0;HEAP32[$1+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[$1+8>>2]=HEAP32[$0+8>>2]|0;HEAP32[$1+12>>2]=HEAP32[$0+12>>2]|0;HEAP32[$1+16>>2]=HEAP32[$0+16>>2]|0;
   STACKTOP = sp;return ($1|0);
  }
 } while(0);
 $12 = ($lpad$phi$i$i$index2|0)<(0);
 if ($12) {
  ___cxa_call_unexpected(($lpad$phi$i$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN10emscripten8internal7InvokerIbJdEE6invokeEPFbdEd($fn,$args) {
 $fn = $fn|0;
 $args = +$args;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (FUNCTION_TABLE_id[$fn & 127]($args)|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN10emscripten8internal7InvokerIvJjEE6invokeEPFvjEj($fn,$args) {
 $fn = $fn|0;
 $args = $args|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 FUNCTION_TABLE_vi[$fn & 255]($args);
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEbE7getWireIS3_EEbRKMS3_bRKT_($field,$ptr) {
 $field = $field|0;
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$field>>2]|0;
 $1 = (($ptr) + ($0)|0);
 $2 = HEAP8[$1>>0]|0;
 $3 = $2 & 1;
 $4 = ($3<<24>>24)!=(0);
 STACKTOP = sp;return ($4|0);
}
function __ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEbE7setWireIS3_EEvRKMS3_bRT_b($field,$ptr,$value) {
 $field = $field|0;
 $ptr = $ptr|0;
 $value = $value|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$field>>2]|0;
 $1 = (($ptr) + ($0)|0);
 $2 = $value&1;
 HEAP8[$1>>0] = $2;
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEhE7getWireIS3_EEhRKMS3_hRKT_($field,$ptr) {
 $field = $field|0;
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$field>>2]|0;
 $1 = (($ptr) + ($0)|0);
 $2 = HEAP8[$1>>0]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEhE7setWireIS3_EEvRKMS3_hRT_h($field,$ptr,$value) {
 $field = $field|0;
 $ptr = $ptr|0;
 $value = $value|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$field>>2]|0;
 $1 = (($ptr) + ($0)|0);
 HEAP8[$1>>0] = $value;
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEjE7getWireIS3_EEjRKMS3_jRKT_($field,$ptr) {
 $field = $field|0;
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$field>>2]|0;
 $1 = (($ptr) + ($0)|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEjE7setWireIS3_EEvRKMS3_jRT_j($field,$ptr,$value) {
 $field = $field|0;
 $ptr = $ptr|0;
 $value = $value|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$field>>2]|0;
 $1 = (($ptr) + ($0)|0);
 HEAP32[$1>>2] = $value;
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal15raw_constructorIN6fskube13StackmatStateEJEEEPT_DpNS0_11BindingTypeIT0_E8WireTypeE() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(20)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   ;HEAP32[$0+0>>2]=0|0;HEAP32[$0+4>>2]=0|0;HEAP32[$0+8>>2]=0|0;HEAP32[$0+12>>2]=0|0;HEAP32[$0+16>>2]=0|0;
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN10emscripten8internal14raw_destructorIN6fskube13StackmatStateEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if (!($0)) {
  _free($ptr);
 }
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal12MemberAccessIN6fskube9FskParamsEjE7getWireIS3_EEjRKMS3_jRKT_($field,$ptr) {
 $field = $field|0;
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$field>>2]|0;
 $1 = (($ptr) + ($0)|0);
 $2 = HEAP32[$1>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function __ZN10emscripten8internal12MemberAccessIN6fskube9FskParamsEjE7setWireIS3_EEvRKMS3_jRT_j($field,$ptr,$value) {
 $field = $field|0;
 $ptr = $ptr|0;
 $value = $value|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$field>>2]|0;
 $1 = (($ptr) + ($0)|0);
 HEAP32[$1>>2] = $value;
 STACKTOP = sp;return;
}
function __ZN10emscripten8internal15raw_constructorIN6fskube9FskParamsEJEEEPT_DpNS0_11BindingTypeIT0_E8WireTypeE() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $lpad$phi$i$index = 0, $lpad$phi$i$index2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 while(1) {
  $0 = (_malloc(16)|0);
  $1 = ($0|0)==(0|0);
  if (!($1)) {
   label = 12;
   break;
  }
  $2 = HEAP32[15640>>2]|0;HEAP32[15640>>2] = (($2+0)|0);
  $3 = ($2|0)==(0);
  if ($3) {
   label = 9;
   break;
  }
  $4 = $2;
  __THREW__ = 0;
  invoke_v($4|0);
  $5 = __THREW__; __THREW__ = 0;
  $6 = $5&1;
  if ($6) {
   label = 5;
   break;
  }
 }
 do {
  if ((label|0) == 5) {
   $7 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
   $8 = tempRet0;
   $lpad$phi$i$index = $7;$lpad$phi$i$index2 = $8;
  }
  else if ((label|0) == 9) {
   $12 = (___cxa_allocate_exception(4)|0);
   HEAP32[$12>>2] = ((15648 + 8|0));
   __THREW__ = 0;
   invoke_viii(98,($12|0),(15704|0),(89|0));
   $13 = __THREW__; __THREW__ = 0;
   $14 = $13&1;
   if ($14) {
    $9 = ___cxa_find_matching_catch(-1,-1,15704|0)|0;
    $10 = tempRet0;
    $lpad$phi$i$index = $9;$lpad$phi$i$index2 = $10;
    break;
   } else {
    // unreachable;
   }
  }
  else if ((label|0) == 12) {
   ;HEAP32[$0+0>>2]=0|0;HEAP32[$0+4>>2]=0|0;HEAP32[$0+8>>2]=0|0;HEAP32[$0+12>>2]=0|0;
   STACKTOP = sp;return ($0|0);
  }
 } while(0);
 $11 = ($lpad$phi$i$index2|0)<(0);
 if ($11) {
  ___cxa_call_unexpected(($lpad$phi$i$index|0));
  // unreachable;
 } else {
  ___resumeException($lpad$phi$i$index|0);
  // unreachable;
 }
 return 0|0;
}
function __ZN10emscripten8internal14raw_destructorIN6fskube9FskParamsEEEvPT_($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($ptr|0)==(0|0);
 if (!($0)) {
  _free($ptr);
 }
 STACKTOP = sp;return;
}
function __GLOBAL__I_a() {
 var $$0 = 0, $$055 = 0, $$index100 = 0, $$index102 = 0, $$index104 = 0, $$index106 = 0, $$index108 = 0, $$index82 = 0, $$index84 = 0, $$index86 = 0, $$index88 = 0, $$index90 = 0, $$index92 = 0, $$index94 = 0, $$index96 = 0, $$index98 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0;
 var $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0;
 var $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0;
 var $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0;
 var $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0;
 var $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0;
 var $98 = 0, $99 = 0, $args$i$i$i = 0, $args$i$i$i$i = 0, $args$i$i106$i$i = 0, $args$i$i112$i$i = 0, $args$i$i124$i$i = 0, $args$i$i136$i$i = 0, $args$i$i47$i$i = 0, $args$i$i61$i$i = 0, $args$i$i75$i$i = 0, $args$i$i83$i$i = 0, $args$i$i94$i$i = 0, $args$i10$i$i = 0, $args$i15$i$i = 0, $args$i22$i$i = 0, $args$i29$i$i = 0, $args$i30$i$i = 0, $args$i32$i$i = 0, $args$i34$i$i = 0;
 var $args$i36$i$i = 0, $args$i43$i$i = 0, $args$i5$i$i = 0, $args$i50$i$i = 0, $args$i57$i$i = 0, $args$i62$i$i = 0, $args$i67$i$i = 0, $args$i72$i$i = 0, $args$i77$i$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 352|0;
 $args$i$i136$i$i = sp + 332|0;
 $args$i$i124$i$i = sp + 320|0;
 $args$i$i112$i$i = sp + 312|0;
 $args$i$i106$i$i = sp + 304|0;
 $args$i$i94$i$i = sp + 296|0;
 $args$i$i83$i$i = sp + 288|0;
 $args$i$i75$i$i = sp + 276|0;
 $args$i$i61$i$i = sp + 264|0;
 $args$i$i47$i$i = sp + 252|0;
 $args$i$i$i$i = sp + 240|0;
 $args$i34$i$i = sp + 232|0;
 $args$i32$i$i = sp + 220|0;
 $args$i30$i$i = sp + 208|0;
 $args$i77$i$i = sp + 196|0;
 $args$i72$i$i = sp + 184|0;
 $args$i67$i$i = sp + 172|0;
 $args$i62$i$i = sp + 160|0;
 $args$i57$i$i = sp + 144|0;
 $args$i50$i$i = sp + 128|0;
 $args$i43$i$i = sp + 112|0;
 $args$i36$i$i = sp + 96|0;
 $args$i29$i$i = sp + 80|0;
 $args$i22$i$i = sp + 64|0;
 $args$i15$i$i = sp + 48|0;
 $args$i10$i$i = sp + 32|0;
 $args$i5$i$i = sp + 16|0;
 $args$i$i$i = sp;
 $0 = sp + 345|0;
 $1 = sp + 344|0;
 __embind_register_value_object((1704|0),(8|0),(4848|0),(103|0),(4840|0),(104|0));
 __THREW__ = 0;
 $2 = (invoke_iiii(105,($0|0),(24|0),0)|0);
 $3 = __THREW__; __THREW__ = 0;
 $4 = $3&1;
 if (!($4)) {
  __THREW__ = 0;
  $5 = (invoke_iiii(105,($2|0),(48|0),4)|0);
  $6 = __THREW__; __THREW__ = 0;
  $7 = $6&1;
  if (!($7)) {
   __THREW__ = 0;
   $8 = (invoke_iiii(105,($5|0),(64|0),8)|0);
   $9 = __THREW__; __THREW__ = 0;
   $10 = $9&1;
   if (!($10)) {
    __THREW__ = 0;
    (invoke_iiii(105,($8|0),(80|0),12)|0);
    $11 = __THREW__; __THREW__ = 0;
    $12 = $11&1;
    if (!($12)) {
     __THREW__ = 0;
     invoke_vi(106,(1704|0));
     $13 = __THREW__; __THREW__ = 0;
     $14 = $13&1;
     if ($14) {
      $15 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
      $16 = tempRet0;
      __ZSt9terminatev();
      // unreachable;
     }
     __embind_register_value_object((3248|0),(96|0),(4816|0),(107|0),(4808|0),(108|0));
     __THREW__ = 0;
     $17 = (invoke_iiii(109,($1|0),(112|0),8)|0);
     $18 = __THREW__; __THREW__ = 0;
     $19 = $18&1;
     if (!($19)) {
      __THREW__ = 0;
      $20 = (invoke_iiii(109,($17|0),(120|0),12)|0);
      $21 = __THREW__; __THREW__ = 0;
      $22 = $21&1;
      if (!($22)) {
       __THREW__ = 0;
       $23 = (invoke_iiii(110,($20|0),(136|0),1)|0);
       $24 = __THREW__; __THREW__ = 0;
       $25 = $24&1;
       if (!($25)) {
        __THREW__ = 0;
        $26 = (invoke_iiii(110,($23|0),(152|0),2)|0);
        $27 = __THREW__; __THREW__ = 0;
        $28 = $27&1;
        if (!($28)) {
         __THREW__ = 0;
         $29 = (invoke_iiii(110,($26|0),(176|0),3)|0);
         $30 = __THREW__; __THREW__ = 0;
         $31 = $30&1;
         if (!($31)) {
          __THREW__ = 0;
          $32 = (invoke_iiii(110,($29|0),(184|0),4)|0);
          $33 = __THREW__; __THREW__ = 0;
          $34 = $33&1;
          if (!($34)) {
           __THREW__ = 0;
           (invoke_iiii(110,($32|0),(192|0),16)|0);
           $35 = __THREW__; __THREW__ = 0;
           $36 = $35&1;
           if (!($36)) {
            $37 = (_malloc(4)|0);
            $38 = ($37|0)==(0|0);
            if (!($38)) {
             HEAP32[$37>>2] = 0;
            }
            $39 = (_malloc(4)|0);
            $40 = ($39|0)==(0|0);
            if (!($40)) {
             HEAP32[$39>>2] = 0;
            }
            __THREW__ = 0;
            invoke_viiiiiiiiii(111,(3248|0),(208|0),(14768|0),(4768|0),(112|0),($37|0),(14768|0),(4760|0),(113|0),($39|0));
            $41 = __THREW__; __THREW__ = 0;
            $42 = $41&1;
            if (!($42)) {
             __THREW__ = 0;
             invoke_vi(106,(3248|0));
             $43 = __THREW__; __THREW__ = 0;
             $44 = $43&1;
             if ($44) {
              $45 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
              $46 = tempRet0;
              __ZSt9terminatev();
              // unreachable;
             }
             HEAP32[$args$i30$i$i>>2] = 2;
             $47 = (($args$i30$i$i) + 4|0);
             HEAP32[$47>>2] = 14736;
             $48 = (($args$i30$i$i) + 8|0);
             HEAP32[$48>>2] = 14880;
             __embind_register_function((216|0),2,($47|0),(4752|0),(114|0),(115|0));
             HEAP32[$args$i32$i$i>>2] = 2;
             $49 = (($args$i32$i$i) + 4|0);
             HEAP32[$49>>2] = 14768;
             $50 = (($args$i32$i$i) + 8|0);
             HEAP32[$50>>2] = 14944;
             __embind_register_function((13360|0),2,($49|0),(4744|0),(116|0),(117|0));
             HEAP32[$args$i34$i$i>>2] = 1;
             $51 = (($args$i34$i$i) + 4|0);
             HEAP32[$51>>2] = 3248;
             __embind_register_function((13472|0),1,($51|0),(4736|0),(118|0),(119|0));
             __embind_register_class((1376|0),(2608|0),(4720|0),(0|0),(4688|0),(120|0),(3496|0),(0|0),(3496|0),(0|0),(240|0),(4680|0),(121|0));
             HEAP32[$args$i$i$i>>2] = 3;
             $52 = (($args$i$i$i) + 4|0);
             HEAP32[$52>>2] = 14736;
             $53 = (($args$i$i$i) + 8|0);
             HEAP32[$53>>2] = 2608;
             $54 = (($args$i$i$i) + 12|0);
             HEAP32[$54>>2] = 14768;
             $55 = (_malloc(8)|0);
             $56 = ($55|0)==(0|0);
             if (!($56)) {
              HEAP8[$55>>0]=8&255;HEAP8[$55+1>>0]=(8>>8)&255;HEAP8[$55+2>>0]=(8>>16)&255;HEAP8[$55+3>>0]=8>>24;
              $$index82 = (($55) + 4|0);
              HEAP8[$$index82>>0]=1&255;HEAP8[$$index82+1>>0]=(1>>8)&255;HEAP8[$$index82+2>>0]=(1>>16)&255;HEAP8[$$index82+3>>0]=1>>24;
             }
             __embind_register_class_function((1376|0),(5896|0),3,($52|0),(4672|0),(122|0),($55|0));
             __embind_register_class((4472|0),(4568|0),(4656|0),(1376|0),(4608|0),(123|0),(4600|0),(124|0),(4592|0),(125|0),(256|0),(4584|0),(126|0));
             HEAP32[$args$i$i$i$i>>2] = 2;
             $57 = (($args$i$i$i$i) + 4|0);
             HEAP32[$57>>2] = 4568;
             $58 = (($args$i$i$i$i) + 8|0);
             HEAP32[$58>>2] = 3312;
             __embind_register_class_class_function((1376|0),(3016|0),2,($57|0),(4528|0),(127|0),(128|0));
             __embind_register_class((1792|0),(2888|0),(4336|0),(0|0),(4304|0),(129|0),(3496|0),(0|0),(3496|0),(0|0),(280|0),(4296|0),(130|0));
             HEAP32[$args$i5$i$i>>2] = 3;
             $59 = (($args$i5$i$i) + 4|0);
             HEAP32[$59>>2] = 14736;
             $60 = (($args$i5$i$i) + 8|0);
             HEAP32[$60>>2] = 2888;
             $61 = (($args$i5$i$i) + 12|0);
             HEAP32[$61>>2] = 14944;
             $62 = (_malloc(8)|0);
             $63 = ($62|0)==(0|0);
             if (!($63)) {
              HEAP8[$62>>0]=8&255;HEAP8[$62+1>>0]=(8>>8)&255;HEAP8[$62+2>>0]=(8>>16)&255;HEAP8[$62+3>>0]=8>>24;
              $$index84 = (($62) + 4|0);
              HEAP8[$$index84>>0]=1&255;HEAP8[$$index84+1>>0]=(1>>8)&255;HEAP8[$$index84+2>>0]=(1>>16)&255;HEAP8[$$index84+3>>0]=1>>24;
             }
             __embind_register_class_function((1792|0),(5896|0),3,($59|0),(4288|0),(131|0),($62|0));
             __embind_register_class((4080|0),(4184|0),(4272|0),(1792|0),(4224|0),(132|0),(4216|0),(133|0),(4208|0),(134|0),(296|0),(4200|0),(135|0));
             HEAP32[$args$i$i47$i$i>>2] = 2;
             $64 = (($args$i$i47$i$i) + 4|0);
             HEAP32[$64>>2] = 4184;
             $65 = (($args$i$i47$i$i) + 8|0);
             HEAP32[$65>>2] = 3312;
             __embind_register_class_class_function((1792|0),(3016|0),2,($64|0),(4136|0),(136|0),(137|0));
             __embind_register_class((904|0),(2064|0),(3936|0),(0|0),(3904|0),(138|0),(3496|0),(0|0),(3496|0),(0|0),(320|0),(3896|0),(139|0));
             HEAP32[$args$i10$i$i>>2] = 3;
             $66 = (($args$i10$i$i) + 4|0);
             HEAP32[$66>>2] = 14736;
             $67 = (($args$i10$i$i) + 8|0);
             HEAP32[$67>>2] = 2064;
             $68 = (($args$i10$i$i) + 12|0);
             HEAP32[$68>>2] = 14864;
             $69 = (_malloc(8)|0);
             $70 = ($69|0)==(0|0);
             if (!($70)) {
              HEAP8[$69>>0]=8&255;HEAP8[$69+1>>0]=(8>>8)&255;HEAP8[$69+2>>0]=(8>>16)&255;HEAP8[$69+3>>0]=8>>24;
              $$index86 = (($69) + 4|0);
              HEAP8[$$index86>>0]=1&255;HEAP8[$$index86+1>>0]=(1>>8)&255;HEAP8[$$index86+2>>0]=(1>>16)&255;HEAP8[$$index86+3>>0]=1>>24;
             }
             __embind_register_class_function((904|0),(5896|0),3,($66|0),(3888|0),(140|0),($69|0));
             __embind_register_class((3696|0),(3792|0),(3872|0),(904|0),(3832|0),(141|0),(3824|0),(142|0),(3816|0),(143|0),(336|0),(3808|0),(144|0));
             HEAP32[$args$i$i61$i$i>>2] = 2;
             $71 = (($args$i$i61$i$i) + 4|0);
             HEAP32[$71>>2] = 3792;
             $72 = (($args$i$i61$i$i) + 8|0);
             HEAP32[$72>>2] = 3312;
             __embind_register_class_class_function((904|0),(3016|0),2,($71|0),(3752|0),(145|0),(146|0));
             __embind_register_class((1152|0),(2288|0),(3560|0),(0|0),(3504|0),(147|0),(3496|0),(0|0),(3496|0),(0|0),(360|0),(3488|0),(148|0));
             HEAP32[$args$i15$i$i>>2] = 3;
             $73 = (($args$i15$i$i) + 4|0);
             HEAP32[$73>>2] = 14736;
             $74 = (($args$i15$i$i) + 8|0);
             HEAP32[$74>>2] = 2288;
             $75 = (($args$i15$i$i) + 12|0);
             HEAP32[$75>>2] = 3248;
             $76 = (_malloc(8)|0);
             $77 = ($76|0)==(0|0);
             if (!($77)) {
              HEAP8[$76>>0]=8&255;HEAP8[$76+1>>0]=(8>>8)&255;HEAP8[$76+2>>0]=(8>>16)&255;HEAP8[$76+3>>0]=8>>24;
              $$index88 = (($76) + 4|0);
              HEAP8[$$index88>>0]=1&255;HEAP8[$$index88+1>>0]=(1>>8)&255;HEAP8[$$index88+2>>0]=(1>>16)&255;HEAP8[$$index88+3>>0]=1>>24;
             }
             __embind_register_class_function((1152|0),(5896|0),3,($73|0),(3480|0),(149|0),($76|0));
             __embind_register_class((3184|0),(3368|0),(3464|0),(1152|0),(3408|0),(150|0),(3400|0),(151|0),(3392|0),(152|0),(384|0),(3384|0),(153|0));
             HEAP32[$args$i$i75$i$i>>2] = 2;
             $78 = (($args$i$i75$i$i) + 4|0);
             HEAP32[$78>>2] = 3368;
             $79 = (($args$i$i75$i$i) + 8|0);
             HEAP32[$79>>2] = 3312;
             __embind_register_class_class_function((1152|0),(3016|0),2,($78|0),(3280|0),(154|0),(155|0));
             __embind_register_class((1976|0),(2928|0),(3000|0),(1376|0),(2968|0),(156|0),(2960|0),(157|0),(2952|0),(158|0),(416|0),(2944|0),(159|0));
             HEAP32[$args$i22$i$i>>2] = 3;
             $80 = (($args$i22$i$i) + 4|0);
             HEAP32[$80>>2] = 14736;
             $81 = (($args$i22$i$i) + 8|0);
             HEAP32[$81>>2] = 2928;
             $82 = (($args$i22$i$i) + 12|0);
             HEAP32[$82>>2] = 2888;
             $83 = (_malloc(8)|0);
             $84 = ($83|0)==(0|0);
             if (!($84)) {
              HEAP8[$83>>0]=(160)&255;HEAP8[$83+1>>0]=((160)>>8)&255;HEAP8[$83+2>>0]=((160)>>16)&255;HEAP8[$83+3>>0]=(160)>>24;
              $$index90 = (($83) + 4|0);
              HEAP8[$$index90>>0]=0&255;HEAP8[$$index90+1>>0]=(0>>8)&255;HEAP8[$$index90+2>>0]=(0>>16)&255;HEAP8[$$index90+3>>0]=0>>24;
             }
             __embind_register_class_function((1976|0),(448|0),3,($80|0),(2856|0),(161|0),($83|0));
             __embind_register_class((1800|0),(2768|0),(2840|0),(1792|0),(2808|0),(162|0),(2800|0),(163|0),(2792|0),(164|0),(456|0),(2784|0),(165|0));
             HEAP32[$args$i29$i$i>>2] = 3;
             $85 = (($args$i29$i$i) + 4|0);
             HEAP32[$85>>2] = 14736;
             $86 = (($args$i29$i$i) + 8|0);
             HEAP32[$86>>2] = 2768;
             $87 = (($args$i29$i$i) + 12|0);
             HEAP32[$87>>2] = 2608;
             $88 = (_malloc(8)|0);
             $89 = ($88|0)==(0|0);
             if (!($89)) {
              HEAP8[$88>>0]=(166)&255;HEAP8[$88+1>>0]=((166)>>8)&255;HEAP8[$88+2>>0]=((166)>>16)&255;HEAP8[$88+3>>0]=(166)>>24;
              $$index92 = (($88) + 4|0);
              HEAP8[$$index92>>0]=0&255;HEAP8[$$index92+1>>0]=(0>>8)&255;HEAP8[$$index92+2>>0]=(0>>16)&255;HEAP8[$$index92+3>>0]=0>>24;
             }
             __embind_register_class_function((1800|0),(448|0),3,($85|0),(2736|0),(167|0),($88|0));
             __embind_register_class((1560|0),(2648|0),(2720|0),(904|0),(2688|0),(168|0),(2680|0),(169|0),(2672|0),(170|0),(488|0),(2664|0),(171|0));
             HEAP32[$args$i36$i$i>>2] = 3;
             $90 = (($args$i36$i$i) + 4|0);
             HEAP32[$90>>2] = 14736;
             $91 = (($args$i36$i$i) + 8|0);
             HEAP32[$91>>2] = 2648;
             $92 = (($args$i36$i$i) + 12|0);
             HEAP32[$92>>2] = 2608;
             $93 = (_malloc(8)|0);
             $94 = ($93|0)==(0|0);
             if (!($94)) {
              HEAP8[$93>>0]=(172)&255;HEAP8[$93+1>>0]=((172)>>8)&255;HEAP8[$93+2>>0]=((172)>>16)&255;HEAP8[$93+3>>0]=(172)>>24;
              $$index94 = (($93) + 4|0);
              HEAP8[$$index94>>0]=0&255;HEAP8[$$index94+1>>0]=(0>>8)&255;HEAP8[$$index94+2>>0]=(0>>16)&255;HEAP8[$$index94+3>>0]=0>>24;
             }
             __embind_register_class_function((1560|0),(448|0),3,($90|0),(2576|0),(173|0),($93|0));
             __embind_register_class((1384|0),(2488|0),(2560|0),(1376|0),(2528|0),(174|0),(2520|0),(175|0),(2512|0),(176|0),(512|0),(2504|0),(177|0));
             HEAP32[$args$i43$i$i>>2] = 3;
             $95 = (($args$i43$i$i) + 4|0);
             HEAP32[$95>>2] = 14736;
             $96 = (($args$i43$i$i) + 8|0);
             HEAP32[$96>>2] = 2488;
             $97 = (($args$i43$i$i) + 12|0);
             HEAP32[$97>>2] = 2064;
             $98 = (_malloc(8)|0);
             $99 = ($98|0)==(0|0);
             if (!($99)) {
              HEAP8[$98>>0]=(178)&255;HEAP8[$98+1>>0]=((178)>>8)&255;HEAP8[$98+2>>0]=((178)>>16)&255;HEAP8[$98+3>>0]=(178)>>24;
              $$index96 = (($98) + 4|0);
              HEAP8[$$index96>>0]=0&255;HEAP8[$$index96+1>>0]=(0>>8)&255;HEAP8[$$index96+2>>0]=(0>>16)&255;HEAP8[$$index96+3>>0]=0>>24;
             }
             __embind_register_class_function((1384|0),(448|0),3,($95|0),(2456|0),(179|0),($98|0));
             __embind_register_class((912|0),(2344|0),(2440|0),(904|0),(2384|0),(180|0),(2376|0),(181|0),(2368|0),(182|0),(536|0),(2360|0),(183|0));
             HEAP32[$args$i50$i$i>>2] = 3;
             $100 = (($args$i50$i$i) + 4|0);
             HEAP32[$100>>2] = 14736;
             $101 = (($args$i50$i$i) + 8|0);
             HEAP32[$101>>2] = 2344;
             $102 = (($args$i50$i$i) + 12|0);
             HEAP32[$102>>2] = 2288;
             $103 = (_malloc(8)|0);
             $104 = ($103|0)==(0|0);
             if (!($104)) {
              HEAP8[$103>>0]=(184)&255;HEAP8[$103+1>>0]=((184)>>8)&255;HEAP8[$103+2>>0]=((184)>>16)&255;HEAP8[$103+3>>0]=(184)>>24;
              $$index98 = (($103) + 4|0);
              HEAP8[$$index98>>0]=0&255;HEAP8[$$index98+1>>0]=(0>>8)&255;HEAP8[$$index98+2>>0]=(0>>16)&255;HEAP8[$$index98+3>>0]=0>>24;
             }
             __embind_register_class_function((912|0),(448|0),3,($100|0),(2232|0),(185|0),($103|0));
             __embind_register_class((1160|0),(2120|0),(2216|0),(1152|0),(2160|0),(186|0),(2152|0),(187|0),(2144|0),(188|0),(568|0),(2136|0),(189|0));
             HEAP32[$args$i57$i$i>>2] = 3;
             $105 = (($args$i57$i$i) + 4|0);
             HEAP32[$105>>2] = 14736;
             $106 = (($args$i57$i$i) + 8|0);
             HEAP32[$106>>2] = 2120;
             $107 = (($args$i57$i$i) + 12|0);
             HEAP32[$107>>2] = 2064;
             $108 = (_malloc(8)|0);
             $109 = ($108|0)==(0|0);
             if (!($109)) {
              HEAP8[$108>>0]=(190)&255;HEAP8[$108+1>>0]=((190)>>8)&255;HEAP8[$108+2>>0]=((190)>>16)&255;HEAP8[$108+3>>0]=(190)>>24;
              $$index100 = (($108) + 4|0);
              HEAP8[$$index100>>0]=0&255;HEAP8[$$index100+1>>0]=(0>>8)&255;HEAP8[$$index100+2>>0]=(0>>16)&255;HEAP8[$$index100+3>>0]=0>>24;
             }
             __embind_register_class_function((1160|0),(448|0),3,($105|0),(2032|0),(191|0),($108|0));
             __embind_register_class((5520|0),(1896|0),(2016|0),(1976|0),(1944|0),(192|0),(1936|0),(193|0),(1928|0),(194|0),(600|0),(1920|0),(195|0));
             HEAP32[$args$i$i136$i$i>>2] = 2;
             $110 = (($args$i$i136$i$i) + 4|0);
             HEAP32[$110>>2] = 1896;
             $111 = (($args$i$i136$i$i) + 8|0);
             HEAP32[$111>>2] = 1704;
             __embind_register_class_constructor((5520|0),2,($110|0),(1912|0),(196|0),(197|0));
             HEAP32[$args$i62$i$i>>2] = 2;
             $112 = (($args$i62$i$i) + 4|0);
             HEAP32[$112>>2] = 14736;
             $113 = (($args$i62$i$i) + 8|0);
             HEAP32[$113>>2] = 1896;
             $114 = (_malloc(8)|0);
             $115 = ($114|0)==(0|0);
             if (!($115)) {
              HEAP8[$114>>0]=12&255;HEAP8[$114+1>>0]=(12>>8)&255;HEAP8[$114+2>>0]=(12>>16)&255;HEAP8[$114+3>>0]=12>>24;
              $$index102 = (($114) + 4|0);
              HEAP8[$$index102>>0]=1&255;HEAP8[$$index102+1>>0]=(1>>8)&255;HEAP8[$$index102+2>>0]=(1>>16)&255;HEAP8[$$index102+3>>0]=1>>24;
             }
             __embind_register_class_function((5520|0),(616|0),2,($112|0),(1864|0),(198|0),($114|0));
             __embind_register_class((5560|0),(1656|0),(1848|0),(1800|0),(1736|0),(199|0),(1728|0),(200|0),(1720|0),(201|0),(624|0),(1712|0),(202|0));
             HEAP32[$args$i$i124$i$i>>2] = 2;
             $116 = (($args$i$i124$i$i) + 4|0);
             HEAP32[$116>>2] = 1656;
             $117 = (($args$i$i124$i$i) + 8|0);
             HEAP32[$117>>2] = 1704;
             __embind_register_class_constructor((5560|0),2,($116|0),(1672|0),(203|0),(204|0));
             HEAP32[$args$i67$i$i>>2] = 2;
             $118 = (($args$i67$i$i) + 4|0);
             HEAP32[$118>>2] = 14736;
             $119 = (($args$i67$i$i) + 8|0);
             HEAP32[$119>>2] = 1656;
             $120 = (_malloc(8)|0);
             $121 = ($120|0)==(0|0);
             if (!($121)) {
              HEAP8[$120>>0]=(205)&255;HEAP8[$120+1>>0]=((205)>>8)&255;HEAP8[$120+2>>0]=((205)>>16)&255;HEAP8[$120+3>>0]=(205)>>24;
              $$index104 = (($120) + 4|0);
              HEAP8[$$index104>>0]=0&255;HEAP8[$$index104+1>>0]=(0>>8)&255;HEAP8[$$index104+2>>0]=(0>>16)&255;HEAP8[$$index104+3>>0]=0>>24;
             }
             __embind_register_class_function((5560|0),(640|0),2,($118|0),(1624|0),(206|0),($120|0));
             __embind_register_class((5720|0),(1488|0),(1608|0),(1560|0),(1528|0),(207|0),(1520|0),(208|0),(1512|0),(209|0),(648|0),(1504|0),(210|0));
             HEAP32[$args$i$i112$i$i>>2] = 1;
             $122 = (($args$i$i112$i$i) + 4|0);
             HEAP32[$122>>2] = 1488;
             __embind_register_class_constructor((5720|0),1,($122|0),(1448|0),(211|0),(212|0));
             __embind_register_class((5768|0),(1272|0),(1432|0),(1384|0),(1320|0),(213|0),(1312|0),(214|0),(1304|0),(215|0),(672|0),(1296|0),(216|0));
             HEAP32[$args$i$i106$i$i>>2] = 1;
             $123 = (($args$i$i106$i$i) + 4|0);
             HEAP32[$123>>2] = 1272;
             __embind_register_class_constructor((5768|0),1,($123|0),(1288|0),(217|0),(218|0));
             HEAP32[$args$i72$i$i>>2] = 2;
             $124 = (($args$i72$i$i) + 4|0);
             HEAP32[$124>>2] = 14736;
             $125 = (($args$i72$i$i) + 8|0);
             HEAP32[$125>>2] = 1272;
             $126 = (_malloc(8)|0);
             $127 = ($126|0)==(0|0);
             if (!($127)) {
              HEAP8[$126>>0]=(219)&255;HEAP8[$126+1>>0]=((219)>>8)&255;HEAP8[$126+2>>0]=((219)>>16)&255;HEAP8[$126+3>>0]=(219)>>24;
              $$index106 = (($126) + 4|0);
              HEAP8[$$index106>>0]=0&255;HEAP8[$$index106+1>>0]=(0>>8)&255;HEAP8[$$index106+2>>0]=(0>>16)&255;HEAP8[$$index106+3>>0]=0>>24;
             }
             __embind_register_class_function((5768|0),(616|0),2,($124|0),(1232|0),(220|0),($126|0));
             __embind_register_class((6024|0),(1024|0),(1216|0),(1160|0),(1064|0),(221|0),(1056|0),(222|0),(1048|0),(223|0),(696|0),(1040|0),(224|0));
             HEAP32[$args$i$i94$i$i>>2] = 1;
             $128 = (($args$i$i94$i$i) + 4|0);
             HEAP32[$128>>2] = 1024;
             __embind_register_class_constructor((6024|0),1,($128|0),(984|0),(225|0),(226|0));
             __embind_register_class((6072|0),(784|0),(968|0),(912|0),(832|0),(227|0),(824|0),(228|0),(816|0),(229|0),(720|0),(808|0),(230|0));
             HEAP32[$args$i$i83$i$i>>2] = 1;
             $129 = (($args$i$i83$i$i) + 4|0);
             HEAP32[$129>>2] = 784;
             __embind_register_class_constructor((6072|0),1,($129|0),(800|0),(231|0),(232|0));
             HEAP32[$args$i77$i$i>>2] = 2;
             $130 = (($args$i77$i$i) + 4|0);
             HEAP32[$130>>2] = 14736;
             $131 = (($args$i77$i$i) + 8|0);
             HEAP32[$131>>2] = 784;
             $132 = (_malloc(8)|0);
             $133 = ($132|0)==(0|0);
             if ($133) {
              __embind_register_class_function((6072|0),(616|0),2,($130|0),(744|0),(234|0),($132|0));
              STACKTOP = sp;return;
             }
             HEAP8[$132>>0]=(233)&255;HEAP8[$132+1>>0]=((233)>>8)&255;HEAP8[$132+2>>0]=((233)>>16)&255;HEAP8[$132+3>>0]=(233)>>24;
             $$index108 = (($132) + 4|0);
             HEAP8[$$index108>>0]=0&255;HEAP8[$$index108+1>>0]=(0>>8)&255;HEAP8[$$index108+2>>0]=(0>>16)&255;HEAP8[$$index108+3>>0]=0>>24;
             __embind_register_class_function((6072|0),(616|0),2,($130|0),(744|0),(234|0),($132|0));
             STACKTOP = sp;return;
            }
           }
          }
         }
        }
       }
      }
     }
     $140 = ___cxa_find_matching_catch(-1,-1)|0;
     $141 = tempRet0;
     __THREW__ = 0;
     invoke_vi(106,(3248|0));
     $142 = __THREW__; __THREW__ = 0;
     $143 = $142&1;
     if ($143) {
      $144 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
      $145 = tempRet0;
      __ZSt9terminatev();
      // unreachable;
     } else {
      $$0 = $140;$$055 = $141;
      ___resumeException($$0|0);
      // unreachable;
     }
    }
   }
  }
 }
 $134 = ___cxa_find_matching_catch(-1,-1)|0;
 $135 = tempRet0;
 __THREW__ = 0;
 invoke_vi(106,(1704|0));
 $136 = __THREW__; __THREW__ = 0;
 $137 = $136&1;
 if ($137) {
  $138 = ___cxa_find_matching_catch(-1,-1,0|0)|0;
  $139 = tempRet0;
  __ZSt9terminatev();
  // unreachable;
 } else {
  $$0 = $134;$$055 = $135;
  ___resumeException($$0|0);
  // unreachable;
 }
}
function __ZN6fskube9Modulator5resetEv($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 24|0);
 HEAPF64[$0>>3] = 0.0;
 STACKTOP = sp;return;
}
function __ZN6fskube9Modulator7receiveEb($this,$bit) {
 $this = $this|0;
 $bit = $bit|0;
 var $$in = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0.0, $28 = 0.0, $29 = 0.0, $3 = 0, $30 = 0.0, $31 = 0.0, $32 = 0.0, $33 = 0.0, $34 = 0.0, $35 = 0, $36 = 0.0, $4 = 0, $5 = 0.0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $storemerge = 0, $storemerge1 = 0.0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 16|0);
 $1 = (($this) + 20|0);
 $$in = $bit ? $0 : $1;
 $2 = HEAP32[$$in>>2]|0;
 $3 = (($this) + 8|0);
 $4 = (($this) + 12|0);
 $5 = (+($2>>>0));
 $6 = (($this) + 24|0);
 $7 = (($this) + 4|0);
 $storemerge = 0;
 while(1) {
  $8 = HEAP32[$3>>2]|0;
  $9 = HEAP32[$4>>2]|0;
  $10 = (($8>>>0) / ($9>>>0))&-1;
  $11 = ($storemerge>>>0)<($10>>>0);
  if (!($11)) {
   break;
  }
  $12 = HEAP32[$7>>2]|0;
  $13 = ($12|0)==(0|0);
  if (!($13)) {
   $14 = (+($8>>>0));
   $15 = (+($storemerge>>>0));
   $16 = $15 / $14;
   $17 = $16 * 2.0;
   $18 = $17 * 3.141592653589793116;
   $19 = +HEAPF64[$6>>3];
   $20 = $18 * $5;
   $21 = $20 + $19;
   $22 = (+Math_sin((+$21)));
   $23 = HEAP32[$12>>2]|0;
   $24 = (($23) + 8|0);
   $25 = HEAP32[$24>>2]|0;
   FUNCTION_TABLE_vid[$25 & 127]($12,$22);
  }
  $26 = (($storemerge) + 1)|0;
  $storemerge = $26;
 }
 $27 = (+($10>>>0));
 $28 = (+($8>>>0));
 $29 = $27 / $28;
 $30 = $29 * 2.0;
 $31 = $30 * 3.141592653589793116;
 $32 = $31 * $5;
 $33 = +HEAPF64[$6>>3];
 $34 = $32 + $33;
 $35 = $34 > 6.283185307179586232;
 if (!($35)) {
  $storemerge1 = $34;
  HEAPF64[$6>>3] = $storemerge1;
  STACKTOP = sp;return;
 }
 $36 = $34 + -6.283185307179586232;
 $storemerge1 = $36;
 HEAPF64[$6>>3] = $storemerge1;
 STACKTOP = sp;return;
}
function __ZN6fskube11Demodulator5flushEv($this) {
 $this = $this|0;
 var $$pre = 0, $$pre$phi3Z2D = 0, $$pre$phiZ2D = 0, $$pre2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $vararg_buffer = 0, $vararg_buffer9 = 0, $vararg_ptr12 = 0, $vararg_ptr13 = 0, $vararg_ptr6 = 0, $vararg_ptr7 = 0, $vararg_ptr8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $vararg_buffer9 = sp + 80|0;
 $vararg_buffer = sp + 64|0;
 $0 = sp + 32|0;
 $1 = sp;
 $2 = HEAP32[4856>>2]|0;
 $3 = (($2) + 23|0);
 $4 = HEAP8[$3>>0]|0;
 $5 = $4 & 1;
 $6 = ($5<<24>>24)==(0);
 if ($6) {
  $$pre = (($this) + 108|0);
  $$pre$phiZ2D = $$pre;
 } else {
  $7 = HEAP32[_stderr>>2]|0;
  $8 = (($this) + 108|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = (($this) + 104|0);
  $11 = HEAP32[$10>>2]|0;
  HEAP32[$vararg_buffer>>2] = $2;
  $vararg_ptr6 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr6>>2] = 2;
  $vararg_ptr7 = (($vararg_buffer) + 8|0);
  HEAP32[$vararg_ptr7>>2] = $9;
  $vararg_ptr8 = (($vararg_buffer) + 12|0);
  HEAP32[$vararg_ptr8>>2] = $11;
  (_fprintf(($7|0),(4992|0),($vararg_buffer|0))|0);
  $$pre$phiZ2D = $8;
 }
 $12 = HEAP32[$$pre$phiZ2D>>2]|0;
 $13 = ($12|0)==(0);
 $$pre2 = (($this) + 104|0);
 if ($13) {
  $$pre$phi3Z2D = $$pre2;
 } else {
  $14 = HEAP32[$$pre2>>2]|0;
  $15 = (($this) + 16|0);
  $16 = HEAP32[$15>>2]|0;
  $17 = ($16|0)==($14|0);
  $18 = HEAP32[4856>>2]|0;
  $19 = (($18) + 23|0);
  $20 = HEAP8[$19>>0]|0;
  $21 = $20 & 1;
  $22 = ($21<<24>>24)==(0);
  if (!($22)) {
   $23 = HEAP32[_stderr>>2]|0;
   $24 = $17&1;
   HEAP32[$vararg_buffer9>>2] = $18;
   $vararg_ptr12 = (($vararg_buffer9) + 4|0);
   HEAP32[$vararg_ptr12>>2] = 2;
   $vararg_ptr13 = (($vararg_buffer9) + 8|0);
   HEAP32[$vararg_ptr13>>2] = $24;
   (_fprintf(($23|0),(5064|0),($vararg_buffer9|0))|0);
  }
  $25 = (($this) + 4|0);
  $26 = HEAP32[$25>>2]|0;
  $27 = ($26|0)==(0|0);
  if ($27) {
   $$pre$phi3Z2D = $$pre2;
  } else {
   $28 = HEAP32[$26>>2]|0;
   $29 = (($28) + 8|0);
   $30 = HEAP32[$29>>2]|0;
   FUNCTION_TABLE_vii[$30 & 255]($26,$17);
   $$pre$phi3Z2D = $$pre2;
  }
 }
 $31 = (($this) + 32|0);
 ;HEAP32[$0+0>>2]=0|0;HEAP32[$0+4>>2]=0|0;HEAP32[$0+8>>2]=0|0;HEAP32[$0+12>>2]=0|0;HEAP32[$0+16>>2]=0|0;HEAP32[$0+20>>2]=0|0;HEAP32[$0+24>>2]=0|0;HEAP32[$0+28>>2]=0|0;
 ;HEAP32[$31+0>>2]=HEAP32[$0+0>>2]|0;HEAP32[$31+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[$31+8>>2]=HEAP32[$0+8>>2]|0;HEAP32[$31+12>>2]=HEAP32[$0+12>>2]|0;HEAP32[$31+16>>2]=HEAP32[$0+16>>2]|0;HEAP32[$31+20>>2]=HEAP32[$0+20>>2]|0;HEAP32[$31+24>>2]=HEAP32[$0+24>>2]|0;HEAP32[$31+28>>2]=HEAP32[$0+28>>2]|0;
 $32 = (($this) + 64|0);
 HEAP32[$32>>2] = 0;
 $33 = (($this) + 72|0);
 ;HEAP32[$1+0>>2]=0|0;HEAP32[$1+4>>2]=0|0;HEAP32[$1+8>>2]=0|0;HEAP32[$1+12>>2]=0|0;HEAP32[$1+16>>2]=0|0;HEAP32[$1+20>>2]=0|0;HEAP32[$1+24>>2]=0|0;HEAP32[$1+28>>2]=0|0;
 ;HEAP32[$33+0>>2]=HEAP32[$1+0>>2]|0;HEAP32[$33+4>>2]=HEAP32[$1+4>>2]|0;HEAP32[$33+8>>2]=HEAP32[$1+8>>2]|0;HEAP32[$33+12>>2]=HEAP32[$1+12>>2]|0;HEAP32[$33+16>>2]=HEAP32[$1+16>>2]|0;HEAP32[$33+20>>2]=HEAP32[$1+20>>2]|0;HEAP32[$33+24>>2]=HEAP32[$1+24>>2]|0;HEAP32[$33+28>>2]=HEAP32[$1+28>>2]|0;
 HEAP32[$$pre$phi3Z2D>>2] = 0;
 HEAP32[$$pre$phiZ2D>>2] = 0;
 $34 = (($this) + 112|0);
 HEAP32[$34>>2] = 0;
 $35 = (($this) + 116|0);
 HEAP32[$35>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN6fskube11Demodulator7receiveEd($this,$value) {
 $this = $this|0;
 $value = +$value;
 var $$pre = 0, $$pre$phi12Z2D = 0, $$pre$phi14Z2D = 0, $$pre$phi17Z2D = 0, $$pre$phi19Z2D = 0, $$pre$phi21Z2D = 0, $$pre$phi23Z2D = 0, $$pre$phi25Z2D = 0, $$pre$phiZ2D = 0, $$pre11 = 0, $$pre16 = 0, $$pre18 = 0, $$pre20 = 0, $$pre22 = 0, $$pre24 = 0, $$sroa$58 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0.0;
 var $101 = 0.0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0.0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0.0, $118 = 0.0, $119 = 0;
 var $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0;
 var $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0.0, $143 = 0, $144 = 0.0, $145 = 0.0, $146 = 0.0, $147 = 0.0, $148 = 0, $149 = 0, $15 = 0, $150 = 0.0, $151 = 0.0, $152 = 0, $153 = 0, $154 = 0.0, $155 = 0.0;
 var $156 = 0, $157 = 0, $158 = 0.0, $159 = 0.0, $16 = 0, $160 = 0.0, $161 = 0.0, $162 = 0.0, $163 = 0, $164 = 0.0, $165 = 0.0, $166 = 0, $167 = 0.0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0;
 var $174 = 0.0, $175 = 0.0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0;
 var $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0;
 var $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0;
 var $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0;
 var $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0.0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0;
 var $264 = 0, $265 = 0, $266 = 0, $267 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
 var $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0.0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0.0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0;
 var $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0.0, $9 = 0, $90 = 0.0, $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0.0;
 var $96 = 0, $97 = 0, $98 = 0, $99 = 0.0, $crossingSample$sroa$5 = 0, $or$cond = 0, $sample$sroa$5 = 0, $vararg_buffer = 0, $vararg_buffer32 = 0, $vararg_buffer39 = 0, $vararg_buffer48 = 0, $vararg_buffer55 = 0, $vararg_buffer60 = 0, $vararg_buffer64 = 0, $vararg_buffer69 = 0, $vararg_buffer74 = 0, $vararg_ptr29 = 0, $vararg_ptr30 = 0, $vararg_ptr31 = 0, $vararg_ptr35 = 0;
 var $vararg_ptr36 = 0, $vararg_ptr37 = 0, $vararg_ptr38 = 0, $vararg_ptr42 = 0, $vararg_ptr43 = 0, $vararg_ptr44 = 0, $vararg_ptr45 = 0, $vararg_ptr46 = 0, $vararg_ptr47 = 0, $vararg_ptr51 = 0, $vararg_ptr52 = 0, $vararg_ptr53 = 0, $vararg_ptr54 = 0, $vararg_ptr58 = 0, $vararg_ptr59 = 0, $vararg_ptr63 = 0, $vararg_ptr67 = 0, $vararg_ptr68 = 0, $vararg_ptr72 = 0, $vararg_ptr73 = 0;
 var $vararg_ptr77 = 0, $vararg_ptr78 = 0, $vararg_ptr79 = 0, $vararg_ptr80 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 256|0;
 $vararg_buffer74 = sp + 192|0;
 $vararg_buffer69 = sp + 176|0;
 $vararg_buffer64 = sp + 160|0;
 $vararg_buffer60 = sp + 152|0;
 $vararg_buffer55 = sp + 136|0;
 $vararg_buffer48 = sp + 104|0;
 $vararg_buffer39 = sp + 56|0;
 $vararg_buffer32 = sp + 24|0;
 $vararg_buffer = sp;
 $$sroa$58 = sp + 234|0;
 $sample$sroa$5 = sp + 227|0;
 $crossingSample$sroa$5 = sp + 220|0;
 $0 = !($value <= 1.0);
 if ($0) {
  ___assert_fail((5088|0),(4960|0),81,(5896|0));
  // unreachable;
 }
 $1 = !($value >= -1.0);
 if ($1) {
  ___assert_fail((5104|0),(4960|0),82,(5896|0));
  // unreachable;
 }
 $2 = HEAP32[4856>>2]|0;
 $3 = (($2) + 25|0);
 $4 = HEAP8[$3>>0]|0;
 $5 = $4 & 1;
 $6 = ($5<<24>>24)==(0);
 if ($6) {
  $$pre16 = (($this) + 24|0);
  $$pre$phi17Z2D = $$pre16;
 } else {
  $7 = HEAP32[_stderr>>2]|0;
  $8 = (($this) + 24|0);
  $9 = $8;
  $10 = $9;
  $11 = HEAP32[$10>>2]|0;
  $12 = (($9) + 4)|0;
  $13 = $12;
  $14 = HEAP32[$13>>2]|0;
  HEAP32[$vararg_buffer>>2] = $2;
  $vararg_ptr29 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr29>>2] = 4;
  $vararg_ptr30 = (($vararg_buffer) + 8|0);
  HEAPF64[tempDoublePtr>>3]=$value;HEAP32[$vararg_ptr30>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr30+4>>2]=HEAP32[tempDoublePtr+4>>2];
  $vararg_ptr31 = (($vararg_buffer) + 16|0);
  $15 = $vararg_ptr31;
  $16 = $15;
  HEAP32[$16>>2] = $11;
  $17 = (($15) + 4)|0;
  $18 = $17;
  HEAP32[$18>>2] = $14;
  (_fprintf(($7|0),(5120|0),($vararg_buffer|0))|0);
  $$pre$phi17Z2D = $8;
 }
 $19 = $$pre$phi17Z2D;
 $20 = $19;
 $21 = HEAP32[$20>>2]|0;
 $22 = (($19) + 4)|0;
 $23 = $22;
 $24 = HEAP32[$23>>2]|0;
 $25 = (_i64Add(($21|0),($24|0),1,0)|0);
 $26 = tempRet0;
 $27 = $$pre$phi17Z2D;
 $28 = $27;
 HEAP32[$28>>2] = $25;
 $29 = (($27) + 4)|0;
 $30 = $29;
 HEAP32[$30>>2] = $26;
 $31 = !($value >= 0.400000000000000022204);
 $32 = !($value <= -0.400000000000000022204);
 $or$cond = $31 & $32;
 if ($or$cond) {
  $33 = (($this) + 64|0);
  $34 = HEAP32[$33>>2]|0;
  $35 = (($34) + 1)|0;
  HEAP32[$33>>2] = $35;
  $36 = (($this) + 8|0);
  $37 = HEAP32[$36>>2]|0;
  $38 = (($this) + 12|0);
  $39 = HEAP32[$38>>2]|0;
  $40 = (($37>>>0) / ($39>>>0))&-1;
  $41 = ($35>>>0)>($40>>>0);
  if ($41) {
   __ZN6fskube11Demodulator5flushEv($this);
  }
  $42 = (($this) + 96|0);
  $43 = HEAP8[$42>>0]|0;
  $44 = $43 & 1;
  $45 = ($44<<24>>24)==(0);
  if (!($45)) {
   STACKTOP = sp;return;
  }
  $46 = (($this) + 32|0);
  $47 = $46;
  $48 = $47;
  HEAP32[$48>>2] = $21;
  $49 = (($47) + 4)|0;
  $50 = $49;
  HEAP32[$50>>2] = $24;
  $51 = (($this) + 40|0);
  HEAPF32[$51>>2] = 0.0;
  $52 = (($this) + 48|0);
  HEAPF64[$52>>3] = $value;
  $53 = (($this) + 56|0);
  HEAP8[$53>>0] = 1;
  $54 = (($this) + 57|0);
  ;HEAP8[$54+0>>0]=HEAP8[$sample$sroa$5+0>>0]|0;HEAP8[$54+1>>0]=HEAP8[$sample$sroa$5+1>>0]|0;HEAP8[$54+2>>0]=HEAP8[$sample$sroa$5+2>>0]|0;HEAP8[$54+3>>0]=HEAP8[$sample$sroa$5+3>>0]|0;HEAP8[$54+4>>0]=HEAP8[$sample$sroa$5+4>>0]|0;HEAP8[$54+5>>0]=HEAP8[$sample$sroa$5+5>>0]|0;HEAP8[$54+6>>0]=HEAP8[$sample$sroa$5+6>>0]|0;
  STACKTOP = sp;return;
 }
 $55 = HEAP32[4856>>2]|0;
 $56 = (($55) + 25|0);
 $57 = HEAP8[$56>>0]|0;
 $58 = $57 & 1;
 $59 = ($58<<24>>24)==(0);
 if ($59) {
  $$pre18 = (($this) + 96|0);
  $$pre$phi19Z2D = $$pre18;
 } else {
  $60 = HEAP32[_stderr>>2]|0;
  $61 = (($this) + 96|0);
  $62 = HEAP8[$61>>0]|0;
  $63 = $62 & 1;
  $64 = $63&255;
  $65 = (($this) + 88|0);
  $66 = +HEAPF64[$65>>3];
  HEAP32[$vararg_buffer32>>2] = $55;
  $vararg_ptr35 = (($vararg_buffer32) + 4|0);
  HEAP32[$vararg_ptr35>>2] = 4;
  $vararg_ptr36 = (($vararg_buffer32) + 8|0);
  HEAPF64[tempDoublePtr>>3]=$value;HEAP32[$vararg_ptr36>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr36+4>>2]=HEAP32[tempDoublePtr+4>>2];
  $vararg_ptr37 = (($vararg_buffer32) + 16|0);
  HEAP32[$vararg_ptr37>>2] = $64;
  $vararg_ptr38 = (($vararg_buffer32) + 20|0);
  HEAPF64[tempDoublePtr>>3]=$66;HEAP32[$vararg_ptr38>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr38+4>>2]=HEAP32[tempDoublePtr+4>>2];
  (_fprintf(($60|0),(5176|0),($vararg_buffer32|0))|0);
  $$pre$phi19Z2D = $61;
 }
 $67 = (($this) + 64|0);
 HEAP32[$67>>2] = 0;
 $68 = HEAP8[$$pre$phi19Z2D>>0]|0;
 $69 = $68 & 1;
 $70 = ($69<<24>>24)==(0);
 $$pre20 = (($this) + 72|0);
 $$pre22 = (($this) + 88|0);
 if ($70) {
  $$pre$phi21Z2D = $$pre20;$$pre$phi23Z2D = $$pre22;
 } else {
  $71 = +HEAPF64[$$pre22>>3];
  $72 = $71 > 0.0;
  $73 = $72&1;
  $74 = $71 < 0.0;
  $75 = $74&1;
  $76 = (($73) - ($75))|0;
  $77 = $value > 0.0;
  $78 = $77&1;
  $79 = $value < 0.0;
  $80 = $79&1;
  $81 = (($78) - ($80))|0;
  $82 = ($76|0)==($81|0);
  if ($82) {
   $$pre$phi21Z2D = $$pre20;$$pre$phi23Z2D = $$pre22;
  } else {
   $83 = $$pre20;
   $84 = $83;
   $85 = HEAP32[$84>>2]|0;
   $86 = (($83) + 4)|0;
   $87 = $86;
   $88 = HEAP32[$87>>2]|0;
   $89 = (+($85>>>0)) + (4294967296.0*(+($88>>>0)));
   $90 = $89 * $value;
   $91 = (+($21>>>0)) + (4294967296.0*(+($24>>>0)));
   $92 = $71 * $91;
   $93 = $90 - $92;
   $94 = $value - $71;
   $95 = $93 / $94;
   $96 = (~~$95)>>>0;
   $97 = +Math_abs($95) >= 1.0 ? $95 > 0.0 ? (Math_min(+Math_floor($95 / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math_ceil(($95 - +(~~$95 >>> 0)) / 4294967296.0) >>> 0 : 0;
   $98 = (~~(($95)));
   $99 = (+($98|0));
   $100 = $95 - $99;
   $101 = $100;
   ;HEAP8[$$sroa$58+0>>0]=HEAP8[$crossingSample$sroa$5+0>>0]|0;HEAP8[$$sroa$58+1>>0]=HEAP8[$crossingSample$sroa$5+1>>0]|0;HEAP8[$$sroa$58+2>>0]=HEAP8[$crossingSample$sroa$5+2>>0]|0;HEAP8[$$sroa$58+3>>0]=HEAP8[$crossingSample$sroa$5+3>>0]|0;HEAP8[$$sroa$58+4>>0]=HEAP8[$crossingSample$sroa$5+4>>0]|0;HEAP8[$$sroa$58+5>>0]=HEAP8[$crossingSample$sroa$5+5>>0]|0;HEAP8[$$sroa$58+6>>0]=HEAP8[$crossingSample$sroa$5+6>>0]|0;
   $102 = HEAP32[4856>>2]|0;
   $103 = (($102) + 22|0);
   $104 = HEAP8[$103>>0]|0;
   $105 = $104 & 1;
   $106 = ($105<<24>>24)==(0);
   if ($106) {
    $$pre24 = (($this) + 56|0);
    $$pre$phi25Z2D = $$pre24;
   } else {
    $107 = HEAP32[_stderr>>2]|0;
    $108 = $101;
    $109 = (($this) + 32|0);
    $110 = $109;
    $111 = $110;
    $112 = HEAP32[$111>>2]|0;
    $113 = (($110) + 4)|0;
    $114 = $113;
    $115 = HEAP32[$114>>2]|0;
    $116 = (($this) + 40|0);
    $117 = +HEAPF32[$116>>2];
    $118 = $117;
    $119 = (($this) + 56|0);
    $120 = HEAP8[$119>>0]|0;
    $121 = $120 & 1;
    $122 = $121&255;
    HEAP32[$vararg_buffer39>>2] = $102;
    $vararg_ptr42 = (($vararg_buffer39) + 4|0);
    HEAP32[$vararg_ptr42>>2] = 1;
    $vararg_ptr43 = (($vararg_buffer39) + 8|0);
    $123 = $vararg_ptr43;
    $124 = $123;
    HEAP32[$124>>2] = $96;
    $125 = (($123) + 4)|0;
    $126 = $125;
    HEAP32[$126>>2] = $97;
    $vararg_ptr44 = (($vararg_buffer39) + 16|0);
    HEAPF64[tempDoublePtr>>3]=$108;HEAP32[$vararg_ptr44>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr44+4>>2]=HEAP32[tempDoublePtr+4>>2];
    $vararg_ptr45 = (($vararg_buffer39) + 24|0);
    $127 = $vararg_ptr45;
    $128 = $127;
    HEAP32[$128>>2] = $112;
    $129 = (($127) + 4)|0;
    $130 = $129;
    HEAP32[$130>>2] = $115;
    $vararg_ptr46 = (($vararg_buffer39) + 32|0);
    HEAPF64[tempDoublePtr>>3]=$118;HEAP32[$vararg_ptr46>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr46+4>>2]=HEAP32[tempDoublePtr+4>>2];
    $vararg_ptr47 = (($vararg_buffer39) + 40|0);
    HEAP32[$vararg_ptr47>>2] = $122;
    (_fprintf(($107|0),(5208|0),($vararg_buffer39|0))|0);
    $$pre$phi25Z2D = $119;
   }
   $131 = HEAP8[$$pre$phi25Z2D>>0]|0;
   $132 = $131 & 1;
   $133 = ($132<<24>>24)==(0);
   $$pre = (($this) + 32|0);
   do {
    if ($133) {
     $$pre11 = (($this) + 40|0);
     $$pre$phi12Z2D = $$pre11;$$pre$phiZ2D = $$pre;
    } else {
     $134 = $$pre;
     $135 = $134;
     $136 = HEAP32[$135>>2]|0;
     $137 = (($134) + 4)|0;
     $138 = $137;
     $139 = HEAP32[$138>>2]|0;
     $140 = (_i64Subtract(($96|0),($97|0),($136|0),($139|0))|0);
     $141 = tempRet0;
     $142 = (+($140>>>0)) + (4294967296.0*(+($141>>>0)));
     $143 = (($this) + 40|0);
     $144 = +HEAPF32[$143>>2];
     $145 = $101 - $144;
     $146 = $142 + $145;
     $147 = $146;
     $148 = (($this) + 8|0);
     $149 = HEAP32[$148>>2]|0;
     $150 = (+($149>>>0));
     $151 = $147 / $150;
     $152 = (($this) + 16|0);
     $153 = HEAP32[$152>>2]|0;
     $154 = (+($153>>>0));
     $155 = 0.5 / $154;
     $156 = (($this) + 20|0);
     $157 = HEAP32[$156>>2]|0;
     $158 = (+($157>>>0));
     $159 = 0.5 / $158;
     $160 = $151 / $155;
     $161 = $151 / $159;
     $162 = $160 + -1.0;
     $163 = !($162 >= 0.0);
     if ($163) {
      $164 = -$162;
      $174 = $164;
     } else {
      $174 = $162;
     }
     $165 = $161 + -1.0;
     $166 = !($165 >= 0.0);
     if ($166) {
      $167 = -$165;
      $175 = $167;
     } else {
      $175 = $165;
     }
     $168 = HEAP32[4856>>2]|0;
     $169 = (($168) + 22|0);
     $170 = HEAP8[$169>>0]|0;
     $171 = $170 & 1;
     $172 = ($171<<24>>24)==(0);
     if (!($172)) {
      $173 = HEAP32[_stderr>>2]|0;
      HEAP32[$vararg_buffer48>>2] = $168;
      $vararg_ptr51 = (($vararg_buffer48) + 4|0);
      HEAP32[$vararg_ptr51>>2] = 1;
      $vararg_ptr52 = (($vararg_buffer48) + 8|0);
      HEAPF64[tempDoublePtr>>3]=$151;HEAP32[$vararg_ptr52>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr52+4>>2]=HEAP32[tempDoublePtr+4>>2];
      $vararg_ptr53 = (($vararg_buffer48) + 16|0);
      HEAPF64[tempDoublePtr>>3]=$174;HEAP32[$vararg_ptr53>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr53+4>>2]=HEAP32[tempDoublePtr+4>>2];
      $vararg_ptr54 = (($vararg_buffer48) + 24|0);
      HEAPF64[tempDoublePtr>>3]=$175;HEAP32[$vararg_ptr54>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr54+4>>2]=HEAP32[tempDoublePtr+4>>2];
      (_fprintf(($173|0),(5280|0),($vararg_buffer48|0))|0);
     }
     $176 = !($174 <= 0.100000001490116119385);
     if (!($176)) {
      $177 = (($this) + 116|0);
      $178 = HEAP32[$177>>2]|0;
      $179 = (($178) + 1)|0;
      HEAP32[$177>>2] = $179;
      $180 = HEAP32[$152>>2]|0;
      __ZN6fskube11Demodulator20addFrequencyHalfSeenEj($this,$180);
      $$pre$phi12Z2D = $143;$$pre$phiZ2D = $$pre;
      break;
     }
     $181 = !($175 <= 0.100000001490116119385);
     if (!($181)) {
      $182 = (($this) + 116|0);
      $183 = HEAP32[$182>>2]|0;
      $184 = ($183|0)==(0);
      $185 = (($this) + 112|0);
      if ($184) {
       $186 = HEAP32[$185>>2]|0;
       $187 = ($186|0)>(0);
       if ($187) {
        $188 = HEAP32[4856>>2]|0;
        $189 = (($188) + 23|0);
        $190 = HEAP8[$189>>0]|0;
        $191 = $190 & 1;
        $192 = ($191<<24>>24)==(0);
        if (!($192)) {
         $193 = HEAP32[_stderr>>2]|0;
         HEAP32[$vararg_buffer55>>2] = $188;
         $vararg_ptr58 = (($vararg_buffer55) + 4|0);
         HEAP32[$vararg_ptr58>>2] = 2;
         $vararg_ptr59 = (($vararg_buffer55) + 8|0);
         HEAP32[$vararg_ptr59>>2] = 1;
         (_fprintf(($193|0),(5064|0),($vararg_buffer55|0))|0);
        }
        $194 = (($this) + 4|0);
        $195 = HEAP32[$194>>2]|0;
        $196 = ($195|0)==(0|0);
        if (!($196)) {
         $197 = HEAP32[$195>>2]|0;
         $198 = (($197) + 8|0);
         $199 = HEAP32[$198>>2]|0;
         FUNCTION_TABLE_vii[$199 & 255]($195,1);
        }
        HEAP32[$185>>2] = 0;
        $$pre$phi14Z2D = $185;
       } else {
        $$pre$phi14Z2D = $185;
       }
      } else {
       $$pre$phi14Z2D = $185;
      }
      HEAP32[$182>>2] = 0;
      HEAP32[$$pre$phi14Z2D>>2] = 0;
      $200 = HEAP32[$156>>2]|0;
      __ZN6fskube11Demodulator20addFrequencyHalfSeenEj($this,$200);
      $$pre$phi12Z2D = $143;$$pre$phiZ2D = $$pre;
      break;
     }
     $201 = HEAP32[4856>>2]|0;
     $202 = (($201) + 22|0);
     $203 = HEAP8[$202>>0]|0;
     $204 = $203 & 1;
     $205 = ($204<<24>>24)==(0);
     if (!($205)) {
      $206 = HEAP32[_stderr>>2]|0;
      HEAP32[$vararg_buffer60>>2] = $201;
      $vararg_ptr63 = (($vararg_buffer60) + 4|0);
      HEAP32[$vararg_ptr63>>2] = 1;
      (_fprintf(($206|0),(5360|0),($vararg_buffer60|0))|0);
     }
     $207 = (($this) + 108|0);
     $208 = HEAP32[$207>>2]|0;
     $209 = ($208|0)==(0);
     if ($209) {
      $227 = !($174 <= 0.20000000298023223877);
      if (!($227)) {
       $228 = (($this) + 112|0);
       $229 = HEAP32[$228>>2]|0;
       $230 = (($229) + 1)|0;
       HEAP32[$228>>2] = $230;
       $231 = ($230|0)==(2);
       if ($231) {
        $232 = HEAP32[4856>>2]|0;
        $233 = (($232) + 23|0);
        $234 = HEAP8[$233>>0]|0;
        $235 = $234 & 1;
        $236 = ($235<<24>>24)==(0);
        if (!($236)) {
         $237 = HEAP32[_stderr>>2]|0;
         HEAP32[$vararg_buffer69>>2] = $232;
         $vararg_ptr72 = (($vararg_buffer69) + 4|0);
         HEAP32[$vararg_ptr72>>2] = 2;
         $vararg_ptr73 = (($vararg_buffer69) + 8|0);
         HEAP32[$vararg_ptr73>>2] = 1;
         (_fprintf(($237|0),(5064|0),($vararg_buffer69|0))|0);
        }
        $238 = (($this) + 4|0);
        $239 = HEAP32[$238>>2]|0;
        $240 = ($239|0)==(0|0);
        if (!($240)) {
         $241 = HEAP32[$239>>2]|0;
         $242 = (($241) + 8|0);
         $243 = HEAP32[$242>>2]|0;
         FUNCTION_TABLE_vii[$243 & 255]($239,1);
        }
        HEAP32[$228>>2] = 0;
       }
      }
     } else {
      $210 = (($this) + 104|0);
      $211 = HEAP32[$210>>2]|0;
      $212 = HEAP32[$152>>2]|0;
      $213 = ($212|0)==($211|0);
      $214 = HEAP32[4856>>2]|0;
      $215 = (($214) + 23|0);
      $216 = HEAP8[$215>>0]|0;
      $217 = $216 & 1;
      $218 = ($217<<24>>24)==(0);
      if (!($218)) {
       $219 = HEAP32[_stderr>>2]|0;
       $220 = $213&1;
       HEAP32[$vararg_buffer64>>2] = $214;
       $vararg_ptr67 = (($vararg_buffer64) + 4|0);
       HEAP32[$vararg_ptr67>>2] = 2;
       $vararg_ptr68 = (($vararg_buffer64) + 8|0);
       HEAP32[$vararg_ptr68>>2] = $220;
       (_fprintf(($219|0),(5064|0),($vararg_buffer64|0))|0);
      }
      $221 = (($this) + 4|0);
      $222 = HEAP32[$221>>2]|0;
      $223 = ($222|0)==(0|0);
      if (!($223)) {
       $224 = HEAP32[$222>>2]|0;
       $225 = (($224) + 8|0);
       $226 = HEAP32[$225>>2]|0;
       FUNCTION_TABLE_vii[$226 & 255]($222,$213);
      }
     }
     $244 = (($this) + 104|0);
     HEAP32[$244>>2] = 0;
     HEAP32[$207>>2] = 0;
     $$pre$phi12Z2D = $143;$$pre$phiZ2D = $$pre;
    }
   } while(0);
   $245 = $$pre$phiZ2D;
   $246 = $245;
   HEAP32[$246>>2] = $96;
   $247 = (($245) + 4)|0;
   $248 = $247;
   HEAP32[$248>>2] = $97;
   HEAPF32[$$pre$phi12Z2D>>2] = $101;
   $249 = (($this) + 48|0);
   HEAPF64[$249>>3] = 0.0;
   HEAP8[$$pre$phi25Z2D>>0] = 1;
   $250 = (($this) + 57|0);
   ;HEAP8[$250+0>>0]=HEAP8[$$sroa$58+0>>0]|0;HEAP8[$250+1>>0]=HEAP8[$$sroa$58+1>>0]|0;HEAP8[$250+2>>0]=HEAP8[$$sroa$58+2>>0]|0;HEAP8[$250+3>>0]=HEAP8[$$sroa$58+3>>0]|0;HEAP8[$250+4>>0]=HEAP8[$$sroa$58+4>>0]|0;HEAP8[$250+5>>0]=HEAP8[$$sroa$58+5>>0]|0;HEAP8[$250+6>>0]=HEAP8[$$sroa$58+6>>0]|0;
   $251 = HEAP32[4856>>2]|0;
   $252 = (($251) + 22|0);
   $253 = HEAP8[$252>>0]|0;
   $254 = $253 & 1;
   $255 = ($254<<24>>24)==(0);
   if ($255) {
    $$pre$phi21Z2D = $$pre20;$$pre$phi23Z2D = $$pre22;
   } else {
    $256 = HEAP32[_stderr>>2]|0;
    $257 = $101;
    HEAP32[$vararg_buffer74>>2] = $251;
    $vararg_ptr77 = (($vararg_buffer74) + 4|0);
    HEAP32[$vararg_ptr77>>2] = 1;
    $vararg_ptr78 = (($vararg_buffer74) + 8|0);
    $258 = $vararg_ptr78;
    $259 = $258;
    HEAP32[$259>>2] = $96;
    $260 = (($258) + 4)|0;
    $261 = $260;
    HEAP32[$261>>2] = $97;
    $vararg_ptr79 = (($vararg_buffer74) + 16|0);
    HEAPF64[tempDoublePtr>>3]=$257;HEAP32[$vararg_ptr79>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr79+4>>2]=HEAP32[tempDoublePtr+4>>2];
    $vararg_ptr80 = (($vararg_buffer74) + 24|0);
    HEAP32[$vararg_ptr80>>2] = 1;
    (_fprintf(($256|0),(5392|0),($vararg_buffer74|0))|0);
    $$pre$phi21Z2D = $$pre20;$$pre$phi23Z2D = $$pre22;
   }
  }
 }
 $262 = $$pre$phi21Z2D;
 $263 = $262;
 HEAP32[$263>>2] = $21;
 $264 = (($262) + 4)|0;
 $265 = $264;
 HEAP32[$265>>2] = $24;
 $266 = (($this) + 80|0);
 HEAPF32[$266>>2] = 0.0;
 HEAPF64[$$pre$phi23Z2D>>3] = $value;
 HEAP8[$$pre$phi19Z2D>>0] = 1;
 $267 = (($this) + 97|0);
 ;HEAP8[$267+0>>0]=HEAP8[$sample$sroa$5+0>>0]|0;HEAP8[$267+1>>0]=HEAP8[$sample$sroa$5+1>>0]|0;HEAP8[$267+2>>0]=HEAP8[$sample$sroa$5+2>>0]|0;HEAP8[$267+3>>0]=HEAP8[$sample$sroa$5+3>>0]|0;HEAP8[$267+4>>0]=HEAP8[$sample$sroa$5+4>>0]|0;HEAP8[$267+5>>0]=HEAP8[$sample$sroa$5+5>>0]|0;HEAP8[$267+6>>0]=HEAP8[$sample$sroa$5+6>>0]|0;
 STACKTOP = sp;return;
}
function __ZN6fskube11Demodulator20addFrequencyHalfSeenEj($this,$frequency) {
 $this = $this|0;
 $frequency = $frequency|0;
 var $$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0.0, $19 = 0, $2 = 0, $20 = 0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_buffer11 = 0, $vararg_buffer16 = 0, $vararg_ptr10 = 0, $vararg_ptr14 = 0, $vararg_ptr15 = 0, $vararg_ptr19 = 0, $vararg_ptr20 = 0, $vararg_ptr7 = 0, $vararg_ptr8 = 0, $vararg_ptr9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $vararg_buffer16 = sp + 40|0;
 $vararg_buffer11 = sp + 24|0;
 $vararg_buffer = sp;
 $0 = (($this) + 104|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==(0);
 if ($2) {
  HEAP32[$0>>2] = $frequency;
  $3 = (($this) + 108|0);
  HEAP32[$3>>2] = 0;
  $12 = $frequency;
 } else {
  $12 = $1;
 }
 $4 = HEAP32[4856>>2]|0;
 $5 = (($4) + 23|0);
 $6 = HEAP8[$5>>0]|0;
 $7 = $6 & 1;
 $8 = ($7<<24>>24)==(0);
 if ($8) {
  $13 = $12;
 } else {
  $9 = HEAP32[_stderr>>2]|0;
  $10 = (($this) + 108|0);
  $11 = HEAP32[$10>>2]|0;
  HEAP32[$vararg_buffer>>2] = $4;
  $vararg_ptr7 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr7>>2] = 2;
  $vararg_ptr8 = (($vararg_buffer) + 8|0);
  HEAP32[$vararg_ptr8>>2] = $frequency;
  $vararg_ptr9 = (($vararg_buffer) + 12|0);
  HEAP32[$vararg_ptr9>>2] = $12;
  $vararg_ptr10 = (($vararg_buffer) + 16|0);
  HEAP32[$vararg_ptr10>>2] = $11;
  (_fprintf(($9|0),(5440|0),($vararg_buffer|0))|0);
  $$pre = HEAP32[$0>>2]|0;
  $13 = $$pre;
 }
 $14 = ($13|0)==($frequency|0);
 $15 = (($this) + 108|0);
 $16 = HEAP32[$15>>2]|0;
 if (!($14)) {
  $44 = ($16|0)==(0);
  if (!($44)) {
   $45 = (($this) + 16|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($13|0);
   $48 = HEAP32[4856>>2]|0;
   $49 = (($48) + 23|0);
   $50 = HEAP8[$49>>0]|0;
   $51 = $50 & 1;
   $52 = ($51<<24>>24)==(0);
   if (!($52)) {
    $53 = HEAP32[_stderr>>2]|0;
    $54 = $47&1;
    HEAP32[$vararg_buffer16>>2] = $48;
    $vararg_ptr19 = (($vararg_buffer16) + 4|0);
    HEAP32[$vararg_ptr19>>2] = 2;
    $vararg_ptr20 = (($vararg_buffer16) + 8|0);
    HEAP32[$vararg_ptr20>>2] = $54;
    (_fprintf(($53|0),(5064|0),($vararg_buffer16|0))|0);
   }
   $55 = (($this) + 4|0);
   $56 = HEAP32[$55>>2]|0;
   $57 = ($56|0)==(0|0);
   if (!($57)) {
    $58 = HEAP32[$56>>2]|0;
    $59 = (($58) + 8|0);
    $60 = HEAP32[$59>>2]|0;
    FUNCTION_TABLE_vii[$60 & 255]($56,$47);
   }
  }
  HEAP32[$0>>2] = $frequency;
  HEAP32[$15>>2] = 1;
  STACKTOP = sp;return;
 }
 $17 = (($16) + 1)|0;
 HEAP32[$15>>2] = $17;
 $18 = (+($frequency>>>0));
 $19 = (($this) + 12|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = (+($20>>>0));
 $22 = 1.0 / $21;
 $23 = $22 * $18;
 $24 = $23 * 2.0;
 $25 = (+_rint((+$24)));
 $26 = (~~(($25))>>>0);
 $27 = ($17>>>0)<($26>>>0);
 if ($27) {
  STACKTOP = sp;return;
 }
 $28 = (($this) + 16|0);
 $29 = HEAP32[$28>>2]|0;
 $30 = ($29|0)==($frequency|0);
 $31 = HEAP32[4856>>2]|0;
 $32 = (($31) + 23|0);
 $33 = HEAP8[$32>>0]|0;
 $34 = $33 & 1;
 $35 = ($34<<24>>24)==(0);
 if (!($35)) {
  $36 = HEAP32[_stderr>>2]|0;
  $37 = $30&1;
  HEAP32[$vararg_buffer11>>2] = $31;
  $vararg_ptr14 = (($vararg_buffer11) + 4|0);
  HEAP32[$vararg_ptr14>>2] = 2;
  $vararg_ptr15 = (($vararg_buffer11) + 8|0);
  HEAP32[$vararg_ptr15>>2] = $37;
  (_fprintf(($36|0),(5064|0),($vararg_buffer11|0))|0);
 }
 $38 = (($this) + 4|0);
 $39 = HEAP32[$38>>2]|0;
 $40 = ($39|0)==(0|0);
 if (!($40)) {
  $41 = HEAP32[$39>>2]|0;
  $42 = (($41) + 8|0);
  $43 = HEAP32[$42>>2]|0;
  FUNCTION_TABLE_vii[$43 & 255]($39,$30);
 }
 HEAP32[$15>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN6fskube9ModulatorD1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN6fskube9ModulatorD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZN6fskube11DemodulatorD1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN6fskube11DemodulatorD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __GLOBAL__I_a65() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_createLogHandle(4864)|0);
 HEAP32[4856>>2] = $0;
 STACKTOP = sp;return;
}
function __ZN6fskube16Rs232Synthesizer7receiveEi($this,$data) {
 $this = $this|0;
 $data = $data|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $storemerge = 0, $storemerge1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($data|0)<(0);
 $1 = (($this) + 4|0);
 if ($0) {
  $storemerge1 = 0;
  while(1) {
   $2 = ($storemerge1|0)<(24);
   if (!($2)) {
    break;
   }
   $3 = HEAP32[$1>>2]|0;
   $4 = ($3|0)==(0|0);
   if (!($4)) {
    $5 = HEAP32[$3>>2]|0;
    $6 = (($5) + 8|0);
    $7 = HEAP32[$6>>2]|0;
    FUNCTION_TABLE_vii[$7 & 255]($3,0);
   }
   $8 = (($storemerge1) + 1)|0;
   $storemerge1 = $8;
  }
  STACKTOP = sp;return;
 }
 $9 = HEAP32[$1>>2]|0;
 $10 = ($9|0)==(0|0);
 if ($10) {
  $storemerge = 0;
 } else {
  $11 = HEAP32[$9>>2]|0;
  $12 = (($11) + 8|0);
  $13 = HEAP32[$12>>2]|0;
  FUNCTION_TABLE_vii[$13 & 255]($9,1);
  $storemerge = 0;
 }
 while(1) {
  $14 = ($storemerge|0)<(8);
  $15 = HEAP32[$1>>2]|0;
  $16 = ($15|0)==(0|0);
  if (!($14)) {
   break;
  }
  if (!($16)) {
   $17 = 1 << $storemerge;
   $18 = $17 & $data;
   $19 = ($18|0)==(0);
   $20 = HEAP32[$15>>2]|0;
   $21 = (($20) + 8|0);
   $22 = HEAP32[$21>>2]|0;
   FUNCTION_TABLE_vii[$22 & 255]($15,$19);
  }
  $23 = (($storemerge) + 1)|0;
  $storemerge = $23;
 }
 if ($16) {
  STACKTOP = sp;return;
 }
 $24 = HEAP32[$15>>2]|0;
 $25 = (($24) + 8|0);
 $26 = HEAP32[$25>>2]|0;
 FUNCTION_TABLE_vii[$26 & 255]($15,0);
 STACKTOP = sp;return;
}
function __ZN6fskube16Rs232Interpreter5resetEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 8|0);
 HEAP8[$0>>0] = 1;
 $1 = (($this) + 12|0);
 HEAP32[$1>>2] = 0;
 $2 = (($this) + 16|0);
 HEAP8[$2>>0] = 0;
 STACKTOP = sp;return;
}
function __ZN6fskube16Rs232Interpreter7receiveEb($this,$b) {
 $this = $this|0;
 $b = $b|0;
 var $$phi$trans$insert = 0, $$pre = 0, $$pre$phi5Z2D = 0, $$pre2 = 0, $$pre4 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_ptr6 = 0, $vararg_ptr7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer = sp;
 $0 = $b&1;
 $1 = (($this) + 8|0);
 $2 = HEAP8[$1>>0]|0;
 $3 = $2 & 1;
 $4 = ($3<<24>>24)==(0);
 if (!($4)) {
  if ($b) {
   HEAP8[$1>>0] = 0;
   $5 = (($this) + 20|0);
   HEAP32[$5>>2] = 0;
   STACKTOP = sp;return;
  }
  $6 = (($this) + 12|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = (($7) + 1)|0;
  HEAP32[$6>>2] = $8;
  $9 = (($this) + 4|0);
  $10 = HEAP32[$9>>2]|0;
  $11 = ($10|0)==(0|0);
  if ($11) {
   STACKTOP = sp;return;
  }
  $12 = HEAP32[$10>>2]|0;
  $13 = (($12) + 8|0);
  $14 = HEAP32[$13>>2]|0;
  FUNCTION_TABLE_vii[$14 & 255]($10,-1);
  STACKTOP = sp;return;
 }
 $15 = (($this) + 20|0);
 $16 = HEAP32[$15>>2]|0;
 $17 = ($16|0)==(8);
 if ($17) {
  do {
   if ($b) {
    $27 = HEAP32[5576>>2]|0;
    $28 = (($27) + 22|0);
    $29 = HEAP8[$28>>0]|0;
    $30 = $29 & 1;
    $31 = ($30<<24>>24)==(0);
    if ($31) {
     $$pre4 = (($this) + 16|0);
     $$pre$phi5Z2D = $$pre4;
     break;
    } else {
     $32 = HEAP32[_stderr>>2]|0;
     $33 = (($this) + 16|0);
     $34 = HEAP8[$33>>0]|0;
     $35 = $34&255;
     HEAP32[$vararg_buffer>>2] = $27;
     $vararg_ptr6 = (($vararg_buffer) + 4|0);
     HEAP32[$vararg_ptr6>>2] = 1;
     $vararg_ptr7 = (($vararg_buffer) + 8|0);
     HEAP32[$vararg_ptr7>>2] = $35;
     (_fprintf(($32|0),(5640|0),($vararg_buffer|0))|0);
     $$pre$phi5Z2D = $33;
     break;
    }
   } else {
    $18 = (($this) + 16|0);
    $19 = (($this) + 4|0);
    $20 = HEAP32[$19>>2]|0;
    $21 = ($20|0)==(0|0);
    if ($21) {
     $$pre$phi5Z2D = $18;
    } else {
     $22 = HEAP8[$18>>0]|0;
     $23 = $22&255;
     $24 = HEAP32[$20>>2]|0;
     $25 = (($24) + 8|0);
     $26 = HEAP32[$25>>2]|0;
     FUNCTION_TABLE_vii[$26 & 255]($20,$23);
     $$pre$phi5Z2D = $18;
    }
   }
  } while(0);
  HEAP8[$1>>0] = 1;
  $36 = (($this) + 12|0);
  HEAP32[$36>>2] = 0;
  HEAP8[$$pre$phi5Z2D>>0] = 0;
  $$pre = HEAP32[$15>>2]|0;
  $39 = $$pre;$42 = 0;
 } else {
  $$phi$trans$insert = (($this) + 16|0);
  $$pre2 = HEAP8[$$phi$trans$insert>>0]|0;
  $39 = $16;$42 = $$pre2;
 }
 $37 = $0 ^ 1;
 $38 = $37 << $39;
 $40 = (($this) + 16|0);
 $41 = $42&255;
 $43 = $41 | $38;
 $44 = $43&255;
 HEAP8[$40>>0] = $44;
 $45 = (($39) + 1)|0;
 HEAP32[$15>>2] = $45;
 STACKTOP = sp;return;
}
function __ZN6fskube16Rs232SynthesizerD1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN6fskube16Rs232SynthesizerD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZN6fskube16Rs232InterpreterD1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN6fskube16Rs232InterpreterD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __GLOBAL__I_a81() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_createLogHandle(5584)|0);
 HEAP32[5576>>2] = $0;
 STACKTOP = sp;return;
}
function __ZN6fskube19StackmatSynthesizer7receiveENS_13StackmatStateE($this,$state) {
 $this = $this|0;
 $state = $state|0;
 var $$ph = 0, $$ph18 = 0, $$ph19 = 0, $$ph20 = 0, $$ph21 = 0, $$ph22 = 0, $$ph23 = 0, $$ph24 = 0, $$ph25 = 0, $$pr = 0, $$pre = 0, $$pre11 = 0, $$pre12 = 0, $$pre13 = 0, $$pre14 = 0, $$pre15 = 0, $$pre16 = 0, $$pre17 = 0, $0 = 0, $1 = 0;
 var $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0;
 var $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0;
 var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0;
 var $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0;
 var $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $checksum$0$ph = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==(0|0);
 if ($2) {
  $3 = (($state) + 8|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = (($4|0) / 60000)&-1;
  $6 = (($4|0) % 60000)&-1;
  $7 = (($5) + 64)|0;
  $$ph = $7;$$ph18 = $6;
  label = 4;
 } else {
  $8 = (($state) + 16|0);
  $9 = HEAP8[$8>>0]|0;
  $10 = $9&255;
  $11 = HEAP32[$1>>2]|0;
  $12 = (($11) + 8|0);
  $13 = HEAP32[$12>>2]|0;
  FUNCTION_TABLE_vii[$13 & 255]($1,$10);
  $$pre = HEAP32[$0>>2]|0;
  $14 = (($state) + 8|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = (($15|0) / 60000)&-1;
  $17 = (($15|0) % 60000)&-1;
  $18 = (($16) + 64)|0;
  $19 = ($$pre|0)==(0|0);
  if ($19) {
   $$ph = $18;$$ph18 = $17;
   label = 4;
  } else {
   $24 = (($16) + 48)|0;
   $25 = HEAP32[$$pre>>2]|0;
   $26 = (($25) + 8|0);
   $27 = HEAP32[$26>>2]|0;
   FUNCTION_TABLE_vii[$27 & 255]($$pre,$24);
   $$pre11 = HEAP32[$0>>2]|0;
   $28 = (($17|0) / 1000)&-1;
   $29 = (($17|0) % 1000)&-1;
   $30 = (($17|0) / 10000)&-1;
   $31 = (($18) + ($30))|0;
   $32 = ($$pre11|0)==(0|0);
   if ($32) {
    $$ph19 = $31;$$ph20 = $29;$$ph21 = $28;
    label = 6;
   } else {
    $35 = (($30) + 48)|0;
    $36 = HEAP32[$$pre11>>2]|0;
    $37 = (($36) + 8|0);
    $38 = HEAP32[$37>>2]|0;
    FUNCTION_TABLE_vii[$38 & 255]($$pre11,$35);
    $$pre12 = HEAP32[$0>>2]|0;
    $39 = (($28|0) % 10)&-1;
    $40 = (($31) + ($39))|0;
    $41 = ($$pre12|0)==(0|0);
    if ($41) {
     $$ph22 = $40;$$ph23 = $29;
     label = 8;
    } else {
     $45 = (($39) + 48)|0;
     $46 = HEAP32[$$pre12>>2]|0;
     $47 = (($46) + 8|0);
     $48 = HEAP32[$47>>2]|0;
     FUNCTION_TABLE_vii[$48 & 255]($$pre12,$45);
     $$pre13 = HEAP32[$0>>2]|0;
     $49 = (($29|0) / 100)&-1;
     $50 = (($29|0) % 100)&-1;
     $51 = (($40) + ($49))|0;
     $52 = ($$pre13|0)==(0|0);
     if ($52) {
      $$ph24 = $51;$$ph25 = $50;
      label = 10;
     } else {
      $56 = (($49) + 48)|0;
      $57 = HEAP32[$$pre13>>2]|0;
      $58 = (($57) + 8|0);
      $59 = HEAP32[$58>>2]|0;
      FUNCTION_TABLE_vii[$59 & 255]($$pre13,$56);
      $$pre14 = HEAP32[$0>>2]|0;
      $60 = (($50|0) / 10)&-1;
      $61 = (($50|0) % 10)&-1;
      $62 = (($51) + ($60))|0;
      $63 = ($$pre14|0)==(0|0);
      if ($63) {
       $72 = $61;$73 = $62;
      } else {
       $64 = (($60) + 48)|0;
       $65 = HEAP32[$$pre14>>2]|0;
       $66 = (($65) + 8|0);
       $67 = HEAP32[$66>>2]|0;
       FUNCTION_TABLE_vii[$67 & 255]($$pre14,$64);
       $72 = $61;$73 = $62;
      }
     }
    }
   }
  }
 }
 if ((label|0) == 4) {
  $20 = (($$ph18|0) / 1000)&-1;
  $21 = (($$ph18|0) % 1000)&-1;
  $22 = (($$ph18|0) / 10000)&-1;
  $23 = (($$ph) + ($22))|0;
  $$ph19 = $23;$$ph20 = $21;$$ph21 = $20;
  label = 6;
 }
 if ((label|0) == 6) {
  $33 = (($$ph21|0) % 10)&-1;
  $34 = (($$ph19) + ($33))|0;
  $$ph22 = $34;$$ph23 = $$ph20;
  label = 8;
 }
 if ((label|0) == 8) {
  $42 = (($$ph23|0) / 100)&-1;
  $43 = (($$ph23|0) % 100)&-1;
  $44 = (($$ph22) + ($42))|0;
  $$ph24 = $44;$$ph25 = $43;
  label = 10;
 }
 if ((label|0) == 10) {
  $53 = (($$ph25|0) / 10)&-1;
  $54 = (($$ph25|0) % 10)&-1;
  $55 = (($$ph24) + ($53))|0;
  $72 = $54;$73 = $55;
 }
 $68 = (($state) + 12|0);
 $69 = HEAP32[$68>>2]|0;
 $70 = ($69|0)==(3);
 do {
  if ($70) {
   $71 = (($73) + ($72))|0;
   $74 = HEAP32[$0>>2]|0;
   $75 = ($74|0)==(0|0);
   if ($75) {
    STACKTOP = sp;return;
   } else {
    $76 = (($72) + 48)|0;
    $77 = HEAP32[$74>>2]|0;
    $78 = (($77) + 8|0);
    $79 = HEAP32[$78>>2]|0;
    FUNCTION_TABLE_vii[$79 & 255]($74,$76);
    $checksum$0$ph = $71;
    break;
   }
  } else {
   $checksum$0$ph = $73;
  }
 } while(0);
 $$pr = HEAP32[$0>>2]|0;
 $80 = ($$pr|0)==(0|0);
 if ($80) {
  STACKTOP = sp;return;
 }
 $81 = HEAP32[$$pr>>2]|0;
 $82 = (($81) + 8|0);
 $83 = HEAP32[$82>>2]|0;
 FUNCTION_TABLE_vii[$83 & 255]($$pr,$checksum$0$ph);
 $$pre15 = HEAP32[$0>>2]|0;
 $84 = ($$pre15|0)==(0|0);
 if ($84) {
  STACKTOP = sp;return;
 }
 $85 = HEAP32[$$pre15>>2]|0;
 $86 = (($85) + 8|0);
 $87 = HEAP32[$86>>2]|0;
 FUNCTION_TABLE_vii[$87 & 255]($$pre15,10);
 $$pre16 = HEAP32[$0>>2]|0;
 $88 = ($$pre16|0)==(0|0);
 if ($88) {
  STACKTOP = sp;return;
 }
 $89 = HEAP32[$$pre16>>2]|0;
 $90 = (($89) + 8|0);
 $91 = HEAP32[$90>>2]|0;
 FUNCTION_TABLE_vii[$91 & 255]($$pre16,13);
 $$pre17 = HEAP32[$0>>2]|0;
 $92 = ($$pre17|0)==(0|0);
 if ($92) {
  STACKTOP = sp;return;
 }
 $93 = HEAP32[$$pre17>>2]|0;
 $94 = (($93) + 8|0);
 $95 = HEAP32[$94>>2]|0;
 FUNCTION_TABLE_vii[$95 & 255]($$pre17,-1);
 STACKTOP = sp;return;
}
function __ZN6fskube19StackmatInterpreter5resetEv($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 48|0);
 HEAP32[$0>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN6fskube19StackmatInterpreter7receiveEi($this,$byte) {
 $this = $this|0;
 $byte = $byte|0;
 var $$ = 0, $$byval_copy = 0, $$off = 0, $$sroa$59 = 0, $$sroa$913 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0;
 var $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
 var $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $i$0 = 0, $state$sroa$5 = 0, $state$sroa$9 = 0, $storemerge = 0;
 var $switch = 0, $vararg_buffer = 0, $vararg_buffer18 = 0, $vararg_buffer23 = 0, $vararg_ptr16 = 0, $vararg_ptr17 = 0, $vararg_ptr21 = 0, $vararg_ptr22 = 0, $vararg_ptr26 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $$byval_copy = sp + 60|0;
 $vararg_buffer23 = sp + 32|0;
 $vararg_buffer18 = sp + 16|0;
 $vararg_buffer = sp;
 $0 = sp + 40|0;
 $$sroa$59 = sp + 89|0;
 $$sroa$913 = sp + 86|0;
 $state$sroa$5 = sp + 83|0;
 $state$sroa$9 = sp + 80|0;
 $1 = HEAP32[5784>>2]|0;
 $2 = (($1) + 23|0);
 $3 = HEAP8[$2>>0]|0;
 $4 = $3 & 1;
 $5 = ($4<<24>>24)==(0);
 if (!($5)) {
  $6 = HEAP32[_stderr>>2]|0;
  HEAP32[$vararg_buffer>>2] = $1;
  $vararg_ptr16 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr16>>2] = 2;
  $vararg_ptr17 = (($vararg_buffer) + 8|0);
  HEAP32[$vararg_ptr17>>2] = $byte;
  (_fprintf(($6|0),(5856|0),($vararg_buffer|0))|0);
 }
 $7 = ($byte|0)<(0);
 $8 = (($this) + 48|0);
 $9 = HEAP32[$8>>2]|0;
 if (!($7)) {
  $82 = ($9|0)>(9);
  if (!($82)) {
   $89 = (($9) + 1)|0;
   HEAP32[$8>>2] = $89;
   $90 = ((($this) + ($9<<2)|0) + 8|0);
   HEAP32[$90>>2] = $byte;
   STACKTOP = sp;return;
  }
  $83 = HEAP32[5784>>2]|0;
  $84 = (($83) + 22|0);
  $85 = HEAP8[$84>>0]|0;
  $86 = $85 & 1;
  $87 = ($86<<24>>24)==(0);
  if (!($87)) {
   $88 = HEAP32[_stderr>>2]|0;
   HEAP32[$vararg_buffer23>>2] = $83;
   $vararg_ptr26 = (($vararg_buffer23) + 4|0);
   HEAP32[$vararg_ptr26>>2] = 1;
   (_fprintf(($88|0),(5952|0),($vararg_buffer23|0))|0);
  }
  HEAP32[$8>>2] = 0;
  STACKTOP = sp;return;
 }
 $$off = (($9) + -9)|0;
 $switch = ($$off>>>0)<(2);
 if (!($switch)) {
  $76 = HEAP32[5784>>2]|0;
  $77 = (($76) + 22|0);
  $78 = HEAP8[$77>>0]|0;
  $79 = $78 & 1;
  $80 = ($79<<24>>24)==(0);
  if ($80) {
   STACKTOP = sp;return;
  }
  $81 = HEAP32[_stderr>>2]|0;
  HEAP32[$vararg_buffer18>>2] = $76;
  $vararg_ptr21 = (($vararg_buffer18) + 4|0);
  HEAP32[$vararg_ptr21>>2] = 1;
  $vararg_ptr22 = (($vararg_buffer18) + 8|0);
  HEAP32[$vararg_ptr22>>2] = $9;
  (_fprintf(($81|0),(5904|0),($vararg_buffer18|0))|0);
  STACKTOP = sp;return;
 }
 $10 = ($9|0)==(9);
 $$ = $10 ? 2 : 3;
 $11 = (($this) + 8|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = $12&255;
 $14 = (($this) + 12|0);
 $15 = HEAP32[$14>>2]|0;
 $16 = (($this) + 16|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = (($17) + -48)|0;
 $19 = (($this) + 20|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = (($20) + -48)|0;
 $22 = (($this) + 24|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = (($23) + -48)|0;
 $25 = (($this) + 28|0);
 $26 = HEAP32[$25>>2]|0;
 $27 = (($26) + -48)|0;
 $28 = ($$|0)==(3);
 if ($28) {
  $29 = (($this) + 32|0);
  $30 = HEAP32[$29>>2]|0;
  $31 = (($30) + -48)|0;
  $i$0 = 7;$storemerge = $31;
 } else {
  $i$0 = 6;$storemerge = 0;
 }
 $32 = (($i$0) + 1)|0;
 $33 = ((($this) + ($i$0<<2)|0) + 8|0);
 $34 = HEAP32[$33>>2]|0;
 $35 = (($i$0) + 2)|0;
 $36 = ((($this) + ($32<<2)|0) + 8|0);
 $37 = HEAP32[$36>>2]|0;
 $38 = ((($this) + ($35<<2)|0) + 8|0);
 $39 = HEAP32[$38>>2]|0;
 HEAP32[$8>>2] = 0;
 ;HEAP8[$$sroa$59+0>>0]=HEAP8[$state$sroa$5+0>>0]|0;HEAP8[$$sroa$59+1>>0]=HEAP8[$state$sroa$5+1>>0]|0;HEAP8[$$sroa$59+2>>0]=HEAP8[$state$sroa$5+2>>0]|0;
 ;HEAP8[$$sroa$913+0>>0]=HEAP8[$state$sroa$9+0>>0]|0;HEAP8[$$sroa$913+1>>0]=HEAP8[$state$sroa$9+1>>0]|0;HEAP8[$$sroa$913+2>>0]=HEAP8[$state$sroa$9+2>>0]|0;
 $40 = (($this) + 4|0);
 $41 = HEAP32[$40>>2]|0;
 $42 = ($41|0)==(0|0);
 if ($42) {
  STACKTOP = sp;return;
 }
 $43 = (($15) + 16)|0;
 $44 = ($18*10)|0;
 $45 = (($43) + ($18))|0;
 $46 = (($44) + ($21))|0;
 $47 = ($15*60000)|0;
 $48 = (($45) + ($21))|0;
 $49 = ($46*1000)|0;
 $50 = (($47) + -2880000)|0;
 $51 = (($48) + ($24))|0;
 $52 = ($24*100)|0;
 $53 = (($50) + ($49))|0;
 $54 = (($51) + ($27))|0;
 $55 = ($27*10)|0;
 $56 = (($53) + ($52))|0;
 $57 = (($54) + ($storemerge))|0;
 $58 = (($56) + ($55))|0;
 $59 = $57&255;
 $60 = (($58) + ($storemerge))|0;
 $61 = $39&255;
 $62 = $37&255;
 $63 = $34&255;
 $64 = HEAP32[$41>>2]|0;
 $65 = (($64) + 8|0);
 $66 = HEAP32[$65>>2]|0;
 HEAP8[$0>>0] = 1;
 $67 = (($0) + 1|0);
 HEAP8[$67>>0] = $63;
 $68 = (($0) + 2|0);
 HEAP8[$68>>0] = $59;
 $69 = (($0) + 3|0);
 HEAP8[$69>>0] = $62;
 $70 = (($0) + 4|0);
 HEAP8[$70>>0] = $61;
 $71 = (($0) + 5|0);
 ;HEAP8[$71+0>>0]=HEAP8[$$sroa$59+0>>0]|0;HEAP8[$71+1>>0]=HEAP8[$$sroa$59+1>>0]|0;HEAP8[$71+2>>0]=HEAP8[$$sroa$59+2>>0]|0;
 $72 = (($0) + 8|0);
 HEAP32[$72>>2] = $60;
 $73 = (($0) + 12|0);
 HEAP32[$73>>2] = $$;
 $74 = (($0) + 16|0);
 HEAP8[$74>>0] = $13;
 $75 = (($0) + 17|0);
 ;HEAP8[$75+0>>0]=HEAP8[$$sroa$913+0>>0]|0;HEAP8[$75+1>>0]=HEAP8[$$sroa$913+1>>0]|0;HEAP8[$75+2>>0]=HEAP8[$$sroa$913+2>>0]|0;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$0+0>>2]|0;HEAP32[$$byval_copy+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[$$byval_copy+8>>2]=HEAP32[$0+8>>2]|0;HEAP32[$$byval_copy+12>>2]=HEAP32[$0+12>>2]|0;HEAP32[$$byval_copy+16>>2]=HEAP32[$0+16>>2]|0;
 FUNCTION_TABLE_vii[$66 & 255]($41,$$byval_copy);
 STACKTOP = sp;return;
}
function __ZN6fskube19StackmatSynthesizerD1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN6fskube19StackmatSynthesizerD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZN6fskube19StackmatInterpreterD1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN6fskube19StackmatInterpreterD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __GLOBAL__I_a101() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_createLogHandle(5792)|0);
 HEAP32[5784>>2] = $0;
 STACKTOP = sp;return;
}
function __Z13readLogLevelsP9LogHandle($lh) {
 $lh = $lh|0;
 var $$027$i = 0, $$08$i = 0, $$08$i5 = 0, $$08$in$i = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $l$06$i = 0, $notlhs$i = 0, $notrhs$i = 0, $or$cond = 0, $or$cond$i = 0, $or$cond$not$i = 0;
 var $or$cond3$i = 0, $or$cond4$i = 0, $phitmp = 0, $r$0$lcssa$i = 0, $r$07$i = 0, $storemerge = 0, $storemerge1 = 0, $storemerge2 = 0, $storemerge3 = 0, $storemerge3$in = 0, $storemerge4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $storemerge = 0;
 while(1) {
  $0 = ($storemerge|0)<(5);
  if (!($0)) {
   break;
  }
  $1 = ((($lh) + ($storemerge)|0) + 21|0);
  HEAP8[$1>>0] = 0;
  $2 = (($storemerge) + 1)|0;
  $storemerge = $2;
 }
 $3 = (($lh) + 21|0);
 HEAP8[$3>>0] = 1;
 $4 = (_getenv((12944|0))|0);
 $5 = ($4|0)==(0|0);
 if ($5) {
  STACKTOP = sp;return;
 }
 $6 = (_strlen(($4|0))|0);
 $7 = (_llvm_stacksave()|0);
 $8 = STACKTOP; STACKTOP = STACKTOP + ((((1*$6)|0)+15)&-16)|0;
 (_strcpy(($8|0),($4|0))|0);
 $9 = (_strlen(($lh|0))|0);
 $10 = (_strtok($8,6088)|0);
 $11 = ($9|0)==(0);
 $storemerge1 = $10;
 while(1) {
  $12 = ($storemerge1|0)==(0|0);
  if ($12) {
   break;
  }
  $13 = HEAP8[$storemerge1>>0]|0;
  $14 = ($13<<24>>24)==(42);
  L11: do {
   if ($14) {
    $$027$i = $storemerge1;$$08$i = 6096;
    while(1) {
     $15 = (($$027$i) + 1|0);
     $16 = (($$08$i) + 1|0);
     $17 = HEAP8[$15>>0]|0;
     $18 = HEAP8[$16>>0]|0;
     $19 = ($17<<24>>24)!=($18<<24>>24);
     $20 = ($17<<24>>24)==(0);
     $or$cond$i = $19 | $20;
     $21 = ($18<<24>>24)==(0);
     $or$cond3$i = $or$cond$i | $21;
     if ($or$cond3$i) {
      break;
     } else {
      $$027$i = $15;$$08$i = $16;
     }
    }
    $22 = ($17<<24>>24)==($18<<24>>24);
    if ($22) {
     $storemerge2 = 0;
     while(1) {
      $23 = ($storemerge2|0)<(5);
      if (!($23)) {
       break L11;
      }
      $24 = ((($lh) + ($storemerge2)|0) + 21|0);
      HEAP8[$24>>0] = 1;
      $25 = (($storemerge2) + 1)|0;
      $storemerge2 = $25;
     }
    } else {
     label = 12;
    }
   } else {
    label = 12;
   }
  } while(0);
  L18: do {
   if ((label|0) == 12) {
    label = 0;
    if (!($11)) {
     $26 = ($13<<24>>24)==(0);
     L22: do {
      if ($26) {
       $35 = 0;$r$0$lcssa$i = $lh;
      } else {
       $$08$in$i = $9;$28 = $13;$l$06$i = $storemerge1;$r$07$i = $lh;
       while(1) {
        $$08$i5 = (($$08$in$i) + -1)|0;
        $27 = HEAP8[$r$07$i>>0]|0;
        $notlhs$i = ($27<<24>>24)!=(0);
        $notrhs$i = ($$08$i5|0)!=(0);
        $or$cond$not$i = $notrhs$i & $notlhs$i;
        $29 = ($28<<24>>24)==($27<<24>>24);
        $or$cond4$i = $or$cond$not$i & $29;
        if (!($or$cond4$i)) {
         $35 = $28;$r$0$lcssa$i = $r$07$i;
         break L22;
        }
        $30 = (($l$06$i) + 1|0);
        $31 = (($r$07$i) + 1|0);
        $32 = HEAP8[$30>>0]|0;
        $33 = ($32<<24>>24)==(0);
        if ($33) {
         $35 = 0;$r$0$lcssa$i = $31;
         break;
        } else {
         $$08$in$i = $$08$i5;$28 = $32;$l$06$i = $30;$r$07$i = $31;
        }
       }
      }
     } while(0);
     $34 = HEAP8[$r$0$lcssa$i>>0]|0;
     $phitmp = ($35<<24>>24)==($34<<24>>24);
     if (!($phitmp)) {
      break;
     }
    }
    $36 = (($storemerge1) + ($9)|0);
    $37 = HEAP8[$36>>0]|0;
    $38 = ($37<<24>>24)==(47);
    if ($38) {
     $storemerge3$in = $9;
     L28: while(1) {
      $storemerge3 = (($storemerge3$in) + 1)|0;
      $39 = (($storemerge1) + ($storemerge3)|0);
      $40 = HEAP8[$39>>0]|0;
      if ((($40<<24>>24) == 0)) {
       break L18;
      } else if ((($40<<24>>24) == 42)) {
       $storemerge4 = 0;
       while(1) {
        $41 = ($storemerge4|0)<(5);
        if (!($41)) {
         $storemerge3$in = $storemerge3;
         continue L28;
        }
        $42 = ((($lh) + ($storemerge4)|0) + 21|0);
        HEAP8[$42>>0] = 1;
        $43 = (($storemerge4) + 1)|0;
        $storemerge4 = $43;
       }
      } else {
       $44 = $40 << 24 >> 24;
       $45 = (($44) + -48)|0;
       $46 = ($45|0)>(-1);
       $47 = ($45|0)<(5);
       $or$cond = $46 & $47;
       if (!($or$cond)) {
        $storemerge3$in = $storemerge3;
        continue;
       }
       $48 = ((($lh) + ($45)|0) + 21|0);
       HEAP8[$48>>0] = 1;
       $storemerge3$in = $storemerge3;
       continue;
      }
     }
    }
   }
  } while(0);
  $49 = (_strtok(0,6088)|0);
  $storemerge1 = $49;
 }
 _llvm_stackrestore(($7|0));
 STACKTOP = sp;return;
}
function _createLogHandle($logHandleName) {
 $logHandleName = $logHandleName|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[6104>>2]|0;
 $1 = ($0>>>0)>(127);
 if ($1) {
  ___assert_fail((9440|0),(9448|0),64,(9464|0));
  // unreachable;
 }
 $2 = (_strlen(($logHandleName|0))|0);
 $3 = ($2>>>0)>(20);
 if ($3) {
  ___assert_fail((9440|0),(9448|0),68,(9464|0));
  // unreachable;
 } else {
  $4 = (($0) + 1)|0;
  HEAP32[6104>>2] = $4;
  $5 = (6112 + (($0*26)|0)|0);
  (_strcpy(($5|0),($logHandleName|0))|0);
  __Z13readLogLevelsP9LogHandle($5);
  STACKTOP = sp;return ($5|0);
 }
 return 0|0;
}
function _getLogLevels() {
 var $$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $name$0 = 0, $ptr$0 = 0, $ptr$1 = 0, $ptr$2 = 0, $ptr$3 = 0, $ptr$4 = 0, $storemerge = 0, $storemerge1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $$pre = HEAP32[6104>>2]|0;
 $ptr$0 = 9480;$storemerge = 0;
 while(1) {
  $0 = ($storemerge>>>0)<($$pre>>>0);
  if (!($0)) {
   break;
  }
  $1 = ($storemerge|0)==(0);
  if ($1) {
   $ptr$1 = $ptr$0;
  } else {
   $2 = (($ptr$0) + 1|0);
   HEAP8[$ptr$0>>0] = 44;
   $ptr$1 = $2;
  }
  $3 = (6112 + (($storemerge*26)|0)|0);
  $name$0 = $3;$ptr$2 = $ptr$1;
  while(1) {
   $4 = HEAP8[$name$0>>0]|0;
   $5 = ($4<<24>>24)==(0);
   if ($5) {
    break;
   }
   $6 = (($name$0) + 1|0);
   $7 = (($ptr$2) + 1|0);
   HEAP8[$ptr$2>>0] = $4;
   $name$0 = $6;$ptr$2 = $7;
  }
  $8 = (($ptr$2) + 1|0);
  HEAP8[$ptr$2>>0] = 47;
  $ptr$3 = $8;$storemerge1 = 0;
  while(1) {
   $9 = ($storemerge1|0)<(5);
   if (!($9)) {
    break;
   }
   $10 = (((6112 + (($storemerge*26)|0)|0) + ($storemerge1)|0) + 21|0);
   $11 = HEAP8[$10>>0]|0;
   $12 = $11 & 1;
   $13 = ($12<<24>>24)==(0);
   if ($13) {
    $ptr$4 = $ptr$3;
   } else {
    $14 = (($storemerge1) + 48)|0;
    $15 = $14&255;
    $16 = (($ptr$3) + 1|0);
    HEAP8[$ptr$3>>0] = $15;
    $ptr$4 = $16;
   }
   $17 = (($storemerge1) + 1)|0;
   $ptr$3 = $ptr$4;$storemerge1 = $17;
  }
  $18 = (($storemerge) + 1)|0;
  $ptr$0 = $ptr$3;$storemerge = $18;
 }
 HEAP8[$ptr$0>>0] = 0;
 STACKTOP = sp;return (9480|0);
}
function _setLogLevels($logLevels) {
 $logLevels = $logLevels|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $storemerge$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 (_setenv((12944|0),($logLevels|0),1)|0);
 $storemerge$i = 0;
 while(1) {
  $0 = HEAP32[6104>>2]|0;
  $1 = ($storemerge$i>>>0)<($0>>>0);
  if (!($1)) {
   break;
  }
  $2 = (6112 + (($storemerge$i*26)|0)|0);
  __Z13readLogLevelsP9LogHandle($2);
  $3 = (($storemerge$i) + 1)|0;
  $storemerge$i = $3;
 }
 STACKTOP = sp;return;
}
function __ZN6fskube9DigitizerD1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN21StackmatStateReceiverD1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _fskube_initialize($sampleRate) {
 $sampleRate = $sampleRate|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[((12976 + 8|0))>>2] = $sampleRate;
 HEAP32[((12976 + 12|0))>>2] = 1220;
 HEAP32[((12976 + 16|0))>>2] = 1200;
 HEAP32[((12976 + 20|0))>>2] = 2200;
 HEAP32[((13176 + 8|0))>>2] = $sampleRate;
 HEAP32[((13176 + 12|0))>>2] = 1220;
 HEAP32[((12976 + 4|0))>>2] = 13096;
 HEAP32[((13096 + 4|0))>>2] = 13120;
 HEAP32[((13120 + 4|0))>>2] = 13280;
 HEAP32[((13176 + 4|0))>>2] = 13200;
 HEAP32[((13200 + 4|0))>>2] = 13224;
 HEAP32[((13224 + 4|0))>>2] = 13280;
 $0 = $sampleRate >>> 1;
 HEAP32[13312>>2] = $0;
 HEAP8[13320>>0] = 1;
 STACKTOP = sp;return;
}
function _fskube_addSample($sample) {
 $sample = +$sample;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $vararg_buffer = sp;
 $0 = sp + 12|0;
 $1 = HEAP8[13320>>0]|0;
 $2 = ($1<<24>>24)==(0);
 if ($2) {
  ___assert_fail((13328|0),(13344|0),77,(13360|0));
  // unreachable;
 }
 HEAP8[((13280 + 4|0))>>0] = 0;
 __ZN6fskube11Demodulator7receiveEd(12976,$sample);
 $3 = HEAP8[((13280 + 4|0))>>0]|0;
 $4 = $3 & 1;
 $5 = ($4<<24>>24)==(0);
 if (!($5)) {
  HEAP32[13384>>2] = 0;
  $$0 = 1;
  STACKTOP = sp;return ($$0|0);
 }
 $6 = HEAP32[13384>>2]|0;
 $7 = (($6) + 1)|0;
 HEAP32[13384>>2] = $7;
 $8 = HEAP32[13312>>2]|0;
 $9 = ($7|0)==($8|0);
 if (!($9)) {
  $$0 = 0;
  STACKTOP = sp;return ($$0|0);
 }
 $10 = HEAP32[12960>>2]|0;
 $11 = (($10) + 22|0);
 $12 = HEAP8[$11>>0]|0;
 $13 = $12 & 1;
 $14 = ($13<<24>>24)==(0);
 if (!($14)) {
  $15 = HEAP32[_stderr>>2]|0;
  HEAP32[$vararg_buffer>>2] = $10;
  $vararg_ptr1 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr1>>2] = 1;
  $vararg_ptr2 = (($vararg_buffer) + 8|0);
  HEAP32[$vararg_ptr2>>2] = $7;
  (_fprintf(($15|0),(13392|0),($vararg_buffer|0))|0);
 }
 ;HEAP32[$0+0>>2]=0|0;HEAP32[$0+4>>2]=0|0;HEAP32[$0+8>>2]=0|0;HEAP32[$0+12>>2]=0|0;HEAP32[$0+16>>2]=0|0;
 ;HEAP32[((13280 + 8|0))+0>>2]=HEAP32[$0+0>>2]|0;HEAP32[((13280 + 8|0))+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[((13280 + 8|0))+8>>2]=HEAP32[$0+8>>2]|0;HEAP32[((13280 + 8|0))+12>>2]=HEAP32[$0+12>>2]|0;HEAP32[((13280 + 8|0))+16>>2]=HEAP32[$0+16>>2]|0;
 $$0 = 1;
 STACKTOP = sp;return ($$0|0);
}
function _fskube_getState($agg$result) {
 $agg$result = $agg$result|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP8[13320>>0]|0;
 $1 = ($0<<24>>24)==(0);
 if ($1) {
  ___assert_fail((13328|0),(13344|0),96,(13472|0));
  // unreachable;
 } else {
  ;HEAP32[$agg$result+0>>2]=HEAP32[((13280 + 8|0))+0>>2]|0;HEAP32[$agg$result+4>>2]=HEAP32[((13280 + 8|0))+4>>2]|0;HEAP32[$agg$result+8>>2]=HEAP32[((13280 + 8|0))+8>>2]|0;HEAP32[$agg$result+12>>2]=HEAP32[((13280 + 8|0))+12>>2]|0;HEAP32[$agg$result+16>>2]=HEAP32[((13280 + 8|0))+16>>2]|0;
  STACKTOP = sp;return;
 }
}
function __ZN21StackmatStateReceiverD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZN21StackmatStateReceiver7receiveEN6fskube13StackmatStateE($this,$state) {
 $this = $this|0;
 $state = $state|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 4|0);
 HEAP8[$0>>0] = 1;
 $1 = (($this) + 8|0);
 ;HEAP32[$1+0>>2]=HEAP32[$state+0>>2]|0;HEAP32[$1+4>>2]=HEAP32[$state+4>>2]|0;HEAP32[$1+8>>2]=HEAP32[$state+8>>2]|0;HEAP32[$1+12>>2]=HEAP32[$state+12>>2]|0;HEAP32[$1+16>>2]=HEAP32[$state+16>>2]|0;
 STACKTOP = sp;return;
}
function __GLOBAL__I_a125() {
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_createLogHandle(12968)|0);
 HEAP32[12960>>2] = $0;
 HEAP32[((12976 + 4|0))>>2] = 0;
 HEAP32[12976>>2] = ((4896 + 8|0));
 $1 = ((12976 + 24|0));
 $2 = $1;
 HEAP32[$2>>2] = 0;
 $3 = (($1) + 4)|0;
 $4 = $3;
 HEAP32[$4>>2] = 0;
 HEAP32[((13096 + 4|0))>>2] = 0;
 HEAP32[13096>>2] = ((5616 + 8|0));
 HEAP8[((13096 + 8|0))>>0] = 1;
 HEAP32[((13096 + 12|0))>>2] = 0;
 HEAP8[((13096 + 16|0))>>0] = 0;
 HEAP32[((13120 + 4|0))>>2] = 0;
 HEAP32[13120>>2] = ((5832 + 8|0));
 HEAP32[((13120 + 48|0))>>2] = 0;
 HEAP32[((13176 + 4|0))>>2] = 0;
 HEAP32[13176>>2] = ((13576 + 8|0));
 HEAP32[((13200 + 4|0))>>2] = 0;
 HEAP32[13200>>2] = ((5616 + 8|0));
 HEAP8[((13200 + 8|0))>>0] = 1;
 HEAP32[((13200 + 12|0))>>2] = 0;
 HEAP8[((13200 + 16|0))>>0] = 0;
 HEAP32[((13224 + 4|0))>>2] = 0;
 HEAP32[13224>>2] = ((5832 + 8|0));
 HEAP32[((13224 + 48|0))>>2] = 0;
 HEAP32[13280>>2] = ((13488 + 8|0));
 HEAP8[((13280 + 4|0))>>0] = 0;
 STACKTOP = sp;return;
}
function __ZN6fskube9Digitizer19maybeSendCurrentBitEv($this) {
 $this = $this|0;
 var $$pre = 0, $$pre$phiZ2D = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer = sp;
 $0 = (($this) + 20|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = (($this) + 8|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($this) + 12|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = (($3>>>0) / ($5>>>0))&-1;
 $7 = (($6|0) / 2)&-1;
 $8 = ($1>>>0)<($7>>>0);
 if ($8) {
  HEAP32[$0>>2] = 0;
  STACKTOP = sp;return;
 }
 $9 = HEAP32[13552>>2]|0;
 $10 = (($9) + 23|0);
 $11 = HEAP8[$10>>0]|0;
 $12 = $11 & 1;
 $13 = ($12<<24>>24)==(0);
 if ($13) {
  $$pre = (($this) + 16|0);
  $$pre$phiZ2D = $$pre;
 } else {
  $14 = HEAP32[_stderr>>2]|0;
  $15 = (($this) + 16|0);
  $16 = HEAP8[$15>>0]|0;
  $17 = $16 & 1;
  $18 = $17&255;
  HEAP32[$vararg_buffer>>2] = $9;
  $vararg_ptr1 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr1>>2] = 2;
  $vararg_ptr2 = (($vararg_buffer) + 8|0);
  HEAP32[$vararg_ptr2>>2] = $1;
  $vararg_ptr3 = (($vararg_buffer) + 12|0);
  HEAP32[$vararg_ptr3>>2] = $18;
  (_fprintf(($14|0),(13600|0),($vararg_buffer|0))|0);
  $$pre$phiZ2D = $15;
 }
 $19 = (($this) + 4|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = ($20|0)==(0|0);
 if ($21) {
  HEAP32[$0>>2] = 0;
  STACKTOP = sp;return;
 }
 $22 = HEAP8[$$pre$phiZ2D>>0]|0;
 $23 = $22 & 1;
 $24 = HEAP32[$20>>2]|0;
 $25 = (($24) + 8|0);
 $26 = HEAP32[$25>>2]|0;
 $27 = ($23<<24>>24)!=(0);
 FUNCTION_TABLE_vii[$26 & 255]($20,$27);
 HEAP32[$0>>2] = 0;
 STACKTOP = sp;return;
}
function __ZN6fskube9Digitizer7receiveEd($this,$sample) {
 $this = $this|0;
 $sample = +$sample;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $vararg_buffer = sp;
 $0 = HEAP32[13552>>2]|0;
 $1 = (($0) + 25|0);
 $2 = HEAP8[$1>>0]|0;
 $3 = $2 & 1;
 $4 = ($3<<24>>24)==(0);
 if (!($4)) {
  $5 = HEAP32[_stderr>>2]|0;
  HEAP32[$vararg_buffer>>2] = $0;
  $vararg_ptr1 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr1>>2] = 4;
  $vararg_ptr2 = (($vararg_buffer) + 8|0);
  HEAPF64[tempDoublePtr>>3]=$sample;HEAP32[$vararg_ptr2>>2]=HEAP32[tempDoublePtr>>2];HEAP32[$vararg_ptr2+4>>2]=HEAP32[tempDoublePtr+4>>2];
  (_fprintf(($5|0),(13640|0),($vararg_buffer|0))|0);
 }
 $6 = (($this) + 16|0);
 $7 = HEAP8[$6>>0]|0;
 $8 = $7 & 1;
 $9 = ($8<<24>>24)==(0);
 if ($9) {
  $10 = !($sample >= 0.599999999999999977796);
  if (!($10)) {
   __ZN6fskube9Digitizer19maybeSendCurrentBitEv($this);
   HEAP8[$6>>0] = 1;
   STACKTOP = sp;return;
  }
 } else {
  $11 = !($sample <= -0.599999999999999977796);
  if (!($11)) {
   __ZN6fskube9Digitizer19maybeSendCurrentBitEv($this);
   HEAP8[$6>>0] = 0;
   STACKTOP = sp;return;
  }
 }
 $12 = (($this) + 20|0);
 $13 = HEAP32[$12>>2]|0;
 $14 = (($13) + 1)|0;
 HEAP32[$12>>2] = $14;
 $15 = (($this) + 8|0);
 $16 = HEAP32[$15>>2]|0;
 $17 = (($this) + 12|0);
 $18 = HEAP32[$17>>2]|0;
 $19 = (($16>>>0) / ($18>>>0))&-1;
 $20 = ($14>>>0)<($19>>>0);
 if ($20) {
  STACKTOP = sp;return;
 }
 __ZN6fskube9Digitizer19maybeSendCurrentBitEv($this);
 STACKTOP = sp;return;
}
function __ZN6fskube9Digitizer5resetEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 20|0);
 HEAP32[$0>>2] = 0;
 $1 = (($this) + 16|0);
 HEAP8[$1>>0] = 0;
 STACKTOP = sp;return;
}
function __ZN6fskube9DigitizerD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __GLOBAL__I_a136() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_createLogHandle(13560)|0);
 HEAP32[13552>>2] = $0;
 STACKTOP = sp;return;
}
function ___getTypeName($ti) {
 $ti = $ti|0;
 var $$0$i = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($ti) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = (_strlen(($1|0))|0);
 $3 = (($2) + 1)|0;
 $4 = (_malloc($3)|0);
 $5 = ($4|0)==(0|0);
 if ($5) {
  $$0$i = 0;
  STACKTOP = sp;return ($$0$i|0);
 }
 _memcpy(($4|0),($1|0),($3|0))|0;
 $$0$i = $4;
 STACKTOP = sp;return ($$0$i|0);
}
function __GLOBAL__I_a159() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 __embind_register_void((14736|0),(13704|0));
 __embind_register_bool((14768|0),(13712|0),1,1,0);
 __embind_register_integer((14784|0),(13720|0),1,-128,127);
 __embind_register_integer((14816|0),(13728|0),1,-128,127);
 __embind_register_integer((14800|0),(13744|0),1,0,255);
 __embind_register_integer((14832|0),(13760|0),2,-32768,32767);
 __embind_register_integer((14848|0),(13768|0),2,0,65535);
 __embind_register_integer((14864|0),(13784|0),4,-2147483648,2147483647);
 __embind_register_integer((14880|0),(13792|0),4,0,-1);
 __embind_register_integer((14896|0),(13808|0),4,-2147483648,2147483647);
 __embind_register_integer((14912|0),(13816|0),4,0,-1);
 __embind_register_float((14928|0),(13832|0),4);
 __embind_register_float((14944|0),(13840|0),8);
 __embind_register_std_string((14288|0),(13848|0));
 __embind_register_std_string((14200|0),(13864|0));
 __embind_register_std_wstring((14112|0),4,(13904|0));
 __embind_register_emval((3312|0),(13920|0));
 __embind_register_memory_view((13992|0),(13936|0));
 STACKTOP = sp;return;
}
function _strtok($s,$sep) {
 $s = $s|0;
 $sep = $sep|0;
 var $$0 = 0, $$0$i = 0, $$0$i$i = 0, $$0$i6 = 0, $$01 = 0, $$02$lcssa$i$i = 0, $$025$i = 0, $$026$i = 0, $$026$i$i = 0, $$03$i = 0, $$03$lcssa$i$ph = 0, $$034$i = 0, $$1$i$i = 0, $$1$lcssa$i = 0, $$14$i = 0, $$pre = 0, $$pre$phiZ2D = 0, $$pre9 = 0, $$sum = 0, $$sum2 = 0;
 var $$sum7 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0;
 var $115 = 0, $116 = 0, $117 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $byteset$i = 0;
 var $or$cond$i$i = 0, $w$0$lcssa$i$i = 0, $w$03$i$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $byteset$i = sp;
 $0 = ($s|0)==(0|0);
 if ($0) {
  $1 = HEAP32[14312>>2]|0;
  $2 = ($1|0)==(0|0);
  if ($2) {
   $$0 = 0;
   STACKTOP = sp;return ($$0|0);
  } else {
   $$01 = $1;
  }
 } else {
  $$01 = $s;
 }
 ;HEAP32[$byteset$i+0>>2]=0|0;HEAP32[$byteset$i+4>>2]=0|0;HEAP32[$byteset$i+8>>2]=0|0;HEAP32[$byteset$i+12>>2]=0|0;HEAP32[$byteset$i+16>>2]=0|0;HEAP32[$byteset$i+20>>2]=0|0;HEAP32[$byteset$i+24>>2]=0|0;HEAP32[$byteset$i+28>>2]=0|0;
 $3 = HEAP8[$sep>>0]|0;
 $4 = ($3<<24>>24)==(0);
 do {
  if ($4) {
   $$0$i = 0;
  } else {
   $5 = (($sep) + 1|0);
   $6 = HEAP8[$5>>0]|0;
   $7 = ($6<<24>>24)==(0);
   if ($7) {
    $$03$i = $$01;
    while(1) {
     $8 = HEAP8[$$03$i>>0]|0;
     $9 = ($8<<24>>24)==($3<<24>>24);
     $10 = (($$03$i) + 1|0);
     if ($9) {
      $$03$i = $10;
     } else {
      break;
     }
    }
    $11 = $$03$i;
    $12 = $$01;
    $13 = (($11) - ($12))|0;
    $$0$i = $13;
    break;
   } else {
    $$026$i = $sep;$17 = $3;
   }
   while(1) {
    $16 = $17&255;
    $18 = $16 & 31;
    $19 = 1 << $18;
    $20 = $16 >>> 5;
    $21 = (($byteset$i) + ($20<<2)|0);
    $22 = HEAP32[$21>>2]|0;
    $23 = $22 | $19;
    HEAP32[$21>>2] = $23;
    $24 = (($$026$i) + 1|0);
    $25 = HEAP8[$24>>0]|0;
    $26 = ($25<<24>>24)==(0);
    if ($26) {
     break;
    } else {
     $$026$i = $24;$17 = $25;
    }
   }
   $14 = HEAP8[$$01>>0]|0;
   $15 = ($14<<24>>24)==(0);
   L14: do {
    if ($15) {
     $$1$lcssa$i = $$01;
    } else {
     $$14$i = $$01;$31 = $14;
     while(1) {
      $30 = $31&255;
      $32 = $30 >>> 5;
      $33 = (($byteset$i) + ($32<<2)|0);
      $34 = HEAP32[$33>>2]|0;
      $35 = $30 & 31;
      $36 = 1 << $35;
      $37 = $34 & $36;
      $38 = ($37|0)==(0);
      $28 = (($$14$i) + 1|0);
      if ($38) {
       $$1$lcssa$i = $$14$i;
       break L14;
      }
      $27 = HEAP8[$28>>0]|0;
      $29 = ($27<<24>>24)==(0);
      if ($29) {
       $$1$lcssa$i = $28;
       break;
      } else {
       $$14$i = $28;$31 = $27;
      }
     }
    }
   } while(0);
   $39 = $$1$lcssa$i;
   $40 = $$01;
   $41 = (($39) - ($40))|0;
   $$0$i = $41;
  }
 } while(0);
 $42 = (($$01) + ($$0$i)|0);
 $43 = HEAP8[$42>>0]|0;
 $44 = ($43<<24>>24)==(0);
 if ($44) {
  HEAP32[14312>>2] = 0;
  $$0 = 0;
  STACKTOP = sp;return ($$0|0);
 }
 L24: do {
  if ($4) {
   $52 = (_strlen(($42|0))|0);
   $$sum7 = (($$0$i) + ($52))|0;
   $53 = (($$01) + ($$sum7)|0);
   $$pre9 = $42;
   $$0$i$i = $53;$$pre$phiZ2D = $$pre9;
   label = 27;
  } else {
   $45 = (($sep) + 1|0);
   $46 = HEAP8[$45>>0]|0;
   $47 = ($46<<24>>24)==(0);
   if (!($47)) {
    ;HEAP32[$byteset$i+0>>2]=0|0;HEAP32[$byteset$i+4>>2]=0|0;HEAP32[$byteset$i+8>>2]=0|0;HEAP32[$byteset$i+12>>2]=0|0;HEAP32[$byteset$i+16>>2]=0|0;HEAP32[$byteset$i+20>>2]=0|0;HEAP32[$byteset$i+24>>2]=0|0;HEAP32[$byteset$i+28>>2]=0|0;
    $$025$i = $sep;$89 = $3;
    while(1) {
     $88 = $89&255;
     $90 = $88 & 31;
     $91 = 1 << $90;
     $92 = $88 >>> 5;
     $93 = (($byteset$i) + ($92<<2)|0);
     $94 = HEAP32[$93>>2]|0;
     $95 = $94 | $91;
     HEAP32[$93>>2] = $95;
     $96 = (($$025$i) + 1|0);
     $97 = HEAP8[$96>>0]|0;
     $98 = ($97<<24>>24)==(0);
     if ($98) {
      $$034$i = $42;$103 = $43;
      break;
     } else {
      $$025$i = $96;$89 = $97;
     }
    }
    while(1) {
     $102 = $103&255;
     $104 = $102 >>> 5;
     $105 = (($byteset$i) + ($104<<2)|0);
     $106 = HEAP32[$105>>2]|0;
     $107 = $102 & 31;
     $108 = 1 << $107;
     $109 = $106 & $108;
     $110 = ($109|0)==(0);
     $100 = (($$034$i) + 1|0);
     if (!($110)) {
      $$03$lcssa$i$ph = $$034$i;
      break;
     }
     $99 = HEAP8[$100>>0]|0;
     $101 = ($99<<24>>24)==(0);
     if ($101) {
      $$03$lcssa$i$ph = $100;
      break;
     } else {
      $$034$i = $100;$103 = $99;
     }
    }
    $111 = $$03$lcssa$i$ph;
    $112 = $42;
    $113 = (($111) - ($112))|0;
    $$0$i6 = $113;
    break;
   }
   $48 = $3&255;
   $49 = $42;
   $50 = $49 & 3;
   $51 = ($50|0)==(0);
   L36: do {
    if ($51) {
     $$02$lcssa$i$i = $42;
    } else {
     $$026$i$i = $42;$58 = $43;
     while(1) {
      $59 = ($58<<24>>24)==(0);
      if ($59) {
       $$0$i$i = $$026$i$i;$$pre$phiZ2D = $49;
       label = 27;
       break L24;
      }
      $60 = ($58<<24>>24)==($3<<24>>24);
      $54 = (($$026$i$i) + 1|0);
      if ($60) {
       $$0$i$i = $$026$i$i;$$pre$phiZ2D = $49;
       label = 27;
       break L24;
      }
      $55 = $54;
      $56 = $55 & 3;
      $57 = ($56|0)==(0);
      if ($57) {
       $$02$lcssa$i$i = $54;
       break L36;
      }
      $$pre = HEAP8[$54>>0]|0;
      $$026$i$i = $54;$58 = $$pre;
     }
    }
   } while(0);
   $61 = Math_imul($48, 16843009)|0;
   $62 = HEAP32[$$02$lcssa$i$i>>2]|0;
   $63 = (($62) + -16843009)|0;
   $64 = $62 & -2139062144;
   $65 = $64 ^ -2139062144;
   $66 = $65 & $63;
   $67 = ($66|0)==(0);
   L43: do {
    if ($67) {
     $76 = $62;$w$03$i$i = $$02$lcssa$i$i;
     while(1) {
      $75 = $76 ^ $61;
      $77 = (($75) + -16843009)|0;
      $78 = $75 & -2139062144;
      $79 = $78 ^ -2139062144;
      $80 = $79 & $77;
      $81 = ($80|0)==(0);
      $69 = (($w$03$i$i) + 4|0);
      if (!($81)) {
       $w$0$lcssa$i$i = $w$03$i$i;
       break L43;
      }
      $68 = HEAP32[$69>>2]|0;
      $70 = (($68) + -16843009)|0;
      $71 = $68 & -2139062144;
      $72 = $71 ^ -2139062144;
      $73 = $72 & $70;
      $74 = ($73|0)==(0);
      if ($74) {
       $76 = $68;$w$03$i$i = $69;
      } else {
       $w$0$lcssa$i$i = $69;
       break;
      }
     }
    } else {
     $w$0$lcssa$i$i = $$02$lcssa$i$i;
    }
   } while(0);
   $$1$i$i = $w$0$lcssa$i$i;
   while(1) {
    $82 = HEAP8[$$1$i$i>>0]|0;
    $83 = ($82<<24>>24)==(0);
    $84 = ($82<<24>>24)==($3<<24>>24);
    $or$cond$i$i = $83 | $84;
    $85 = (($$1$i$i) + 1|0);
    if ($or$cond$i$i) {
     $$0$i$i = $$1$i$i;$$pre$phiZ2D = $49;
     label = 27;
     break;
    } else {
     $$1$i$i = $85;
    }
   }
  }
 } while(0);
 if ((label|0) == 27) {
  $86 = $$0$i$i;
  $87 = (($86) - ($$pre$phiZ2D))|0;
  $$0$i6 = $87;
 }
 $$sum = (($$0$i6) + ($$0$i))|0;
 $114 = (($$01) + ($$sum)|0);
 HEAP32[14312>>2] = $114;
 $115 = HEAP8[$114>>0]|0;
 $116 = ($115<<24>>24)==(0);
 if ($116) {
  HEAP32[14312>>2] = 0;
  $$0 = $42;
  STACKTOP = sp;return ($$0|0);
 } else {
  $$sum2 = (($$sum) + 1)|0;
  $117 = (($$01) + ($$sum2)|0);
  HEAP32[14312>>2] = $117;
  HEAP8[$114>>0] = 0;
  $$0 = $42;
  STACKTOP = sp;return ($$0|0);
 }
 return 0|0;
}
function __ZN10__cxxabiv116__shim_type_infoD2Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN10__cxxabiv123__fundamental_type_infoD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZN10__cxxabiv117__class_type_infoD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZN10__cxxabiv120__si_class_type_infoD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZN10__cxxabiv119__pointer_type_infoD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$0) {
 $this = $this|0;
 $thrown_type = $thrown_type|0;
 $0 = $0|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($this|0)==($thrown_type|0);
 STACKTOP = sp;return ($1|0);
}
function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$adjustedPtr) {
 $this = $this|0;
 $thrown_type = $thrown_type|0;
 $adjustedPtr = $adjustedPtr|0;
 var $$1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $info = 0, dest = 0, label = 0;
 var sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $info = sp;
 $0 = ($this|0)==($thrown_type|0);
 if ($0) {
  $$1 = 1;
  STACKTOP = sp;return ($$1|0);
 }
 $1 = ($thrown_type|0)==(0|0);
 if ($1) {
  $$1 = 0;
  STACKTOP = sp;return ($$1|0);
 }
 $2 = (___dynamic_cast($thrown_type,14440)|0);
 $3 = ($2|0)==(0|0);
 if ($3) {
  $$1 = 0;
  STACKTOP = sp;return ($$1|0);
 }
 dest=$info+0|0; stop=dest+56|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));
 HEAP32[$info>>2] = $2;
 $4 = (($info) + 8|0);
 HEAP32[$4>>2] = $this;
 $5 = (($info) + 12|0);
 HEAP32[$5>>2] = -1;
 $6 = (($info) + 48|0);
 HEAP32[$6>>2] = 1;
 $7 = HEAP32[$2>>2]|0;
 $8 = (($7) + 28|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = HEAP32[$adjustedPtr>>2]|0;
 FUNCTION_TABLE_viiii[$9 & 127]($2,$info,$10,1);
 $11 = (($info) + 24|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = ($12|0)==(1);
 if (!($13)) {
  $$1 = 0;
  STACKTOP = sp;return ($$1|0);
 }
 $14 = (($info) + 16|0);
 $15 = HEAP32[$14>>2]|0;
 HEAP32[$adjustedPtr>>2] = $15;
 $$1 = 1;
 STACKTOP = sp;return ($$1|0);
}
function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below) {
 $this = $this|0;
 $info = $info|0;
 $adjustedPtr = $adjustedPtr|0;
 $path_below = $path_below|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==($this|0);
 if (!($2)) {
  STACKTOP = sp;return;
 }
 $3 = (($info) + 16|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)==(0|0);
 if ($5) {
  HEAP32[$3>>2] = $adjustedPtr;
  $6 = (($info) + 24|0);
  HEAP32[$6>>2] = $path_below;
  $7 = (($info) + 36|0);
  HEAP32[$7>>2] = 1;
  STACKTOP = sp;return;
 }
 $8 = ($4|0)==($adjustedPtr|0);
 if (!($8)) {
  $12 = (($info) + 36|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = (($13) + 1)|0;
  HEAP32[$12>>2] = $14;
  $15 = (($info) + 24|0);
  HEAP32[$15>>2] = 2;
  $16 = (($info) + 54|0);
  HEAP8[$16>>0] = 1;
  STACKTOP = sp;return;
 }
 $9 = (($info) + 24|0);
 $10 = HEAP32[$9>>2]|0;
 $11 = ($10|0)==(2);
 if (!($11)) {
  STACKTOP = sp;return;
 }
 HEAP32[$9>>2] = $path_below;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below) {
 $this = $this|0;
 $info = $info|0;
 $adjustedPtr = $adjustedPtr|0;
 $path_below = $path_below|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($this|0)==($1|0);
 if (!($2)) {
  $17 = (($this) + 8|0);
  $18 = HEAP32[$17>>2]|0;
  $19 = HEAP32[$18>>2]|0;
  $20 = (($19) + 28|0);
  $21 = HEAP32[$20>>2]|0;
  FUNCTION_TABLE_viiii[$21 & 127]($18,$info,$adjustedPtr,$path_below);
  STACKTOP = sp;return;
 }
 $3 = (($info) + 16|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)==(0|0);
 if ($5) {
  HEAP32[$3>>2] = $adjustedPtr;
  $6 = (($info) + 24|0);
  HEAP32[$6>>2] = $path_below;
  $7 = (($info) + 36|0);
  HEAP32[$7>>2] = 1;
  STACKTOP = sp;return;
 }
 $8 = ($4|0)==($adjustedPtr|0);
 if (!($8)) {
  $12 = (($info) + 36|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = (($13) + 1)|0;
  HEAP32[$12>>2] = $14;
  $15 = (($info) + 24|0);
  HEAP32[$15>>2] = 2;
  $16 = (($info) + 54|0);
  HEAP8[$16>>0] = 1;
  STACKTOP = sp;return;
 }
 $9 = (($info) + 24|0);
 $10 = HEAP32[$9>>2]|0;
 $11 = ($10|0)==(2);
 if (!($11)) {
  STACKTOP = sp;return;
 }
 HEAP32[$9>>2] = $path_below;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below) {
 $this = $this|0;
 $info = $info|0;
 $adjustedPtr = $adjustedPtr|0;
 $path_below = $path_below|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $offset_to_base$0$i = 0, $offset_to_base$0$i1 = 0, $p$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($this|0)==($1|0);
 if ($2) {
  $3 = (($info) + 16|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = ($4|0)==(0|0);
  if ($5) {
   HEAP32[$3>>2] = $adjustedPtr;
   $6 = (($info) + 24|0);
   HEAP32[$6>>2] = $path_below;
   $7 = (($info) + 36|0);
   HEAP32[$7>>2] = 1;
   STACKTOP = sp;return;
  }
  $8 = ($4|0)==($adjustedPtr|0);
  if (!($8)) {
   $12 = (($info) + 36|0);
   $13 = HEAP32[$12>>2]|0;
   $14 = (($13) + 1)|0;
   HEAP32[$12>>2] = $14;
   $15 = (($info) + 24|0);
   HEAP32[$15>>2] = 2;
   $16 = (($info) + 54|0);
   HEAP8[$16>>0] = 1;
   STACKTOP = sp;return;
  }
  $9 = (($info) + 24|0);
  $10 = HEAP32[$9>>2]|0;
  $11 = ($10|0)==(2);
  if (!($11)) {
   STACKTOP = sp;return;
  }
  HEAP32[$9>>2] = $path_below;
  STACKTOP = sp;return;
 }
 $17 = (($this) + 12|0);
 $18 = HEAP32[$17>>2]|0;
 $19 = ((($this) + ($18<<3)|0) + 16|0);
 $20 = (($this) + 20|0);
 $21 = HEAP32[$20>>2]|0;
 $22 = $21 >> 8;
 $23 = $21 & 1;
 $24 = ($23|0)==(0);
 if ($24) {
  $offset_to_base$0$i1 = $22;
 } else {
  $25 = HEAP32[$adjustedPtr>>2]|0;
  $26 = (($25) + ($22)|0);
  $27 = HEAP32[$26>>2]|0;
  $offset_to_base$0$i1 = $27;
 }
 $28 = (($this) + 16|0);
 $29 = HEAP32[$28>>2]|0;
 $30 = HEAP32[$29>>2]|0;
 $31 = (($30) + 28|0);
 $32 = HEAP32[$31>>2]|0;
 $33 = (($adjustedPtr) + ($offset_to_base$0$i1)|0);
 $34 = $21 & 2;
 $35 = ($34|0)!=(0);
 $36 = $35 ? $path_below : 2;
 FUNCTION_TABLE_viiii[$32 & 127]($29,$info,$33,$36);
 $37 = ($18|0)>(1);
 if (!($37)) {
  STACKTOP = sp;return;
 }
 $38 = (($this) + 24|0);
 $39 = (($info) + 54|0);
 $p$0 = $38;
 while(1) {
  $40 = (($p$0) + 4|0);
  $41 = HEAP32[$40>>2]|0;
  $42 = $41 >> 8;
  $43 = $41 & 1;
  $44 = ($43|0)==(0);
  if ($44) {
   $offset_to_base$0$i = $42;
  } else {
   $45 = HEAP32[$adjustedPtr>>2]|0;
   $46 = (($45) + ($42)|0);
   $47 = HEAP32[$46>>2]|0;
   $offset_to_base$0$i = $47;
  }
  $48 = HEAP32[$p$0>>2]|0;
  $49 = HEAP32[$48>>2]|0;
  $50 = (($49) + 28|0);
  $51 = HEAP32[$50>>2]|0;
  $52 = (($adjustedPtr) + ($offset_to_base$0$i)|0);
  $53 = $41 & 2;
  $54 = ($53|0)!=(0);
  $55 = $54 ? $path_below : 2;
  FUNCTION_TABLE_viiii[$51 & 127]($48,$info,$52,$55);
  $56 = HEAP8[$39>>0]|0;
  $57 = ($56<<24>>24)==(0);
  if (!($57)) {
   label = 16;
   break;
  }
  $58 = (($p$0) + 8|0);
  $59 = ($58>>>0)<($19>>>0);
  if ($59) {
   $p$0 = $58;
  } else {
   label = 16;
   break;
  }
 }
 if ((label|0) == 16) {
  STACKTOP = sp;return;
 }
}
function __ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$adjustedPtr) {
 $this = $this|0;
 $thrown_type = $thrown_type|0;
 $adjustedPtr = $adjustedPtr|0;
 var $$$i = 0, $$1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $info = 0, $or$cond = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $info = sp;
 $0 = HEAP32[$adjustedPtr>>2]|0;
 $1 = HEAP32[$0>>2]|0;
 HEAP32[$adjustedPtr>>2] = $1;
 $2 = ($this|0)==($thrown_type|0);
 $3 = ($thrown_type|0)==(14752|0);
 $$$i = $2 | $3;
 if ($$$i) {
  $$1 = 1;
 } else {
  $4 = ($thrown_type|0)==(0|0);
  if ($4) {
   $$1 = 0;
  } else {
   $5 = (___dynamic_cast($thrown_type,14552)|0);
   $6 = ($5|0)==(0|0);
   if ($6) {
    $$1 = 0;
   } else {
    $7 = (($5) + 8|0);
    $8 = HEAP32[$7>>2]|0;
    $9 = (($this) + 8|0);
    $10 = HEAP32[$9>>2]|0;
    $11 = $10 ^ -1;
    $12 = $8 & $11;
    $13 = ($12|0)==(0);
    if ($13) {
     $14 = (($this) + 12|0);
     $15 = HEAP32[$14>>2]|0;
     $16 = (($5) + 12|0);
     $17 = HEAP32[$16>>2]|0;
     $18 = ($15|0)==($17|0);
     $19 = ($15|0)==(14736|0);
     $or$cond = $18 | $19;
     if ($or$cond) {
      $$1 = 1;
     } else {
      $20 = ($15|0)==(0|0);
      if ($20) {
       $$1 = 0;
      } else {
       $21 = (___dynamic_cast($15,14440)|0);
       $22 = ($21|0)==(0|0);
       if ($22) {
        $$1 = 0;
       } else {
        $23 = HEAP32[$16>>2]|0;
        $24 = ($23|0)==(0|0);
        if ($24) {
         $$1 = 0;
        } else {
         $25 = (___dynamic_cast($23,14440)|0);
         $26 = ($25|0)==(0|0);
         if ($26) {
          $$1 = 0;
         } else {
          dest=$info+0|0; stop=dest+56|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));
          HEAP32[$info>>2] = $25;
          $27 = (($info) + 8|0);
          HEAP32[$27>>2] = $21;
          $28 = (($info) + 12|0);
          HEAP32[$28>>2] = -1;
          $29 = (($info) + 48|0);
          HEAP32[$29>>2] = 1;
          $30 = HEAP32[$25>>2]|0;
          $31 = (($30) + 28|0);
          $32 = HEAP32[$31>>2]|0;
          $33 = HEAP32[$adjustedPtr>>2]|0;
          FUNCTION_TABLE_viiii[$32 & 127]($25,$info,$33,1);
          $34 = (($info) + 24|0);
          $35 = HEAP32[$34>>2]|0;
          $36 = ($35|0)==(1);
          if ($36) {
           $37 = (($info) + 16|0);
           $38 = HEAP32[$37>>2]|0;
           HEAP32[$adjustedPtr>>2] = $38;
           $$1 = 1;
          } else {
           $$1 = 0;
          }
         }
        }
       }
      }
     }
    } else {
     $$1 = 0;
    }
   }
  }
 }
 STACKTOP = sp;return ($$1|0);
}
function ___dynamic_cast($static_ptr,$dst_type) {
 $static_ptr = $static_ptr|0;
 $dst_type = $dst_type|0;
 var $$ = 0, $$1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $dst_ptr$0 = 0, $info = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $info = sp;
 $0 = HEAP32[$static_ptr>>2]|0;
 $1 = (($0) + -8|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = $2;
 $4 = (($static_ptr) + ($3)|0);
 $5 = (($0) + -4|0);
 $6 = HEAP32[$5>>2]|0;
 HEAP32[$info>>2] = $dst_type;
 $7 = (($info) + 4|0);
 HEAP32[$7>>2] = $static_ptr;
 $8 = (($info) + 8|0);
 HEAP32[$8>>2] = 14384;
 $9 = (($info) + 12|0);
 $10 = (($info) + 16|0);
 $11 = (($info) + 20|0);
 $12 = (($info) + 24|0);
 $13 = (($info) + 28|0);
 $14 = (($info) + 32|0);
 $15 = (($info) + 40|0);
 $16 = ($6|0)==($dst_type|0);
 dest=$9+0|0; stop=dest+40|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));HEAP16[$9+40>>1]=0|0;HEAP8[$9+42>>0]=0|0;
 do {
  if ($16) {
   $17 = (($info) + 48|0);
   HEAP32[$17>>2] = 1;
   $18 = HEAP32[$6>>2]|0;
   $19 = (($18) + 20|0);
   $20 = HEAP32[$19>>2]|0;
   FUNCTION_TABLE_viiiiii[$20 & 127]($6,$info,$4,$4,1,0);
   $21 = HEAP32[$12>>2]|0;
   $22 = ($21|0)==(1);
   $$ = $22 ? $4 : 0;
   $dst_ptr$0 = $$;
  } else {
   $23 = (($info) + 36|0);
   $24 = HEAP32[$6>>2]|0;
   $25 = (($24) + 24|0);
   $26 = HEAP32[$25>>2]|0;
   FUNCTION_TABLE_viiiii[$26 & 127]($6,$info,$4,1,0);
   $27 = HEAP32[$23>>2]|0;
   if ((($27|0) == 0)) {
    $28 = HEAP32[$15>>2]|0;
    $29 = ($28|0)==(1);
    if (!($29)) {
     $dst_ptr$0 = 0;
     break;
    }
    $30 = HEAP32[$13>>2]|0;
    $31 = ($30|0)==(1);
    if (!($31)) {
     $dst_ptr$0 = 0;
     break;
    }
    $32 = HEAP32[$14>>2]|0;
    $33 = ($32|0)==(1);
    $34 = HEAP32[$11>>2]|0;
    $$1 = $33 ? $34 : 0;
    $dst_ptr$0 = $$1;
    break;
   } else if (!((($27|0) == 1))) {
    $dst_ptr$0 = 0;
    break;
   }
   $35 = HEAP32[$12>>2]|0;
   $36 = ($35|0)==(1);
   if (!($36)) {
    $37 = HEAP32[$15>>2]|0;
    $38 = ($37|0)==(0);
    if (!($38)) {
     $dst_ptr$0 = 0;
     break;
    }
    $39 = HEAP32[$13>>2]|0;
    $40 = ($39|0)==(1);
    if (!($40)) {
     $dst_ptr$0 = 0;
     break;
    }
    $41 = HEAP32[$14>>2]|0;
    $42 = ($41|0)==(1);
    if (!($42)) {
     $dst_ptr$0 = 0;
     break;
    }
   }
   $43 = HEAP32[$10>>2]|0;
   $dst_ptr$0 = $43;
  }
 } while(0);
 STACKTOP = sp;return ($dst_ptr$0|0);
}
function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $does_dst_type_point_to_our_static_type$0$off0$lcssa = 0, $does_dst_type_point_to_our_static_type$0$off019 = 0, $does_dst_type_point_to_our_static_type$1$off0 = 0, $is_dst_type_derived_from_static_type$0$off021 = 0;
 var $is_dst_type_derived_from_static_type$1$off0 = 0, $is_dst_type_derived_from_static_type$2$off0 = 0, $is_dst_type_derived_from_static_type$2$off030 = 0, $is_dst_type_derived_from_static_type$2$off031 = 0, $offset_to_base$0$i = 0, $offset_to_base$0$i11 = 0, $offset_to_base$0$i13 = 0, $offset_to_base$0$i14 = 0, $offset_to_base$0$i9 = 0, $p$020 = 0, $p2$0 = 0, $p2$1 = 0, $p2$2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($this|0)==($1|0);
 if ($2) {
  $3 = (($info) + 4|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = ($4|0)==($current_ptr|0);
  if (!($5)) {
   STACKTOP = sp;return;
  }
  $6 = (($info) + 28|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = ($7|0)==(1);
  if ($8) {
   STACKTOP = sp;return;
  }
  HEAP32[$6>>2] = $path_below;
  STACKTOP = sp;return;
 }
 $9 = HEAP32[$info>>2]|0;
 $10 = ($this|0)==($9|0);
 if ($10) {
  $11 = (($info) + 16|0);
  $12 = HEAP32[$11>>2]|0;
  $13 = ($12|0)==($current_ptr|0);
  if (!($13)) {
   $14 = (($info) + 20|0);
   $15 = HEAP32[$14>>2]|0;
   $16 = ($15|0)==($current_ptr|0);
   if (!($16)) {
    $19 = (($info) + 32|0);
    HEAP32[$19>>2] = $path_below;
    $20 = (($info) + 44|0);
    $21 = HEAP32[$20>>2]|0;
    $22 = ($21|0)==(4);
    if ($22) {
     STACKTOP = sp;return;
    }
    $23 = (($this) + 12|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = ((($this) + ($24<<3)|0) + 16|0);
    $26 = ($24|0)>(0);
    L19: do {
     if ($26) {
      $27 = (($this) + 16|0);
      $28 = (($info) + 52|0);
      $29 = (($info) + 53|0);
      $30 = (($info) + 54|0);
      $31 = (($this) + 8|0);
      $32 = (($info) + 24|0);
      $does_dst_type_point_to_our_static_type$0$off019 = 0;$is_dst_type_derived_from_static_type$0$off021 = 0;$p$020 = $27;
      L21: while(1) {
       HEAP8[$28>>0] = 0;
       HEAP8[$29>>0] = 0;
       $33 = (($p$020) + 4|0);
       $34 = HEAP32[$33>>2]|0;
       $35 = $34 >> 8;
       $36 = $34 & 1;
       $37 = ($36|0)==(0);
       if ($37) {
        $offset_to_base$0$i13 = $35;
       } else {
        $38 = HEAP32[$current_ptr>>2]|0;
        $39 = (($38) + ($35)|0);
        $40 = HEAP32[$39>>2]|0;
        $offset_to_base$0$i13 = $40;
       }
       $41 = HEAP32[$p$020>>2]|0;
       $42 = HEAP32[$41>>2]|0;
       $43 = (($42) + 20|0);
       $44 = HEAP32[$43>>2]|0;
       $45 = (($current_ptr) + ($offset_to_base$0$i13)|0);
       $46 = $34 >>> 1;
       $47 = $46 & 1;
       $48 = (2 - ($47))|0;
       FUNCTION_TABLE_viiiiii[$44 & 127]($41,$info,$current_ptr,$45,$48,$use_strcmp);
       $49 = HEAP8[$30>>0]|0;
       $50 = ($49<<24>>24)==(0);
       if (!($50)) {
        $does_dst_type_point_to_our_static_type$0$off0$lcssa = $does_dst_type_point_to_our_static_type$0$off019;$is_dst_type_derived_from_static_type$2$off0 = $is_dst_type_derived_from_static_type$0$off021;
        break;
       }
       $51 = HEAP8[$29>>0]|0;
       $52 = ($51<<24>>24)==(0);
       do {
        if ($52) {
         $does_dst_type_point_to_our_static_type$1$off0 = $does_dst_type_point_to_our_static_type$0$off019;$is_dst_type_derived_from_static_type$1$off0 = $is_dst_type_derived_from_static_type$0$off021;
        } else {
         $53 = HEAP8[$28>>0]|0;
         $54 = ($53<<24>>24)==(0);
         if ($54) {
          $60 = HEAP32[$31>>2]|0;
          $61 = $60 & 1;
          $62 = ($61|0)==(0);
          if ($62) {
           $does_dst_type_point_to_our_static_type$0$off0$lcssa = $does_dst_type_point_to_our_static_type$0$off019;$is_dst_type_derived_from_static_type$2$off0 = 1;
           break L21;
          } else {
           $does_dst_type_point_to_our_static_type$1$off0 = $does_dst_type_point_to_our_static_type$0$off019;$is_dst_type_derived_from_static_type$1$off0 = 1;
           break;
          }
         }
         $55 = HEAP32[$32>>2]|0;
         $56 = ($55|0)==(1);
         if ($56) {
          label = 27;
          break L19;
         }
         $57 = HEAP32[$31>>2]|0;
         $58 = $57 & 2;
         $59 = ($58|0)==(0);
         if ($59) {
          label = 27;
          break L19;
         } else {
          $does_dst_type_point_to_our_static_type$1$off0 = 1;$is_dst_type_derived_from_static_type$1$off0 = 1;
         }
        }
       } while(0);
       $63 = (($p$020) + 8|0);
       $64 = ($63>>>0)<($25>>>0);
       if ($64) {
        $does_dst_type_point_to_our_static_type$0$off019 = $does_dst_type_point_to_our_static_type$1$off0;$is_dst_type_derived_from_static_type$0$off021 = $is_dst_type_derived_from_static_type$1$off0;$p$020 = $63;
       } else {
        $does_dst_type_point_to_our_static_type$0$off0$lcssa = $does_dst_type_point_to_our_static_type$1$off0;$is_dst_type_derived_from_static_type$2$off0 = $is_dst_type_derived_from_static_type$1$off0;
        break;
       }
      }
      if ($does_dst_type_point_to_our_static_type$0$off0$lcssa) {
       $is_dst_type_derived_from_static_type$2$off031 = $is_dst_type_derived_from_static_type$2$off0;
       label = 26;
      } else {
       $is_dst_type_derived_from_static_type$2$off030 = $is_dst_type_derived_from_static_type$2$off0;
       label = 23;
      }
     } else {
      $is_dst_type_derived_from_static_type$2$off030 = 0;
      label = 23;
     }
    } while(0);
    if ((label|0) == 23) {
     HEAP32[$14>>2] = $current_ptr;
     $65 = (($info) + 40|0);
     $66 = HEAP32[$65>>2]|0;
     $67 = (($66) + 1)|0;
     HEAP32[$65>>2] = $67;
     $68 = (($info) + 36|0);
     $69 = HEAP32[$68>>2]|0;
     $70 = ($69|0)==(1);
     if ($70) {
      $71 = (($info) + 24|0);
      $72 = HEAP32[$71>>2]|0;
      $73 = ($72|0)==(2);
      if ($73) {
       $74 = (($info) + 54|0);
       HEAP8[$74>>0] = 1;
       if ($is_dst_type_derived_from_static_type$2$off030) {
        label = 27;
       } else {
        label = 28;
       }
      } else {
       $is_dst_type_derived_from_static_type$2$off031 = $is_dst_type_derived_from_static_type$2$off030;
       label = 26;
      }
     } else {
      $is_dst_type_derived_from_static_type$2$off031 = $is_dst_type_derived_from_static_type$2$off030;
      label = 26;
     }
    }
    if ((label|0) == 26) {
     if ($is_dst_type_derived_from_static_type$2$off031) {
      label = 27;
     } else {
      label = 28;
     }
    }
    if ((label|0) == 27) {
     HEAP32[$20>>2] = 3;
     STACKTOP = sp;return;
    }
    else if ((label|0) == 28) {
     HEAP32[$20>>2] = 4;
     STACKTOP = sp;return;
    }
   }
  }
  $17 = ($path_below|0)==(1);
  if (!($17)) {
   STACKTOP = sp;return;
  }
  $18 = (($info) + 32|0);
  HEAP32[$18>>2] = 1;
  STACKTOP = sp;return;
 }
 $75 = (($this) + 12|0);
 $76 = HEAP32[$75>>2]|0;
 $77 = ((($this) + ($76<<3)|0) + 16|0);
 $78 = (($this) + 20|0);
 $79 = HEAP32[$78>>2]|0;
 $80 = $79 >> 8;
 $81 = $79 & 1;
 $82 = ($81|0)==(0);
 if ($82) {
  $offset_to_base$0$i14 = $80;
 } else {
  $83 = HEAP32[$current_ptr>>2]|0;
  $84 = (($83) + ($80)|0);
  $85 = HEAP32[$84>>2]|0;
  $offset_to_base$0$i14 = $85;
 }
 $86 = (($this) + 16|0);
 $87 = HEAP32[$86>>2]|0;
 $88 = HEAP32[$87>>2]|0;
 $89 = (($88) + 24|0);
 $90 = HEAP32[$89>>2]|0;
 $91 = (($current_ptr) + ($offset_to_base$0$i14)|0);
 $92 = $79 & 2;
 $93 = ($92|0)!=(0);
 $94 = $93 ? $path_below : 2;
 FUNCTION_TABLE_viiiii[$90 & 127]($87,$info,$91,$94,$use_strcmp);
 $95 = (($this) + 24|0);
 $96 = ($76|0)>(1);
 if (!($96)) {
  STACKTOP = sp;return;
 }
 $97 = (($this) + 8|0);
 $98 = HEAP32[$97>>2]|0;
 $99 = $98 & 2;
 $100 = ($99|0)==(0);
 if ($100) {
  $101 = (($info) + 36|0);
  $102 = HEAP32[$101>>2]|0;
  $103 = ($102|0)==(1);
  if (!($103)) {
   $125 = $98 & 1;
   $126 = ($125|0)==(0);
   if ($126) {
    $129 = (($info) + 54|0);
    $p2$2 = $95;
    while(1) {
     $154 = HEAP8[$129>>0]|0;
     $155 = ($154<<24>>24)==(0);
     if (!($155)) {
      label = 53;
      break;
     }
     $156 = HEAP32[$101>>2]|0;
     $157 = ($156|0)==(1);
     if ($157) {
      label = 53;
      break;
     }
     $158 = (($p2$2) + 4|0);
     $159 = HEAP32[$158>>2]|0;
     $160 = $159 >> 8;
     $161 = $159 & 1;
     $162 = ($161|0)==(0);
     if ($162) {
      $offset_to_base$0$i = $160;
     } else {
      $163 = HEAP32[$current_ptr>>2]|0;
      $164 = (($163) + ($160)|0);
      $165 = HEAP32[$164>>2]|0;
      $offset_to_base$0$i = $165;
     }
     $166 = HEAP32[$p2$2>>2]|0;
     $167 = HEAP32[$166>>2]|0;
     $168 = (($167) + 24|0);
     $169 = HEAP32[$168>>2]|0;
     $170 = (($current_ptr) + ($offset_to_base$0$i)|0);
     $171 = $159 & 2;
     $172 = ($171|0)!=(0);
     $173 = $172 ? $path_below : 2;
     FUNCTION_TABLE_viiiii[$169 & 127]($166,$info,$170,$173,$use_strcmp);
     $174 = (($p2$2) + 8|0);
     $175 = ($174>>>0)<($77>>>0);
     if ($175) {
      $p2$2 = $174;
     } else {
      label = 53;
      break;
     }
    }
    if ((label|0) == 53) {
     STACKTOP = sp;return;
    }
   }
   $127 = (($info) + 24|0);
   $128 = (($info) + 54|0);
   $p2$1 = $95;
   while(1) {
    $130 = HEAP8[$128>>0]|0;
    $131 = ($130<<24>>24)==(0);
    if (!($131)) {
     label = 53;
     break;
    }
    $132 = HEAP32[$101>>2]|0;
    $133 = ($132|0)==(1);
    if ($133) {
     $134 = HEAP32[$127>>2]|0;
     $135 = ($134|0)==(1);
     if ($135) {
      label = 53;
      break;
     }
    }
    $136 = (($p2$1) + 4|0);
    $137 = HEAP32[$136>>2]|0;
    $138 = $137 >> 8;
    $139 = $137 & 1;
    $140 = ($139|0)==(0);
    if ($140) {
     $offset_to_base$0$i9 = $138;
    } else {
     $141 = HEAP32[$current_ptr>>2]|0;
     $142 = (($141) + ($138)|0);
     $143 = HEAP32[$142>>2]|0;
     $offset_to_base$0$i9 = $143;
    }
    $144 = HEAP32[$p2$1>>2]|0;
    $145 = HEAP32[$144>>2]|0;
    $146 = (($145) + 24|0);
    $147 = HEAP32[$146>>2]|0;
    $148 = (($current_ptr) + ($offset_to_base$0$i9)|0);
    $149 = $137 & 2;
    $150 = ($149|0)!=(0);
    $151 = $150 ? $path_below : 2;
    FUNCTION_TABLE_viiiii[$147 & 127]($144,$info,$148,$151,$use_strcmp);
    $152 = (($p2$1) + 8|0);
    $153 = ($152>>>0)<($77>>>0);
    if ($153) {
     $p2$1 = $152;
    } else {
     label = 53;
     break;
    }
   }
   if ((label|0) == 53) {
    STACKTOP = sp;return;
   }
  }
 }
 $104 = (($info) + 54|0);
 $p2$0 = $95;
 while(1) {
  $105 = HEAP8[$104>>0]|0;
  $106 = ($105<<24>>24)==(0);
  if (!($106)) {
   label = 53;
   break;
  }
  $107 = (($p2$0) + 4|0);
  $108 = HEAP32[$107>>2]|0;
  $109 = $108 >> 8;
  $110 = $108 & 1;
  $111 = ($110|0)==(0);
  if ($111) {
   $offset_to_base$0$i11 = $109;
  } else {
   $112 = HEAP32[$current_ptr>>2]|0;
   $113 = (($112) + ($109)|0);
   $114 = HEAP32[$113>>2]|0;
   $offset_to_base$0$i11 = $114;
  }
  $115 = HEAP32[$p2$0>>2]|0;
  $116 = HEAP32[$115>>2]|0;
  $117 = (($116) + 24|0);
  $118 = HEAP32[$117>>2]|0;
  $119 = (($current_ptr) + ($offset_to_base$0$i11)|0);
  $120 = $108 & 2;
  $121 = ($120|0)!=(0);
  $122 = $121 ? $path_below : 2;
  FUNCTION_TABLE_viiiii[$118 & 127]($115,$info,$119,$122,$use_strcmp);
  $123 = (($p2$0) + 8|0);
  $124 = ($123>>>0)<($77>>>0);
  if ($124) {
   $p2$0 = $123;
  } else {
   label = 53;
   break;
  }
 }
 if ((label|0) == 53) {
  STACKTOP = sp;return;
 }
}
function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $is_dst_type_derived_from_static_type$0$off01 = 0, $not$ = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($this|0)==($1|0);
 if ($2) {
  $3 = (($info) + 4|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = ($4|0)==($current_ptr|0);
  if (!($5)) {
   STACKTOP = sp;return;
  }
  $6 = (($info) + 28|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = ($7|0)==(1);
  if ($8) {
   STACKTOP = sp;return;
  }
  HEAP32[$6>>2] = $path_below;
  STACKTOP = sp;return;
 }
 $9 = HEAP32[$info>>2]|0;
 $10 = ($this|0)==($9|0);
 if (!($10)) {
  $43 = (($this) + 8|0);
  $44 = HEAP32[$43>>2]|0;
  $45 = HEAP32[$44>>2]|0;
  $46 = (($45) + 24|0);
  $47 = HEAP32[$46>>2]|0;
  FUNCTION_TABLE_viiiii[$47 & 127]($44,$info,$current_ptr,$path_below,$use_strcmp);
  STACKTOP = sp;return;
 }
 $11 = (($info) + 16|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = ($12|0)==($current_ptr|0);
 if (!($13)) {
  $14 = (($info) + 20|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = ($15|0)==($current_ptr|0);
  if (!($16)) {
   $19 = (($info) + 32|0);
   HEAP32[$19>>2] = $path_below;
   $20 = (($info) + 44|0);
   $21 = HEAP32[$20>>2]|0;
   $22 = ($21|0)==(4);
   if ($22) {
    STACKTOP = sp;return;
   }
   $23 = (($info) + 52|0);
   HEAP8[$23>>0] = 0;
   $24 = (($info) + 53|0);
   HEAP8[$24>>0] = 0;
   $25 = (($this) + 8|0);
   $26 = HEAP32[$25>>2]|0;
   $27 = HEAP32[$26>>2]|0;
   $28 = (($27) + 20|0);
   $29 = HEAP32[$28>>2]|0;
   FUNCTION_TABLE_viiiiii[$29 & 127]($26,$info,$current_ptr,$current_ptr,1,$use_strcmp);
   $30 = HEAP8[$24>>0]|0;
   $31 = ($30<<24>>24)==(0);
   if ($31) {
    $is_dst_type_derived_from_static_type$0$off01 = 0;
    label = 13;
   } else {
    $32 = HEAP8[$23>>0]|0;
    $not$ = ($32<<24>>24)==(0);
    if ($not$) {
     $is_dst_type_derived_from_static_type$0$off01 = 1;
     label = 13;
    }
   }
   do {
    if ((label|0) == 13) {
     HEAP32[$14>>2] = $current_ptr;
     $33 = (($info) + 40|0);
     $34 = HEAP32[$33>>2]|0;
     $35 = (($34) + 1)|0;
     HEAP32[$33>>2] = $35;
     $36 = (($info) + 36|0);
     $37 = HEAP32[$36>>2]|0;
     $38 = ($37|0)==(1);
     if ($38) {
      $39 = (($info) + 24|0);
      $40 = HEAP32[$39>>2]|0;
      $41 = ($40|0)==(2);
      if ($41) {
       $42 = (($info) + 54|0);
       HEAP8[$42>>0] = 1;
       if ($is_dst_type_derived_from_static_type$0$off01) {
        break;
       }
      } else {
       label = 16;
      }
     } else {
      label = 16;
     }
     if ((label|0) == 16) {
      if ($is_dst_type_derived_from_static_type$0$off01) {
       break;
      }
     }
     HEAP32[$20>>2] = 4;
     STACKTOP = sp;return;
    }
   } while(0);
   HEAP32[$20>>2] = 3;
   STACKTOP = sp;return;
  }
 }
 $17 = ($path_below|0)==(1);
 if (!($17)) {
  STACKTOP = sp;return;
 }
 $18 = (($info) + 32|0);
 HEAP32[$18>>2] = 1;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==($this|0);
 if ($2) {
  $3 = (($info) + 4|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = ($4|0)==($current_ptr|0);
  if (!($5)) {
   STACKTOP = sp;return;
  }
  $6 = (($info) + 28|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = ($7|0)==(1);
  if ($8) {
   STACKTOP = sp;return;
  }
  HEAP32[$6>>2] = $path_below;
  STACKTOP = sp;return;
 }
 $9 = HEAP32[$info>>2]|0;
 $10 = ($9|0)==($this|0);
 if (!($10)) {
  STACKTOP = sp;return;
 }
 $11 = (($info) + 16|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = ($12|0)==($current_ptr|0);
 if (!($13)) {
  $14 = (($info) + 20|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = ($15|0)==($current_ptr|0);
  if (!($16)) {
   $19 = (($info) + 32|0);
   HEAP32[$19>>2] = $path_below;
   HEAP32[$14>>2] = $current_ptr;
   $20 = (($info) + 40|0);
   $21 = HEAP32[$20>>2]|0;
   $22 = (($21) + 1)|0;
   HEAP32[$20>>2] = $22;
   $23 = (($info) + 36|0);
   $24 = HEAP32[$23>>2]|0;
   $25 = ($24|0)==(1);
   if ($25) {
    $26 = (($info) + 24|0);
    $27 = HEAP32[$26>>2]|0;
    $28 = ($27|0)==(2);
    if ($28) {
     $29 = (($info) + 54|0);
     HEAP8[$29>>0] = 1;
    }
   }
   $30 = (($info) + 44|0);
   HEAP32[$30>>2] = 4;
   STACKTOP = sp;return;
  }
 }
 $17 = ($path_below|0)==(1);
 if (!($17)) {
  STACKTOP = sp;return;
 }
 $18 = (($info) + 32|0);
 HEAP32[$18>>2] = 1;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $dst_ptr = $dst_ptr|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $offset_to_base$0$i = 0, $offset_to_base$0$i1 = 0, $or$cond$i = 0, $or$cond1$i = 0, $p$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($this|0)==($1|0);
 if (!($2)) {
  $32 = (($info) + 52|0);
  $33 = HEAP8[$32>>0]|0;
  $34 = (($info) + 53|0);
  $35 = HEAP8[$34>>0]|0;
  $36 = (($this) + 12|0);
  $37 = HEAP32[$36>>2]|0;
  $38 = ((($this) + ($37<<3)|0) + 16|0);
  HEAP8[$32>>0] = 0;
  HEAP8[$34>>0] = 0;
  $39 = (($this) + 20|0);
  $40 = HEAP32[$39>>2]|0;
  $41 = $40 >> 8;
  $42 = $40 & 1;
  $43 = ($42|0)==(0);
  if ($43) {
   $offset_to_base$0$i1 = $41;
  } else {
   $44 = HEAP32[$current_ptr>>2]|0;
   $45 = (($44) + ($41)|0);
   $46 = HEAP32[$45>>2]|0;
   $offset_to_base$0$i1 = $46;
  }
  $47 = (($this) + 16|0);
  $48 = HEAP32[$47>>2]|0;
  $49 = HEAP32[$48>>2]|0;
  $50 = (($49) + 20|0);
  $51 = HEAP32[$50>>2]|0;
  $52 = (($current_ptr) + ($offset_to_base$0$i1)|0);
  $53 = $40 & 2;
  $54 = ($53|0)!=(0);
  $55 = $54 ? $path_below : 2;
  FUNCTION_TABLE_viiiiii[$51 & 127]($48,$info,$dst_ptr,$52,$55,$use_strcmp);
  $56 = ($37|0)>(1);
  L6: do {
   if ($56) {
    $57 = (($this) + 24|0);
    $58 = (($info) + 24|0);
    $59 = (($this) + 8|0);
    $60 = (($info) + 54|0);
    $p$0 = $57;
    while(1) {
     $61 = HEAP8[$60>>0]|0;
     $62 = ($61<<24>>24)==(0);
     if (!($62)) {
      break L6;
     }
     $63 = HEAP8[$32>>0]|0;
     $64 = ($63<<24>>24)==(0);
     if ($64) {
      $70 = HEAP8[$34>>0]|0;
      $71 = ($70<<24>>24)==(0);
      if (!($71)) {
       $72 = HEAP32[$59>>2]|0;
       $73 = $72 & 1;
       $74 = ($73|0)==(0);
       if ($74) {
        break L6;
       }
      }
     } else {
      $65 = HEAP32[$58>>2]|0;
      $66 = ($65|0)==(1);
      if ($66) {
       break L6;
      }
      $67 = HEAP32[$59>>2]|0;
      $68 = $67 & 2;
      $69 = ($68|0)==(0);
      if ($69) {
       break L6;
      }
     }
     HEAP8[$32>>0] = 0;
     HEAP8[$34>>0] = 0;
     $75 = (($p$0) + 4|0);
     $76 = HEAP32[$75>>2]|0;
     $77 = $76 >> 8;
     $78 = $76 & 1;
     $79 = ($78|0)==(0);
     if ($79) {
      $offset_to_base$0$i = $77;
     } else {
      $80 = HEAP32[$current_ptr>>2]|0;
      $81 = (($80) + ($77)|0);
      $82 = HEAP32[$81>>2]|0;
      $offset_to_base$0$i = $82;
     }
     $83 = HEAP32[$p$0>>2]|0;
     $84 = HEAP32[$83>>2]|0;
     $85 = (($84) + 20|0);
     $86 = HEAP32[$85>>2]|0;
     $87 = (($current_ptr) + ($offset_to_base$0$i)|0);
     $88 = $76 & 2;
     $89 = ($88|0)!=(0);
     $90 = $89 ? $path_below : 2;
     FUNCTION_TABLE_viiiiii[$86 & 127]($83,$info,$dst_ptr,$87,$90,$use_strcmp);
     $91 = (($p$0) + 8|0);
     $92 = ($91>>>0)<($38>>>0);
     if ($92) {
      $p$0 = $91;
     } else {
      break;
     }
    }
   }
  } while(0);
  HEAP8[$32>>0] = $33;
  HEAP8[$34>>0] = $35;
  STACKTOP = sp;return;
 }
 $3 = (($info) + 53|0);
 HEAP8[$3>>0] = 1;
 $4 = (($info) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($5|0)==($current_ptr|0);
 if (!($6)) {
  STACKTOP = sp;return;
 }
 $7 = (($info) + 52|0);
 HEAP8[$7>>0] = 1;
 $8 = (($info) + 16|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = ($9|0)==(0|0);
 if ($10) {
  HEAP32[$8>>2] = $dst_ptr;
  $11 = (($info) + 24|0);
  HEAP32[$11>>2] = $path_below;
  $12 = (($info) + 36|0);
  HEAP32[$12>>2] = 1;
  $13 = (($info) + 48|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = ($14|0)==(1);
  $16 = ($path_below|0)==(1);
  $or$cond$i = $15 & $16;
  if (!($or$cond$i)) {
   STACKTOP = sp;return;
  }
  $17 = (($info) + 54|0);
  HEAP8[$17>>0] = 1;
  STACKTOP = sp;return;
 }
 $18 = ($9|0)==($dst_ptr|0);
 if (!($18)) {
  $28 = (($info) + 36|0);
  $29 = HEAP32[$28>>2]|0;
  $30 = (($29) + 1)|0;
  HEAP32[$28>>2] = $30;
  $31 = (($info) + 54|0);
  HEAP8[$31>>0] = 1;
  STACKTOP = sp;return;
 }
 $19 = (($info) + 24|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = ($20|0)==(2);
 if ($21) {
  HEAP32[$19>>2] = $path_below;
  $25 = $path_below;
 } else {
  $25 = $20;
 }
 $22 = (($info) + 48|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = ($23|0)==(1);
 $26 = ($25|0)==(1);
 $or$cond1$i = $24 & $26;
 if (!($or$cond1$i)) {
  STACKTOP = sp;return;
 }
 $27 = (($info) + 54|0);
 HEAP8[$27>>0] = 1;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $dst_ptr = $dst_ptr|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond$i = 0, $or$cond1$i = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($this|0)==($1|0);
 if (!($2)) {
  $32 = (($this) + 8|0);
  $33 = HEAP32[$32>>2]|0;
  $34 = HEAP32[$33>>2]|0;
  $35 = (($34) + 20|0);
  $36 = HEAP32[$35>>2]|0;
  FUNCTION_TABLE_viiiiii[$36 & 127]($33,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp);
  STACKTOP = sp;return;
 }
 $3 = (($info) + 53|0);
 HEAP8[$3>>0] = 1;
 $4 = (($info) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($5|0)==($current_ptr|0);
 if (!($6)) {
  STACKTOP = sp;return;
 }
 $7 = (($info) + 52|0);
 HEAP8[$7>>0] = 1;
 $8 = (($info) + 16|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = ($9|0)==(0|0);
 if ($10) {
  HEAP32[$8>>2] = $dst_ptr;
  $11 = (($info) + 24|0);
  HEAP32[$11>>2] = $path_below;
  $12 = (($info) + 36|0);
  HEAP32[$12>>2] = 1;
  $13 = (($info) + 48|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = ($14|0)==(1);
  $16 = ($path_below|0)==(1);
  $or$cond$i = $15 & $16;
  if (!($or$cond$i)) {
   STACKTOP = sp;return;
  }
  $17 = (($info) + 54|0);
  HEAP8[$17>>0] = 1;
  STACKTOP = sp;return;
 }
 $18 = ($9|0)==($dst_ptr|0);
 if (!($18)) {
  $28 = (($info) + 36|0);
  $29 = HEAP32[$28>>2]|0;
  $30 = (($29) + 1)|0;
  HEAP32[$28>>2] = $30;
  $31 = (($info) + 54|0);
  HEAP8[$31>>0] = 1;
  STACKTOP = sp;return;
 }
 $19 = (($info) + 24|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = ($20|0)==(2);
 if ($21) {
  HEAP32[$19>>2] = $path_below;
  $25 = $path_below;
 } else {
  $25 = $20;
 }
 $22 = (($info) + 48|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = ($23|0)==(1);
 $26 = ($25|0)==(1);
 $or$cond1$i = $24 & $26;
 if (!($or$cond1$i)) {
  STACKTOP = sp;return;
 }
 $27 = (($info) + 54|0);
 HEAP8[$27>>0] = 1;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $dst_ptr = $dst_ptr|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond$i = 0, $or$cond1$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==($this|0);
 if (!($2)) {
  STACKTOP = sp;return;
 }
 $3 = (($info) + 53|0);
 HEAP8[$3>>0] = 1;
 $4 = (($info) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($5|0)==($current_ptr|0);
 if (!($6)) {
  STACKTOP = sp;return;
 }
 $7 = (($info) + 52|0);
 HEAP8[$7>>0] = 1;
 $8 = (($info) + 16|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = ($9|0)==(0|0);
 if ($10) {
  HEAP32[$8>>2] = $dst_ptr;
  $11 = (($info) + 24|0);
  HEAP32[$11>>2] = $path_below;
  $12 = (($info) + 36|0);
  HEAP32[$12>>2] = 1;
  $13 = (($info) + 48|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = ($14|0)==(1);
  $16 = ($path_below|0)==(1);
  $or$cond$i = $15 & $16;
  if (!($or$cond$i)) {
   STACKTOP = sp;return;
  }
  $17 = (($info) + 54|0);
  HEAP8[$17>>0] = 1;
  STACKTOP = sp;return;
 }
 $18 = ($9|0)==($dst_ptr|0);
 if (!($18)) {
  $28 = (($info) + 36|0);
  $29 = HEAP32[$28>>2]|0;
  $30 = (($29) + 1)|0;
  HEAP32[$28>>2] = $30;
  $31 = (($info) + 54|0);
  HEAP8[$31>>0] = 1;
  STACKTOP = sp;return;
 }
 $19 = (($info) + 24|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = ($20|0)==(2);
 if ($21) {
  HEAP32[$19>>2] = $path_below;
  $25 = $path_below;
 } else {
  $25 = $20;
 }
 $22 = (($info) + 48|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = ($23|0)==(1);
 $26 = ($25|0)==(1);
 $or$cond1$i = $24 & $26;
 if (!($or$cond1$i)) {
  STACKTOP = sp;return;
 }
 $27 = (($info) + 54|0);
 HEAP8[$27>>0] = 1;
 STACKTOP = sp;return;
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i25 = 0, $$pre$i25$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre57$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0;
 var $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum10$pre$i$i = 0, $$sum107$i = 0, $$sum108$i = 0, $$sum109$i = 0;
 var $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$i24$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0;
 var $$sum14$pre$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0, $$sum2$pre$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0;
 var $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$pre$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i27 = 0, $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0;
 var $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0, $$sum8$pre = 0, $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0;
 var $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0;
 var $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0;
 var $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0;
 var $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0, $1073 = 0;
 var $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0;
 var $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0;
 var $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0;
 var $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0;
 var $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0;
 var $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0;
 var $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0;
 var $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0;
 var $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0;
 var $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0;
 var $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0;
 var $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0;
 var $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0;
 var $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0;
 var $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0;
 var $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0;
 var $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0;
 var $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0;
 var $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0;
 var $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0;
 var $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0;
 var $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0;
 var $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0;
 var $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0;
 var $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0;
 var $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0;
 var $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0;
 var $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0;
 var $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0;
 var $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0;
 var $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0;
 var $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0;
 var $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0;
 var $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0;
 var $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0;
 var $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0;
 var $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0;
 var $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0;
 var $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0, $F5$0$i = 0;
 var $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i18 = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i17 = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0;
 var $T$024$i = 0, $T$051$i$i = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i29 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond19$i = 0, $or$cond2$i = 0;
 var $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0;
 var $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$228$i = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0;
 var $v$330$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($bytes>>>0)<(245);
 do {
  if ($0) {
   $1 = ($bytes>>>0)<(11);
   if ($1) {
    $5 = 16;
   } else {
    $2 = (($bytes) + 11)|0;
    $3 = $2 & -8;
    $5 = $3;
   }
   $4 = $5 >>> 3;
   $6 = HEAP32[15144>>2]|0;
   $7 = $6 >>> $4;
   $8 = $7 & 3;
   $9 = ($8|0)==(0);
   if (!($9)) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = (($11) + ($4))|0;
    $13 = $12 << 1;
    $14 = ((15144 + ($13<<2)|0) + 40|0);
    $$sum10 = (($13) + 2)|0;
    $15 = ((15144 + ($$sum10<<2)|0) + 40|0);
    $16 = HEAP32[$15>>2]|0;
    $17 = (($16) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ($14|0)==($18|0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[15144>>2] = $22;
     } else {
      $23 = HEAP32[((15144 + 16|0))>>2]|0;
      $24 = ($18>>>0)<($23>>>0);
      if ($24) {
       _abort();
       // unreachable;
      }
      $25 = (($18) + 12|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = ($26|0)==($16|0);
      if ($27) {
       HEAP32[$25>>2] = $14;
       HEAP32[$15>>2] = $18;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = (($16) + 4|0);
    HEAP32[$30>>2] = $29;
    $$sum1112 = $28 | 4;
    $31 = (($16) + ($$sum1112)|0);
    $32 = HEAP32[$31>>2]|0;
    $33 = $32 | 1;
    HEAP32[$31>>2] = $33;
    $mem$0 = $17;
    STACKTOP = sp;return ($mem$0|0);
   }
   $34 = HEAP32[((15144 + 8|0))>>2]|0;
   $35 = ($5>>>0)>($34>>>0);
   if ($35) {
    $36 = ($7|0)==(0);
    if (!($36)) {
     $37 = $7 << $4;
     $38 = 2 << $4;
     $39 = (0 - ($38))|0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = (0 - ($41))|0;
     $43 = $41 & $42;
     $44 = (($43) + -1)|0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = (($62) + ($63))|0;
     $65 = $64 << 1;
     $66 = ((15144 + ($65<<2)|0) + 40|0);
     $$sum4 = (($65) + 2)|0;
     $67 = ((15144 + ($$sum4<<2)|0) + 40|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = (($68) + 8|0);
     $70 = HEAP32[$69>>2]|0;
     $71 = ($66|0)==($70|0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[15144>>2] = $74;
      } else {
       $75 = HEAP32[((15144 + 16|0))>>2]|0;
       $76 = ($70>>>0)<($75>>>0);
       if ($76) {
        _abort();
        // unreachable;
       }
       $77 = (($70) + 12|0);
       $78 = HEAP32[$77>>2]|0;
       $79 = ($78|0)==($68|0);
       if ($79) {
        HEAP32[$77>>2] = $66;
        HEAP32[$67>>2] = $70;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $80 = $64 << 3;
     $81 = (($80) - ($5))|0;
     $82 = $5 | 3;
     $83 = (($68) + 4|0);
     HEAP32[$83>>2] = $82;
     $84 = (($68) + ($5)|0);
     $85 = $81 | 1;
     $$sum56 = $5 | 4;
     $86 = (($68) + ($$sum56)|0);
     HEAP32[$86>>2] = $85;
     $87 = (($68) + ($80)|0);
     HEAP32[$87>>2] = $81;
     $88 = HEAP32[((15144 + 8|0))>>2]|0;
     $89 = ($88|0)==(0);
     if (!($89)) {
      $90 = HEAP32[((15144 + 20|0))>>2]|0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = ((15144 + ($92<<2)|0) + 40|0);
      $94 = HEAP32[15144>>2]|0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96|0)==(0);
      if ($97) {
       $98 = $94 | $95;
       HEAP32[15144>>2] = $98;
       $$sum8$pre = (($92) + 2)|0;
       $$pre = ((15144 + ($$sum8$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F4$0 = $93;
      } else {
       $$sum9 = (($92) + 2)|0;
       $99 = ((15144 + ($$sum9<<2)|0) + 40|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = HEAP32[((15144 + 16|0))>>2]|0;
       $102 = ($100>>>0)<($101>>>0);
       if ($102) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $99;$F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $90;
      $103 = (($F4$0) + 12|0);
      HEAP32[$103>>2] = $90;
      $104 = (($90) + 8|0);
      HEAP32[$104>>2] = $F4$0;
      $105 = (($90) + 12|0);
      HEAP32[$105>>2] = $93;
     }
     HEAP32[((15144 + 8|0))>>2] = $81;
     HEAP32[((15144 + 20|0))>>2] = $84;
     $mem$0 = $69;
     STACKTOP = sp;return ($mem$0|0);
    }
    $106 = HEAP32[((15144 + 4|0))>>2]|0;
    $107 = ($106|0)==(0);
    if ($107) {
     $nb$0 = $5;
    } else {
     $108 = (0 - ($106))|0;
     $109 = $106 & $108;
     $110 = (($109) + -1)|0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = (($128) + ($129))|0;
     $131 = ((15144 + ($130<<2)|0) + 304|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = (($132) + 4|0);
     $134 = HEAP32[$133>>2]|0;
     $135 = $134 & -8;
     $136 = (($135) - ($5))|0;
     $rsize$0$i = $136;$t$0$i = $132;$v$0$i = $132;
     while(1) {
      $137 = (($t$0$i) + 16|0);
      $138 = HEAP32[$137>>2]|0;
      $139 = ($138|0)==(0|0);
      if ($139) {
       $140 = (($t$0$i) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = (($144) + 4|0);
      $145 = HEAP32[$143>>2]|0;
      $146 = $145 & -8;
      $147 = (($146) - ($5))|0;
      $148 = ($147>>>0)<($rsize$0$i>>>0);
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;$t$0$i = $144;$v$0$i = $$v$0$i;
     }
     $149 = HEAP32[((15144 + 16|0))>>2]|0;
     $150 = ($v$0$i>>>0)<($149>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($v$0$i) + ($5)|0);
     $152 = ($v$0$i>>>0)<($151>>>0);
     if (!($152)) {
      _abort();
      // unreachable;
     }
     $153 = (($v$0$i) + 24|0);
     $154 = HEAP32[$153>>2]|0;
     $155 = (($v$0$i) + 12|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==($v$0$i|0);
     do {
      if ($157) {
       $167 = (($v$0$i) + 20|0);
       $168 = HEAP32[$167>>2]|0;
       $169 = ($168|0)==(0|0);
       if ($169) {
        $170 = (($v$0$i) + 16|0);
        $171 = HEAP32[$170>>2]|0;
        $172 = ($171|0)==(0|0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;$RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;$RP$0$i = $167;
       }
       while(1) {
        $173 = (($R$0$i) + 20|0);
        $174 = HEAP32[$173>>2]|0;
        $175 = ($174|0)==(0|0);
        if (!($175)) {
         $R$0$i = $174;$RP$0$i = $173;
         continue;
        }
        $176 = (($R$0$i) + 16|0);
        $177 = HEAP32[$176>>2]|0;
        $178 = ($177|0)==(0|0);
        if ($178) {
         break;
        } else {
         $R$0$i = $177;$RP$0$i = $176;
        }
       }
       $179 = ($RP$0$i>>>0)<($149>>>0);
       if ($179) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i>>2] = 0;
        $R$1$i = $R$0$i;
        break;
       }
      } else {
       $158 = (($v$0$i) + 8|0);
       $159 = HEAP32[$158>>2]|0;
       $160 = ($159>>>0)<($149>>>0);
       if ($160) {
        _abort();
        // unreachable;
       }
       $161 = (($159) + 12|0);
       $162 = HEAP32[$161>>2]|0;
       $163 = ($162|0)==($v$0$i|0);
       if (!($163)) {
        _abort();
        // unreachable;
       }
       $164 = (($156) + 8|0);
       $165 = HEAP32[$164>>2]|0;
       $166 = ($165|0)==($v$0$i|0);
       if ($166) {
        HEAP32[$161>>2] = $156;
        HEAP32[$164>>2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $180 = ($154|0)==(0|0);
     do {
      if (!($180)) {
       $181 = (($v$0$i) + 28|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = ((15144 + ($182<<2)|0) + 304|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($v$0$i|0)==($184|0);
       if ($185) {
        HEAP32[$183>>2] = $R$1$i;
        $cond$i = ($R$1$i|0)==(0|0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[((15144 + 4|0))>>2]|0;
         $189 = $188 & $187;
         HEAP32[((15144 + 4|0))>>2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[((15144 + 16|0))>>2]|0;
        $191 = ($154>>>0)<($190>>>0);
        if ($191) {
         _abort();
         // unreachable;
        }
        $192 = (($154) + 16|0);
        $193 = HEAP32[$192>>2]|0;
        $194 = ($193|0)==($v$0$i|0);
        if ($194) {
         HEAP32[$192>>2] = $R$1$i;
        } else {
         $195 = (($154) + 20|0);
         HEAP32[$195>>2] = $R$1$i;
        }
        $196 = ($R$1$i|0)==(0|0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[((15144 + 16|0))>>2]|0;
       $198 = ($R$1$i>>>0)<($197>>>0);
       if ($198) {
        _abort();
        // unreachable;
       }
       $199 = (($R$1$i) + 24|0);
       HEAP32[$199>>2] = $154;
       $200 = (($v$0$i) + 16|0);
       $201 = HEAP32[$200>>2]|0;
       $202 = ($201|0)==(0|0);
       do {
        if (!($202)) {
         $203 = HEAP32[((15144 + 16|0))>>2]|0;
         $204 = ($201>>>0)<($203>>>0);
         if ($204) {
          _abort();
          // unreachable;
         } else {
          $205 = (($R$1$i) + 16|0);
          HEAP32[$205>>2] = $201;
          $206 = (($201) + 24|0);
          HEAP32[$206>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $207 = (($v$0$i) + 20|0);
       $208 = HEAP32[$207>>2]|0;
       $209 = ($208|0)==(0|0);
       if (!($209)) {
        $210 = HEAP32[((15144 + 16|0))>>2]|0;
        $211 = ($208>>>0)<($210>>>0);
        if ($211) {
         _abort();
         // unreachable;
        } else {
         $212 = (($R$1$i) + 20|0);
         HEAP32[$212>>2] = $208;
         $213 = (($208) + 24|0);
         HEAP32[$213>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $214 = ($rsize$0$i>>>0)<(16);
     if ($214) {
      $215 = (($rsize$0$i) + ($5))|0;
      $216 = $215 | 3;
      $217 = (($v$0$i) + 4|0);
      HEAP32[$217>>2] = $216;
      $$sum4$i = (($215) + 4)|0;
      $218 = (($v$0$i) + ($$sum4$i)|0);
      $219 = HEAP32[$218>>2]|0;
      $220 = $219 | 1;
      HEAP32[$218>>2] = $220;
     } else {
      $221 = $5 | 3;
      $222 = (($v$0$i) + 4|0);
      HEAP32[$222>>2] = $221;
      $223 = $rsize$0$i | 1;
      $$sum$i35 = $5 | 4;
      $224 = (($v$0$i) + ($$sum$i35)|0);
      HEAP32[$224>>2] = $223;
      $$sum1$i = (($rsize$0$i) + ($5))|0;
      $225 = (($v$0$i) + ($$sum1$i)|0);
      HEAP32[$225>>2] = $rsize$0$i;
      $226 = HEAP32[((15144 + 8|0))>>2]|0;
      $227 = ($226|0)==(0);
      if (!($227)) {
       $228 = HEAP32[((15144 + 20|0))>>2]|0;
       $229 = $226 >>> 3;
       $230 = $229 << 1;
       $231 = ((15144 + ($230<<2)|0) + 40|0);
       $232 = HEAP32[15144>>2]|0;
       $233 = 1 << $229;
       $234 = $232 & $233;
       $235 = ($234|0)==(0);
       if ($235) {
        $236 = $232 | $233;
        HEAP32[15144>>2] = $236;
        $$sum2$pre$i = (($230) + 2)|0;
        $$pre$i = ((15144 + ($$sum2$pre$i<<2)|0) + 40|0);
        $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $231;
       } else {
        $$sum3$i = (($230) + 2)|0;
        $237 = ((15144 + ($$sum3$i<<2)|0) + 40|0);
        $238 = HEAP32[$237>>2]|0;
        $239 = HEAP32[((15144 + 16|0))>>2]|0;
        $240 = ($238>>>0)<($239>>>0);
        if ($240) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $237;$F1$0$i = $238;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $228;
       $241 = (($F1$0$i) + 12|0);
       HEAP32[$241>>2] = $228;
       $242 = (($228) + 8|0);
       HEAP32[$242>>2] = $F1$0$i;
       $243 = (($228) + 12|0);
       HEAP32[$243>>2] = $231;
      }
      HEAP32[((15144 + 8|0))>>2] = $rsize$0$i;
      HEAP32[((15144 + 20|0))>>2] = $151;
     }
     $244 = (($v$0$i) + 8|0);
     $mem$0 = $244;
     STACKTOP = sp;return ($mem$0|0);
    }
   } else {
    $nb$0 = $5;
   }
  } else {
   $245 = ($bytes>>>0)>(4294967231);
   if ($245) {
    $nb$0 = -1;
   } else {
    $246 = (($bytes) + 11)|0;
    $247 = $246 & -8;
    $248 = HEAP32[((15144 + 4|0))>>2]|0;
    $249 = ($248|0)==(0);
    if ($249) {
     $nb$0 = $247;
    } else {
     $250 = (0 - ($247))|0;
     $251 = $246 >>> 8;
     $252 = ($251|0)==(0);
     if ($252) {
      $idx$0$i = 0;
     } else {
      $253 = ($247>>>0)>(16777215);
      if ($253) {
       $idx$0$i = 31;
      } else {
       $254 = (($251) + 1048320)|0;
       $255 = $254 >>> 16;
       $256 = $255 & 8;
       $257 = $251 << $256;
       $258 = (($257) + 520192)|0;
       $259 = $258 >>> 16;
       $260 = $259 & 4;
       $261 = $260 | $256;
       $262 = $257 << $260;
       $263 = (($262) + 245760)|0;
       $264 = $263 >>> 16;
       $265 = $264 & 2;
       $266 = $261 | $265;
       $267 = (14 - ($266))|0;
       $268 = $262 << $265;
       $269 = $268 >>> 15;
       $270 = (($267) + ($269))|0;
       $271 = $270 << 1;
       $272 = (($270) + 7)|0;
       $273 = $247 >>> $272;
       $274 = $273 & 1;
       $275 = $274 | $271;
       $idx$0$i = $275;
      }
     }
     $276 = ((15144 + ($idx$0$i<<2)|0) + 304|0);
     $277 = HEAP32[$276>>2]|0;
     $278 = ($277|0)==(0|0);
     L126: do {
      if ($278) {
       $rsize$2$i = $250;$t$1$i = 0;$v$2$i = 0;
      } else {
       $279 = ($idx$0$i|0)==(31);
       if ($279) {
        $283 = 0;
       } else {
        $280 = $idx$0$i >>> 1;
        $281 = (25 - ($280))|0;
        $283 = $281;
       }
       $282 = $247 << $283;
       $rsize$0$i15 = $250;$rst$0$i = 0;$sizebits$0$i = $282;$t$0$i14 = $277;$v$0$i16 = 0;
       while(1) {
        $284 = (($t$0$i14) + 4|0);
        $285 = HEAP32[$284>>2]|0;
        $286 = $285 & -8;
        $287 = (($286) - ($247))|0;
        $288 = ($287>>>0)<($rsize$0$i15>>>0);
        if ($288) {
         $289 = ($286|0)==($247|0);
         if ($289) {
          $rsize$2$i = $287;$t$1$i = $t$0$i14;$v$2$i = $t$0$i14;
          break L126;
         } else {
          $rsize$1$i = $287;$v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
        }
        $290 = (($t$0$i14) + 20|0);
        $291 = HEAP32[$290>>2]|0;
        $292 = $sizebits$0$i >>> 31;
        $293 = ((($t$0$i14) + ($292<<2)|0) + 16|0);
        $294 = HEAP32[$293>>2]|0;
        $295 = ($291|0)==(0|0);
        $296 = ($291|0)==($294|0);
        $or$cond$i = $295 | $296;
        $rst$1$i = $or$cond$i ? $rst$0$i : $291;
        $297 = ($294|0)==(0|0);
        $298 = $sizebits$0$i << 1;
        if ($297) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $298;$t$0$i14 = $294;$v$0$i16 = $v$1$i;
        }
       }
      }
     } while(0);
     $299 = ($t$1$i|0)==(0|0);
     $300 = ($v$2$i|0)==(0|0);
     $or$cond19$i = $299 & $300;
     if ($or$cond19$i) {
      $301 = 2 << $idx$0$i;
      $302 = (0 - ($301))|0;
      $303 = $301 | $302;
      $304 = $248 & $303;
      $305 = ($304|0)==(0);
      if ($305) {
       $nb$0 = $247;
       break;
      }
      $306 = (0 - ($304))|0;
      $307 = $304 & $306;
      $308 = (($307) + -1)|0;
      $309 = $308 >>> 12;
      $310 = $309 & 16;
      $311 = $308 >>> $310;
      $312 = $311 >>> 5;
      $313 = $312 & 8;
      $314 = $313 | $310;
      $315 = $311 >>> $313;
      $316 = $315 >>> 2;
      $317 = $316 & 4;
      $318 = $314 | $317;
      $319 = $315 >>> $317;
      $320 = $319 >>> 1;
      $321 = $320 & 2;
      $322 = $318 | $321;
      $323 = $319 >>> $321;
      $324 = $323 >>> 1;
      $325 = $324 & 1;
      $326 = $322 | $325;
      $327 = $323 >>> $325;
      $328 = (($326) + ($327))|0;
      $329 = ((15144 + ($328<<2)|0) + 304|0);
      $330 = HEAP32[$329>>2]|0;
      $t$2$ph$i = $330;
     } else {
      $t$2$ph$i = $t$1$i;
     }
     $331 = ($t$2$ph$i|0)==(0|0);
     if ($331) {
      $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
     } else {
      $rsize$329$i = $rsize$2$i;$t$228$i = $t$2$ph$i;$v$330$i = $v$2$i;
      while(1) {
       $332 = (($t$228$i) + 4|0);
       $333 = HEAP32[$332>>2]|0;
       $334 = $333 & -8;
       $335 = (($334) - ($247))|0;
       $336 = ($335>>>0)<($rsize$329$i>>>0);
       $$rsize$3$i = $336 ? $335 : $rsize$329$i;
       $t$2$v$3$i = $336 ? $t$228$i : $v$330$i;
       $337 = (($t$228$i) + 16|0);
       $338 = HEAP32[$337>>2]|0;
       $339 = ($338|0)==(0|0);
       if (!($339)) {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $338;$v$330$i = $t$2$v$3$i;
        continue;
       }
       $340 = (($t$228$i) + 20|0);
       $341 = HEAP32[$340>>2]|0;
       $342 = ($341|0)==(0|0);
       if ($342) {
        $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $341;$v$330$i = $t$2$v$3$i;
       }
      }
     }
     $343 = ($v$3$lcssa$i|0)==(0|0);
     if ($343) {
      $nb$0 = $247;
     } else {
      $344 = HEAP32[((15144 + 8|0))>>2]|0;
      $345 = (($344) - ($247))|0;
      $346 = ($rsize$3$lcssa$i>>>0)<($345>>>0);
      if ($346) {
       $347 = HEAP32[((15144 + 16|0))>>2]|0;
       $348 = ($v$3$lcssa$i>>>0)<($347>>>0);
       if ($348) {
        _abort();
        // unreachable;
       }
       $349 = (($v$3$lcssa$i) + ($247)|0);
       $350 = ($v$3$lcssa$i>>>0)<($349>>>0);
       if (!($350)) {
        _abort();
        // unreachable;
       }
       $351 = (($v$3$lcssa$i) + 24|0);
       $352 = HEAP32[$351>>2]|0;
       $353 = (($v$3$lcssa$i) + 12|0);
       $354 = HEAP32[$353>>2]|0;
       $355 = ($354|0)==($v$3$lcssa$i|0);
       do {
        if ($355) {
         $365 = (($v$3$lcssa$i) + 20|0);
         $366 = HEAP32[$365>>2]|0;
         $367 = ($366|0)==(0|0);
         if ($367) {
          $368 = (($v$3$lcssa$i) + 16|0);
          $369 = HEAP32[$368>>2]|0;
          $370 = ($369|0)==(0|0);
          if ($370) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $369;$RP$0$i17 = $368;
          }
         } else {
          $R$0$i18 = $366;$RP$0$i17 = $365;
         }
         while(1) {
          $371 = (($R$0$i18) + 20|0);
          $372 = HEAP32[$371>>2]|0;
          $373 = ($372|0)==(0|0);
          if (!($373)) {
           $R$0$i18 = $372;$RP$0$i17 = $371;
           continue;
          }
          $374 = (($R$0$i18) + 16|0);
          $375 = HEAP32[$374>>2]|0;
          $376 = ($375|0)==(0|0);
          if ($376) {
           break;
          } else {
           $R$0$i18 = $375;$RP$0$i17 = $374;
          }
         }
         $377 = ($RP$0$i17>>>0)<($347>>>0);
         if ($377) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i17>>2] = 0;
          $R$1$i20 = $R$0$i18;
          break;
         }
        } else {
         $356 = (($v$3$lcssa$i) + 8|0);
         $357 = HEAP32[$356>>2]|0;
         $358 = ($357>>>0)<($347>>>0);
         if ($358) {
          _abort();
          // unreachable;
         }
         $359 = (($357) + 12|0);
         $360 = HEAP32[$359>>2]|0;
         $361 = ($360|0)==($v$3$lcssa$i|0);
         if (!($361)) {
          _abort();
          // unreachable;
         }
         $362 = (($354) + 8|0);
         $363 = HEAP32[$362>>2]|0;
         $364 = ($363|0)==($v$3$lcssa$i|0);
         if ($364) {
          HEAP32[$359>>2] = $354;
          HEAP32[$362>>2] = $357;
          $R$1$i20 = $354;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $378 = ($352|0)==(0|0);
       do {
        if (!($378)) {
         $379 = (($v$3$lcssa$i) + 28|0);
         $380 = HEAP32[$379>>2]|0;
         $381 = ((15144 + ($380<<2)|0) + 304|0);
         $382 = HEAP32[$381>>2]|0;
         $383 = ($v$3$lcssa$i|0)==($382|0);
         if ($383) {
          HEAP32[$381>>2] = $R$1$i20;
          $cond$i21 = ($R$1$i20|0)==(0|0);
          if ($cond$i21) {
           $384 = 1 << $380;
           $385 = $384 ^ -1;
           $386 = HEAP32[((15144 + 4|0))>>2]|0;
           $387 = $386 & $385;
           HEAP32[((15144 + 4|0))>>2] = $387;
           break;
          }
         } else {
          $388 = HEAP32[((15144 + 16|0))>>2]|0;
          $389 = ($352>>>0)<($388>>>0);
          if ($389) {
           _abort();
           // unreachable;
          }
          $390 = (($352) + 16|0);
          $391 = HEAP32[$390>>2]|0;
          $392 = ($391|0)==($v$3$lcssa$i|0);
          if ($392) {
           HEAP32[$390>>2] = $R$1$i20;
          } else {
           $393 = (($352) + 20|0);
           HEAP32[$393>>2] = $R$1$i20;
          }
          $394 = ($R$1$i20|0)==(0|0);
          if ($394) {
           break;
          }
         }
         $395 = HEAP32[((15144 + 16|0))>>2]|0;
         $396 = ($R$1$i20>>>0)<($395>>>0);
         if ($396) {
          _abort();
          // unreachable;
         }
         $397 = (($R$1$i20) + 24|0);
         HEAP32[$397>>2] = $352;
         $398 = (($v$3$lcssa$i) + 16|0);
         $399 = HEAP32[$398>>2]|0;
         $400 = ($399|0)==(0|0);
         do {
          if (!($400)) {
           $401 = HEAP32[((15144 + 16|0))>>2]|0;
           $402 = ($399>>>0)<($401>>>0);
           if ($402) {
            _abort();
            // unreachable;
           } else {
            $403 = (($R$1$i20) + 16|0);
            HEAP32[$403>>2] = $399;
            $404 = (($399) + 24|0);
            HEAP32[$404>>2] = $R$1$i20;
            break;
           }
          }
         } while(0);
         $405 = (($v$3$lcssa$i) + 20|0);
         $406 = HEAP32[$405>>2]|0;
         $407 = ($406|0)==(0|0);
         if (!($407)) {
          $408 = HEAP32[((15144 + 16|0))>>2]|0;
          $409 = ($406>>>0)<($408>>>0);
          if ($409) {
           _abort();
           // unreachable;
          } else {
           $410 = (($R$1$i20) + 20|0);
           HEAP32[$410>>2] = $406;
           $411 = (($406) + 24|0);
           HEAP32[$411>>2] = $R$1$i20;
           break;
          }
         }
        }
       } while(0);
       $412 = ($rsize$3$lcssa$i>>>0)<(16);
       L204: do {
        if ($412) {
         $413 = (($rsize$3$lcssa$i) + ($247))|0;
         $414 = $413 | 3;
         $415 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$415>>2] = $414;
         $$sum18$i = (($413) + 4)|0;
         $416 = (($v$3$lcssa$i) + ($$sum18$i)|0);
         $417 = HEAP32[$416>>2]|0;
         $418 = $417 | 1;
         HEAP32[$416>>2] = $418;
        } else {
         $419 = $247 | 3;
         $420 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$420>>2] = $419;
         $421 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $247 | 4;
         $422 = (($v$3$lcssa$i) + ($$sum$i2334)|0);
         HEAP32[$422>>2] = $421;
         $$sum1$i24 = (($rsize$3$lcssa$i) + ($247))|0;
         $423 = (($v$3$lcssa$i) + ($$sum1$i24)|0);
         HEAP32[$423>>2] = $rsize$3$lcssa$i;
         $424 = $rsize$3$lcssa$i >>> 3;
         $425 = ($rsize$3$lcssa$i>>>0)<(256);
         if ($425) {
          $426 = $424 << 1;
          $427 = ((15144 + ($426<<2)|0) + 40|0);
          $428 = HEAP32[15144>>2]|0;
          $429 = 1 << $424;
          $430 = $428 & $429;
          $431 = ($430|0)==(0);
          if ($431) {
           $432 = $428 | $429;
           HEAP32[15144>>2] = $432;
           $$sum14$pre$i = (($426) + 2)|0;
           $$pre$i25 = ((15144 + ($$sum14$pre$i<<2)|0) + 40|0);
           $$pre$phi$i26Z2D = $$pre$i25;$F5$0$i = $427;
          } else {
           $$sum17$i = (($426) + 2)|0;
           $433 = ((15144 + ($$sum17$i<<2)|0) + 40|0);
           $434 = HEAP32[$433>>2]|0;
           $435 = HEAP32[((15144 + 16|0))>>2]|0;
           $436 = ($434>>>0)<($435>>>0);
           if ($436) {
            _abort();
            // unreachable;
           } else {
            $$pre$phi$i26Z2D = $433;$F5$0$i = $434;
           }
          }
          HEAP32[$$pre$phi$i26Z2D>>2] = $349;
          $437 = (($F5$0$i) + 12|0);
          HEAP32[$437>>2] = $349;
          $$sum15$i = (($247) + 8)|0;
          $438 = (($v$3$lcssa$i) + ($$sum15$i)|0);
          HEAP32[$438>>2] = $F5$0$i;
          $$sum16$i = (($247) + 12)|0;
          $439 = (($v$3$lcssa$i) + ($$sum16$i)|0);
          HEAP32[$439>>2] = $427;
          break;
         }
         $440 = $rsize$3$lcssa$i >>> 8;
         $441 = ($440|0)==(0);
         if ($441) {
          $I7$0$i = 0;
         } else {
          $442 = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($442) {
           $I7$0$i = 31;
          } else {
           $443 = (($440) + 1048320)|0;
           $444 = $443 >>> 16;
           $445 = $444 & 8;
           $446 = $440 << $445;
           $447 = (($446) + 520192)|0;
           $448 = $447 >>> 16;
           $449 = $448 & 4;
           $450 = $449 | $445;
           $451 = $446 << $449;
           $452 = (($451) + 245760)|0;
           $453 = $452 >>> 16;
           $454 = $453 & 2;
           $455 = $450 | $454;
           $456 = (14 - ($455))|0;
           $457 = $451 << $454;
           $458 = $457 >>> 15;
           $459 = (($456) + ($458))|0;
           $460 = $459 << 1;
           $461 = (($459) + 7)|0;
           $462 = $rsize$3$lcssa$i >>> $461;
           $463 = $462 & 1;
           $464 = $463 | $460;
           $I7$0$i = $464;
          }
         }
         $465 = ((15144 + ($I7$0$i<<2)|0) + 304|0);
         $$sum2$i = (($247) + 28)|0;
         $466 = (($v$3$lcssa$i) + ($$sum2$i)|0);
         HEAP32[$466>>2] = $I7$0$i;
         $$sum3$i27 = (($247) + 16)|0;
         $467 = (($v$3$lcssa$i) + ($$sum3$i27)|0);
         $$sum4$i28 = (($247) + 20)|0;
         $468 = (($v$3$lcssa$i) + ($$sum4$i28)|0);
         HEAP32[$468>>2] = 0;
         HEAP32[$467>>2] = 0;
         $469 = HEAP32[((15144 + 4|0))>>2]|0;
         $470 = 1 << $I7$0$i;
         $471 = $469 & $470;
         $472 = ($471|0)==(0);
         if ($472) {
          $473 = $469 | $470;
          HEAP32[((15144 + 4|0))>>2] = $473;
          HEAP32[$465>>2] = $349;
          $$sum5$i = (($247) + 24)|0;
          $474 = (($v$3$lcssa$i) + ($$sum5$i)|0);
          HEAP32[$474>>2] = $465;
          $$sum6$i = (($247) + 12)|0;
          $475 = (($v$3$lcssa$i) + ($$sum6$i)|0);
          HEAP32[$475>>2] = $349;
          $$sum7$i = (($247) + 8)|0;
          $476 = (($v$3$lcssa$i) + ($$sum7$i)|0);
          HEAP32[$476>>2] = $349;
          break;
         }
         $477 = HEAP32[$465>>2]|0;
         $478 = ($I7$0$i|0)==(31);
         if ($478) {
          $486 = 0;
         } else {
          $479 = $I7$0$i >>> 1;
          $480 = (25 - ($479))|0;
          $486 = $480;
         }
         $481 = (($477) + 4|0);
         $482 = HEAP32[$481>>2]|0;
         $483 = $482 & -8;
         $484 = ($483|0)==($rsize$3$lcssa$i|0);
         L225: do {
          if ($484) {
           $T$0$lcssa$i = $477;
          } else {
           $485 = $rsize$3$lcssa$i << $486;
           $K12$025$i = $485;$T$024$i = $477;
           while(1) {
            $493 = $K12$025$i >>> 31;
            $494 = ((($T$024$i) + ($493<<2)|0) + 16|0);
            $489 = HEAP32[$494>>2]|0;
            $495 = ($489|0)==(0|0);
            if ($495) {
             break;
            }
            $487 = $K12$025$i << 1;
            $488 = (($489) + 4|0);
            $490 = HEAP32[$488>>2]|0;
            $491 = $490 & -8;
            $492 = ($491|0)==($rsize$3$lcssa$i|0);
            if ($492) {
             $T$0$lcssa$i = $489;
             break L225;
            } else {
             $K12$025$i = $487;$T$024$i = $489;
            }
           }
           $496 = HEAP32[((15144 + 16|0))>>2]|0;
           $497 = ($494>>>0)<($496>>>0);
           if ($497) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$494>>2] = $349;
            $$sum11$i = (($247) + 24)|0;
            $498 = (($v$3$lcssa$i) + ($$sum11$i)|0);
            HEAP32[$498>>2] = $T$024$i;
            $$sum12$i = (($247) + 12)|0;
            $499 = (($v$3$lcssa$i) + ($$sum12$i)|0);
            HEAP32[$499>>2] = $349;
            $$sum13$i = (($247) + 8)|0;
            $500 = (($v$3$lcssa$i) + ($$sum13$i)|0);
            HEAP32[$500>>2] = $349;
            break L204;
           }
          }
         } while(0);
         $501 = (($T$0$lcssa$i) + 8|0);
         $502 = HEAP32[$501>>2]|0;
         $503 = HEAP32[((15144 + 16|0))>>2]|0;
         $504 = ($T$0$lcssa$i>>>0)<($503>>>0);
         if ($504) {
          _abort();
          // unreachable;
         }
         $505 = ($502>>>0)<($503>>>0);
         if ($505) {
          _abort();
          // unreachable;
         } else {
          $506 = (($502) + 12|0);
          HEAP32[$506>>2] = $349;
          HEAP32[$501>>2] = $349;
          $$sum8$i = (($247) + 8)|0;
          $507 = (($v$3$lcssa$i) + ($$sum8$i)|0);
          HEAP32[$507>>2] = $502;
          $$sum9$i = (($247) + 12)|0;
          $508 = (($v$3$lcssa$i) + ($$sum9$i)|0);
          HEAP32[$508>>2] = $T$0$lcssa$i;
          $$sum10$i = (($247) + 24)|0;
          $509 = (($v$3$lcssa$i) + ($$sum10$i)|0);
          HEAP32[$509>>2] = 0;
          break;
         }
        }
       } while(0);
       $510 = (($v$3$lcssa$i) + 8|0);
       $mem$0 = $510;
       STACKTOP = sp;return ($mem$0|0);
      } else {
       $nb$0 = $247;
      }
     }
    }
   }
  }
 } while(0);
 $511 = HEAP32[((15144 + 8|0))>>2]|0;
 $512 = ($nb$0>>>0)>($511>>>0);
 if (!($512)) {
  $513 = (($511) - ($nb$0))|0;
  $514 = HEAP32[((15144 + 20|0))>>2]|0;
  $515 = ($513>>>0)>(15);
  if ($515) {
   $516 = (($514) + ($nb$0)|0);
   HEAP32[((15144 + 20|0))>>2] = $516;
   HEAP32[((15144 + 8|0))>>2] = $513;
   $517 = $513 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $518 = (($514) + ($$sum2)|0);
   HEAP32[$518>>2] = $517;
   $519 = (($514) + ($511)|0);
   HEAP32[$519>>2] = $513;
   $520 = $nb$0 | 3;
   $521 = (($514) + 4|0);
   HEAP32[$521>>2] = $520;
  } else {
   HEAP32[((15144 + 8|0))>>2] = 0;
   HEAP32[((15144 + 20|0))>>2] = 0;
   $522 = $511 | 3;
   $523 = (($514) + 4|0);
   HEAP32[$523>>2] = $522;
   $$sum1 = (($511) + 4)|0;
   $524 = (($514) + ($$sum1)|0);
   $525 = HEAP32[$524>>2]|0;
   $526 = $525 | 1;
   HEAP32[$524>>2] = $526;
  }
  $527 = (($514) + 8|0);
  $mem$0 = $527;
  STACKTOP = sp;return ($mem$0|0);
 }
 $528 = HEAP32[((15144 + 12|0))>>2]|0;
 $529 = ($nb$0>>>0)<($528>>>0);
 if ($529) {
  $530 = (($528) - ($nb$0))|0;
  HEAP32[((15144 + 12|0))>>2] = $530;
  $531 = HEAP32[((15144 + 24|0))>>2]|0;
  $532 = (($531) + ($nb$0)|0);
  HEAP32[((15144 + 24|0))>>2] = $532;
  $533 = $530 | 1;
  $$sum = (($nb$0) + 4)|0;
  $534 = (($531) + ($$sum)|0);
  HEAP32[$534>>2] = $533;
  $535 = $nb$0 | 3;
  $536 = (($531) + 4|0);
  HEAP32[$536>>2] = $535;
  $537 = (($531) + 8|0);
  $mem$0 = $537;
  STACKTOP = sp;return ($mem$0|0);
 }
 $538 = HEAP32[15616>>2]|0;
 $539 = ($538|0)==(0);
 do {
  if ($539) {
   $540 = (_sysconf(30)|0);
   $541 = (($540) + -1)|0;
   $542 = $541 & $540;
   $543 = ($542|0)==(0);
   if ($543) {
    HEAP32[((15616 + 8|0))>>2] = $540;
    HEAP32[((15616 + 4|0))>>2] = $540;
    HEAP32[((15616 + 12|0))>>2] = -1;
    HEAP32[((15616 + 16|0))>>2] = -1;
    HEAP32[((15616 + 20|0))>>2] = 0;
    HEAP32[((15144 + 444|0))>>2] = 0;
    $544 = (_time((0|0))|0);
    $545 = $544 & -16;
    $546 = $545 ^ 1431655768;
    HEAP32[15616>>2] = $546;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $547 = (($nb$0) + 48)|0;
 $548 = HEAP32[((15616 + 8|0))>>2]|0;
 $549 = (($nb$0) + 47)|0;
 $550 = (($548) + ($549))|0;
 $551 = (0 - ($548))|0;
 $552 = $550 & $551;
 $553 = ($552>>>0)>($nb$0>>>0);
 if (!($553)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $554 = HEAP32[((15144 + 440|0))>>2]|0;
 $555 = ($554|0)==(0);
 if (!($555)) {
  $556 = HEAP32[((15144 + 432|0))>>2]|0;
  $557 = (($556) + ($552))|0;
  $558 = ($557>>>0)<=($556>>>0);
  $559 = ($557>>>0)>($554>>>0);
  $or$cond1$i = $558 | $559;
  if ($or$cond1$i) {
   $mem$0 = 0;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $560 = HEAP32[((15144 + 444|0))>>2]|0;
 $561 = $560 & 4;
 $562 = ($561|0)==(0);
 L269: do {
  if ($562) {
   $563 = HEAP32[((15144 + 24|0))>>2]|0;
   $564 = ($563|0)==(0|0);
   L271: do {
    if ($564) {
     label = 182;
    } else {
     $sp$0$i$i = ((15144 + 448|0));
     while(1) {
      $565 = HEAP32[$sp$0$i$i>>2]|0;
      $566 = ($565>>>0)>($563>>>0);
      if (!($566)) {
       $567 = (($sp$0$i$i) + 4|0);
       $568 = HEAP32[$567>>2]|0;
       $569 = (($565) + ($568)|0);
       $570 = ($569>>>0)>($563>>>0);
       if ($570) {
        break;
       }
      }
      $571 = (($sp$0$i$i) + 8|0);
      $572 = HEAP32[$571>>2]|0;
      $573 = ($572|0)==(0|0);
      if ($573) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $572;
      }
     }
     $574 = ($sp$0$i$i|0)==(0|0);
     if ($574) {
      label = 182;
     } else {
      $597 = HEAP32[((15144 + 12|0))>>2]|0;
      $598 = (($550) - ($597))|0;
      $599 = $598 & $551;
      $600 = ($599>>>0)<(2147483647);
      if ($600) {
       $601 = (_sbrk(($599|0))|0);
       $602 = HEAP32[$sp$0$i$i>>2]|0;
       $603 = HEAP32[$567>>2]|0;
       $604 = (($602) + ($603)|0);
       $605 = ($601|0)==($604|0);
       $$3$i = $605 ? $599 : 0;
       $$4$i = $605 ? $601 : (-1);
       $br$0$i = $601;$ssize$1$i = $599;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $575 = (_sbrk(0)|0);
     $576 = ($575|0)==((-1)|0);
     if ($576) {
      $tsize$0323841$i = 0;
     } else {
      $577 = $575;
      $578 = HEAP32[((15616 + 4|0))>>2]|0;
      $579 = (($578) + -1)|0;
      $580 = $579 & $577;
      $581 = ($580|0)==(0);
      if ($581) {
       $ssize$0$i = $552;
      } else {
       $582 = (($579) + ($577))|0;
       $583 = (0 - ($578))|0;
       $584 = $582 & $583;
       $585 = (($552) - ($577))|0;
       $586 = (($585) + ($584))|0;
       $ssize$0$i = $586;
      }
      $587 = HEAP32[((15144 + 432|0))>>2]|0;
      $588 = (($587) + ($ssize$0$i))|0;
      $589 = ($ssize$0$i>>>0)>($nb$0>>>0);
      $590 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i29 = $589 & $590;
      if ($or$cond$i29) {
       $591 = HEAP32[((15144 + 440|0))>>2]|0;
       $592 = ($591|0)==(0);
       if (!($592)) {
        $593 = ($588>>>0)<=($587>>>0);
        $594 = ($588>>>0)>($591>>>0);
        $or$cond2$i = $593 | $594;
        if ($or$cond2$i) {
         $tsize$0323841$i = 0;
         break;
        }
       }
       $595 = (_sbrk(($ssize$0$i|0))|0);
       $596 = ($595|0)==($575|0);
       $ssize$0$$i = $596 ? $ssize$0$i : 0;
       $$$i = $596 ? $575 : (-1);
       $br$0$i = $595;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $606 = (0 - ($ssize$1$i))|0;
     $607 = ($tbase$0$i|0)==((-1)|0);
     if (!($607)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $608 = ($br$0$i|0)!=((-1)|0);
     $609 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $608 & $609;
     $610 = ($ssize$1$i>>>0)<($547>>>0);
     $or$cond6$i = $or$cond5$i & $610;
     do {
      if ($or$cond6$i) {
       $611 = HEAP32[((15616 + 8|0))>>2]|0;
       $612 = (($549) - ($ssize$1$i))|0;
       $613 = (($612) + ($611))|0;
       $614 = (0 - ($611))|0;
       $615 = $613 & $614;
       $616 = ($615>>>0)<(2147483647);
       if ($616) {
        $617 = (_sbrk(($615|0))|0);
        $618 = ($617|0)==((-1)|0);
        if ($618) {
         (_sbrk(($606|0))|0);
         $tsize$0323841$i = $tsize$0$i;
         break L291;
        } else {
         $619 = (($615) + ($ssize$1$i))|0;
         $ssize$2$i = $619;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$i;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     $620 = ($br$0$i|0)==((-1)|0);
     if ($620) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $621 = HEAP32[((15144 + 444|0))>>2]|0;
   $622 = $621 | 4;
   HEAP32[((15144 + 444|0))>>2] = $622;
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 if ((label|0) == 199) {
  $623 = ($552>>>0)<(2147483647);
  if ($623) {
   $624 = (_sbrk(($552|0))|0);
   $625 = (_sbrk(0)|0);
   $notlhs$i = ($624|0)!=((-1)|0);
   $notrhs$i = ($625|0)!=((-1)|0);
   $or$cond8$not$i = $notrhs$i & $notlhs$i;
   $626 = ($624>>>0)<($625>>>0);
   $or$cond9$i = $or$cond8$not$i & $626;
   if ($or$cond9$i) {
    $627 = $625;
    $628 = $624;
    $629 = (($627) - ($628))|0;
    $630 = (($nb$0) + 40)|0;
    $631 = ($629>>>0)>($630>>>0);
    $$tsize$1$i = $631 ? $629 : $tsize$1$i;
    if ($631) {
     $tbase$247$i = $624;$tsize$246$i = $$tsize$1$i;
     label = 202;
    }
   }
  }
 }
 if ((label|0) == 202) {
  $632 = HEAP32[((15144 + 432|0))>>2]|0;
  $633 = (($632) + ($tsize$246$i))|0;
  HEAP32[((15144 + 432|0))>>2] = $633;
  $634 = HEAP32[((15144 + 436|0))>>2]|0;
  $635 = ($633>>>0)>($634>>>0);
  if ($635) {
   HEAP32[((15144 + 436|0))>>2] = $633;
  }
  $636 = HEAP32[((15144 + 24|0))>>2]|0;
  $637 = ($636|0)==(0|0);
  L311: do {
   if ($637) {
    $638 = HEAP32[((15144 + 16|0))>>2]|0;
    $639 = ($638|0)==(0|0);
    $640 = ($tbase$247$i>>>0)<($638>>>0);
    $or$cond10$i = $639 | $640;
    if ($or$cond10$i) {
     HEAP32[((15144 + 16|0))>>2] = $tbase$247$i;
    }
    HEAP32[((15144 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((15144 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((15144 + 460|0))>>2] = 0;
    $641 = HEAP32[15616>>2]|0;
    HEAP32[((15144 + 36|0))>>2] = $641;
    HEAP32[((15144 + 32|0))>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $642 = $i$02$i$i << 1;
     $643 = ((15144 + ($642<<2)|0) + 40|0);
     $$sum$i$i = (($642) + 3)|0;
     $644 = ((15144 + ($$sum$i$i<<2)|0) + 40|0);
     HEAP32[$644>>2] = $643;
     $$sum1$i$i = (($642) + 2)|0;
     $645 = ((15144 + ($$sum1$i$i<<2)|0) + 40|0);
     HEAP32[$645>>2] = $643;
     $646 = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($646|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $646;
     }
    }
    $647 = (($tsize$246$i) + -40)|0;
    $648 = (($tbase$247$i) + 8|0);
    $649 = $648;
    $650 = $649 & 7;
    $651 = ($650|0)==(0);
    if ($651) {
     $655 = 0;
    } else {
     $652 = (0 - ($649))|0;
     $653 = $652 & 7;
     $655 = $653;
    }
    $654 = (($tbase$247$i) + ($655)|0);
    $656 = (($647) - ($655))|0;
    HEAP32[((15144 + 24|0))>>2] = $654;
    HEAP32[((15144 + 12|0))>>2] = $656;
    $657 = $656 | 1;
    $$sum$i14$i = (($655) + 4)|0;
    $658 = (($tbase$247$i) + ($$sum$i14$i)|0);
    HEAP32[$658>>2] = $657;
    $$sum2$i$i = (($tsize$246$i) + -36)|0;
    $659 = (($tbase$247$i) + ($$sum2$i$i)|0);
    HEAP32[$659>>2] = 40;
    $660 = HEAP32[((15616 + 16|0))>>2]|0;
    HEAP32[((15144 + 28|0))>>2] = $660;
   } else {
    $sp$075$i = ((15144 + 448|0));
    while(1) {
     $661 = HEAP32[$sp$075$i>>2]|0;
     $662 = (($sp$075$i) + 4|0);
     $663 = HEAP32[$662>>2]|0;
     $664 = (($661) + ($663)|0);
     $665 = ($tbase$247$i|0)==($664|0);
     if ($665) {
      label = 214;
      break;
     }
     $666 = (($sp$075$i) + 8|0);
     $667 = HEAP32[$666>>2]|0;
     $668 = ($667|0)==(0|0);
     if ($668) {
      break;
     } else {
      $sp$075$i = $667;
     }
    }
    if ((label|0) == 214) {
     $669 = (($sp$075$i) + 12|0);
     $670 = HEAP32[$669>>2]|0;
     $671 = $670 & 8;
     $672 = ($671|0)==(0);
     if ($672) {
      $673 = ($636>>>0)>=($661>>>0);
      $674 = ($636>>>0)<($tbase$247$i>>>0);
      $or$cond49$i = $673 & $674;
      if ($or$cond49$i) {
       $675 = (($663) + ($tsize$246$i))|0;
       HEAP32[$662>>2] = $675;
       $676 = HEAP32[((15144 + 12|0))>>2]|0;
       $677 = (($676) + ($tsize$246$i))|0;
       $678 = (($636) + 8|0);
       $679 = $678;
       $680 = $679 & 7;
       $681 = ($680|0)==(0);
       if ($681) {
        $685 = 0;
       } else {
        $682 = (0 - ($679))|0;
        $683 = $682 & 7;
        $685 = $683;
       }
       $684 = (($636) + ($685)|0);
       $686 = (($677) - ($685))|0;
       HEAP32[((15144 + 24|0))>>2] = $684;
       HEAP32[((15144 + 12|0))>>2] = $686;
       $687 = $686 | 1;
       $$sum$i18$i = (($685) + 4)|0;
       $688 = (($636) + ($$sum$i18$i)|0);
       HEAP32[$688>>2] = $687;
       $$sum2$i19$i = (($677) + 4)|0;
       $689 = (($636) + ($$sum2$i19$i)|0);
       HEAP32[$689>>2] = 40;
       $690 = HEAP32[((15616 + 16|0))>>2]|0;
       HEAP32[((15144 + 28|0))>>2] = $690;
       break;
      }
     }
    }
    $691 = HEAP32[((15144 + 16|0))>>2]|0;
    $692 = ($tbase$247$i>>>0)<($691>>>0);
    if ($692) {
     HEAP32[((15144 + 16|0))>>2] = $tbase$247$i;
    }
    $693 = (($tbase$247$i) + ($tsize$246$i)|0);
    $sp$168$i = ((15144 + 448|0));
    while(1) {
     $694 = HEAP32[$sp$168$i>>2]|0;
     $695 = ($694|0)==($693|0);
     if ($695) {
      label = 224;
      break;
     }
     $696 = (($sp$168$i) + 8|0);
     $697 = HEAP32[$696>>2]|0;
     $698 = ($697|0)==(0|0);
     if ($698) {
      break;
     } else {
      $sp$168$i = $697;
     }
    }
    if ((label|0) == 224) {
     $699 = (($sp$168$i) + 12|0);
     $700 = HEAP32[$699>>2]|0;
     $701 = $700 & 8;
     $702 = ($701|0)==(0);
     if ($702) {
      HEAP32[$sp$168$i>>2] = $tbase$247$i;
      $703 = (($sp$168$i) + 4|0);
      $704 = HEAP32[$703>>2]|0;
      $705 = (($704) + ($tsize$246$i))|0;
      HEAP32[$703>>2] = $705;
      $706 = (($tbase$247$i) + 8|0);
      $707 = $706;
      $708 = $707 & 7;
      $709 = ($708|0)==(0);
      if ($709) {
       $713 = 0;
      } else {
       $710 = (0 - ($707))|0;
       $711 = $710 & 7;
       $713 = $711;
      }
      $712 = (($tbase$247$i) + ($713)|0);
      $$sum107$i = (($tsize$246$i) + 8)|0;
      $714 = (($tbase$247$i) + ($$sum107$i)|0);
      $715 = $714;
      $716 = $715 & 7;
      $717 = ($716|0)==(0);
      if ($717) {
       $720 = 0;
      } else {
       $718 = (0 - ($715))|0;
       $719 = $718 & 7;
       $720 = $719;
      }
      $$sum108$i = (($720) + ($tsize$246$i))|0;
      $721 = (($tbase$247$i) + ($$sum108$i)|0);
      $722 = $721;
      $723 = $712;
      $724 = (($722) - ($723))|0;
      $$sum$i21$i = (($713) + ($nb$0))|0;
      $725 = (($tbase$247$i) + ($$sum$i21$i)|0);
      $726 = (($724) - ($nb$0))|0;
      $727 = $nb$0 | 3;
      $$sum1$i22$i = (($713) + 4)|0;
      $728 = (($tbase$247$i) + ($$sum1$i22$i)|0);
      HEAP32[$728>>2] = $727;
      $729 = HEAP32[((15144 + 24|0))>>2]|0;
      $730 = ($721|0)==($729|0);
      L338: do {
       if ($730) {
        $731 = HEAP32[((15144 + 12|0))>>2]|0;
        $732 = (($731) + ($726))|0;
        HEAP32[((15144 + 12|0))>>2] = $732;
        HEAP32[((15144 + 24|0))>>2] = $725;
        $733 = $732 | 1;
        $$sum42$i$i = (($$sum$i21$i) + 4)|0;
        $734 = (($tbase$247$i) + ($$sum42$i$i)|0);
        HEAP32[$734>>2] = $733;
       } else {
        $735 = HEAP32[((15144 + 20|0))>>2]|0;
        $736 = ($721|0)==($735|0);
        if ($736) {
         $737 = HEAP32[((15144 + 8|0))>>2]|0;
         $738 = (($737) + ($726))|0;
         HEAP32[((15144 + 8|0))>>2] = $738;
         HEAP32[((15144 + 20|0))>>2] = $725;
         $739 = $738 | 1;
         $$sum40$i$i = (($$sum$i21$i) + 4)|0;
         $740 = (($tbase$247$i) + ($$sum40$i$i)|0);
         HEAP32[$740>>2] = $739;
         $$sum41$i$i = (($738) + ($$sum$i21$i))|0;
         $741 = (($tbase$247$i) + ($$sum41$i$i)|0);
         HEAP32[$741>>2] = $738;
         break;
        }
        $$sum2$i23$i = (($tsize$246$i) + 4)|0;
        $$sum109$i = (($$sum2$i23$i) + ($720))|0;
        $742 = (($tbase$247$i) + ($$sum109$i)|0);
        $743 = HEAP32[$742>>2]|0;
        $744 = $743 & 3;
        $745 = ($744|0)==(1);
        if ($745) {
         $746 = $743 & -8;
         $747 = $743 >>> 3;
         $748 = ($743>>>0)<(256);
         do {
          if ($748) {
           $$sum3738$i$i = $720 | 8;
           $$sum119$i = (($$sum3738$i$i) + ($tsize$246$i))|0;
           $749 = (($tbase$247$i) + ($$sum119$i)|0);
           $750 = HEAP32[$749>>2]|0;
           $$sum39$i$i = (($tsize$246$i) + 12)|0;
           $$sum120$i = (($$sum39$i$i) + ($720))|0;
           $751 = (($tbase$247$i) + ($$sum120$i)|0);
           $752 = HEAP32[$751>>2]|0;
           $753 = $747 << 1;
           $754 = ((15144 + ($753<<2)|0) + 40|0);
           $755 = ($750|0)==($754|0);
           if (!($755)) {
            $756 = HEAP32[((15144 + 16|0))>>2]|0;
            $757 = ($750>>>0)<($756>>>0);
            if ($757) {
             _abort();
             // unreachable;
            }
            $758 = (($750) + 12|0);
            $759 = HEAP32[$758>>2]|0;
            $760 = ($759|0)==($721|0);
            if (!($760)) {
             _abort();
             // unreachable;
            }
           }
           $761 = ($752|0)==($750|0);
           if ($761) {
            $762 = 1 << $747;
            $763 = $762 ^ -1;
            $764 = HEAP32[15144>>2]|0;
            $765 = $764 & $763;
            HEAP32[15144>>2] = $765;
            break;
           }
           $766 = ($752|0)==($754|0);
           if ($766) {
            $$pre57$i$i = (($752) + 8|0);
            $$pre$phi58$i$iZ2D = $$pre57$i$i;
           } else {
            $767 = HEAP32[((15144 + 16|0))>>2]|0;
            $768 = ($752>>>0)<($767>>>0);
            if ($768) {
             _abort();
             // unreachable;
            }
            $769 = (($752) + 8|0);
            $770 = HEAP32[$769>>2]|0;
            $771 = ($770|0)==($721|0);
            if ($771) {
             $$pre$phi58$i$iZ2D = $769;
            } else {
             _abort();
             // unreachable;
            }
           }
           $772 = (($750) + 12|0);
           HEAP32[$772>>2] = $752;
           HEAP32[$$pre$phi58$i$iZ2D>>2] = $750;
          } else {
           $$sum34$i$i = $720 | 24;
           $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
           $773 = (($tbase$247$i) + ($$sum110$i)|0);
           $774 = HEAP32[$773>>2]|0;
           $$sum5$i$i = (($tsize$246$i) + 12)|0;
           $$sum111$i = (($$sum5$i$i) + ($720))|0;
           $775 = (($tbase$247$i) + ($$sum111$i)|0);
           $776 = HEAP32[$775>>2]|0;
           $777 = ($776|0)==($721|0);
           do {
            if ($777) {
             $$sum67$i$i = $720 | 16;
             $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
             $788 = (($tbase$247$i) + ($$sum117$i)|0);
             $789 = HEAP32[$788>>2]|0;
             $790 = ($789|0)==(0|0);
             if ($790) {
              $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
              $791 = (($tbase$247$i) + ($$sum118$i)|0);
              $792 = HEAP32[$791>>2]|0;
              $793 = ($792|0)==(0|0);
              if ($793) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $792;$RP$0$i$i = $791;
              }
             } else {
              $R$0$i$i = $789;$RP$0$i$i = $788;
             }
             while(1) {
              $794 = (($R$0$i$i) + 20|0);
              $795 = HEAP32[$794>>2]|0;
              $796 = ($795|0)==(0|0);
              if (!($796)) {
               $R$0$i$i = $795;$RP$0$i$i = $794;
               continue;
              }
              $797 = (($R$0$i$i) + 16|0);
              $798 = HEAP32[$797>>2]|0;
              $799 = ($798|0)==(0|0);
              if ($799) {
               break;
              } else {
               $R$0$i$i = $798;$RP$0$i$i = $797;
              }
             }
             $800 = HEAP32[((15144 + 16|0))>>2]|0;
             $801 = ($RP$0$i$i>>>0)<($800>>>0);
             if ($801) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i>>2] = 0;
              $R$1$i$i = $R$0$i$i;
              break;
             }
            } else {
             $$sum3536$i$i = $720 | 8;
             $$sum112$i = (($$sum3536$i$i) + ($tsize$246$i))|0;
             $778 = (($tbase$247$i) + ($$sum112$i)|0);
             $779 = HEAP32[$778>>2]|0;
             $780 = HEAP32[((15144 + 16|0))>>2]|0;
             $781 = ($779>>>0)<($780>>>0);
             if ($781) {
              _abort();
              // unreachable;
             }
             $782 = (($779) + 12|0);
             $783 = HEAP32[$782>>2]|0;
             $784 = ($783|0)==($721|0);
             if (!($784)) {
              _abort();
              // unreachable;
             }
             $785 = (($776) + 8|0);
             $786 = HEAP32[$785>>2]|0;
             $787 = ($786|0)==($721|0);
             if ($787) {
              HEAP32[$782>>2] = $776;
              HEAP32[$785>>2] = $779;
              $R$1$i$i = $776;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $802 = ($774|0)==(0|0);
           if (!($802)) {
            $$sum30$i$i = (($tsize$246$i) + 28)|0;
            $$sum113$i = (($$sum30$i$i) + ($720))|0;
            $803 = (($tbase$247$i) + ($$sum113$i)|0);
            $804 = HEAP32[$803>>2]|0;
            $805 = ((15144 + ($804<<2)|0) + 304|0);
            $806 = HEAP32[$805>>2]|0;
            $807 = ($721|0)==($806|0);
            if ($807) {
             HEAP32[$805>>2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i|0)==(0|0);
             if ($cond$i$i) {
              $808 = 1 << $804;
              $809 = $808 ^ -1;
              $810 = HEAP32[((15144 + 4|0))>>2]|0;
              $811 = $810 & $809;
              HEAP32[((15144 + 4|0))>>2] = $811;
              break;
             }
            } else {
             $812 = HEAP32[((15144 + 16|0))>>2]|0;
             $813 = ($774>>>0)<($812>>>0);
             if ($813) {
              _abort();
              // unreachable;
             }
             $814 = (($774) + 16|0);
             $815 = HEAP32[$814>>2]|0;
             $816 = ($815|0)==($721|0);
             if ($816) {
              HEAP32[$814>>2] = $R$1$i$i;
             } else {
              $817 = (($774) + 20|0);
              HEAP32[$817>>2] = $R$1$i$i;
             }
             $818 = ($R$1$i$i|0)==(0|0);
             if ($818) {
              break;
             }
            }
            $819 = HEAP32[((15144 + 16|0))>>2]|0;
            $820 = ($R$1$i$i>>>0)<($819>>>0);
            if ($820) {
             _abort();
             // unreachable;
            }
            $821 = (($R$1$i$i) + 24|0);
            HEAP32[$821>>2] = $774;
            $$sum3132$i$i = $720 | 16;
            $$sum114$i = (($$sum3132$i$i) + ($tsize$246$i))|0;
            $822 = (($tbase$247$i) + ($$sum114$i)|0);
            $823 = HEAP32[$822>>2]|0;
            $824 = ($823|0)==(0|0);
            do {
             if (!($824)) {
              $825 = HEAP32[((15144 + 16|0))>>2]|0;
              $826 = ($823>>>0)<($825>>>0);
              if ($826) {
               _abort();
               // unreachable;
              } else {
               $827 = (($R$1$i$i) + 16|0);
               HEAP32[$827>>2] = $823;
               $828 = (($823) + 24|0);
               HEAP32[$828>>2] = $R$1$i$i;
               break;
              }
             }
            } while(0);
            $$sum115$i = (($$sum2$i23$i) + ($$sum3132$i$i))|0;
            $829 = (($tbase$247$i) + ($$sum115$i)|0);
            $830 = HEAP32[$829>>2]|0;
            $831 = ($830|0)==(0|0);
            if (!($831)) {
             $832 = HEAP32[((15144 + 16|0))>>2]|0;
             $833 = ($830>>>0)<($832>>>0);
             if ($833) {
              _abort();
              // unreachable;
             } else {
              $834 = (($R$1$i$i) + 20|0);
              HEAP32[$834>>2] = $830;
              $835 = (($830) + 24|0);
              HEAP32[$835>>2] = $R$1$i$i;
              break;
             }
            }
           }
          }
         } while(0);
         $$sum9$i$i = $746 | $720;
         $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
         $836 = (($tbase$247$i) + ($$sum116$i)|0);
         $837 = (($746) + ($726))|0;
         $oldfirst$0$i$i = $836;$qsize$0$i$i = $837;
        } else {
         $oldfirst$0$i$i = $721;$qsize$0$i$i = $726;
        }
        $838 = (($oldfirst$0$i$i) + 4|0);
        $839 = HEAP32[$838>>2]|0;
        $840 = $839 & -2;
        HEAP32[$838>>2] = $840;
        $841 = $qsize$0$i$i | 1;
        $$sum10$i$i = (($$sum$i21$i) + 4)|0;
        $842 = (($tbase$247$i) + ($$sum10$i$i)|0);
        HEAP32[$842>>2] = $841;
        $$sum11$i24$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
        $843 = (($tbase$247$i) + ($$sum11$i24$i)|0);
        HEAP32[$843>>2] = $qsize$0$i$i;
        $844 = $qsize$0$i$i >>> 3;
        $845 = ($qsize$0$i$i>>>0)<(256);
        if ($845) {
         $846 = $844 << 1;
         $847 = ((15144 + ($846<<2)|0) + 40|0);
         $848 = HEAP32[15144>>2]|0;
         $849 = 1 << $844;
         $850 = $848 & $849;
         $851 = ($850|0)==(0);
         if ($851) {
          $852 = $848 | $849;
          HEAP32[15144>>2] = $852;
          $$sum26$pre$i$i = (($846) + 2)|0;
          $$pre$i25$i = ((15144 + ($$sum26$pre$i$i<<2)|0) + 40|0);
          $$pre$phi$i26$iZ2D = $$pre$i25$i;$F4$0$i$i = $847;
         } else {
          $$sum29$i$i = (($846) + 2)|0;
          $853 = ((15144 + ($$sum29$i$i<<2)|0) + 40|0);
          $854 = HEAP32[$853>>2]|0;
          $855 = HEAP32[((15144 + 16|0))>>2]|0;
          $856 = ($854>>>0)<($855>>>0);
          if ($856) {
           _abort();
           // unreachable;
          } else {
           $$pre$phi$i26$iZ2D = $853;$F4$0$i$i = $854;
          }
         }
         HEAP32[$$pre$phi$i26$iZ2D>>2] = $725;
         $857 = (($F4$0$i$i) + 12|0);
         HEAP32[$857>>2] = $725;
         $$sum27$i$i = (($$sum$i21$i) + 8)|0;
         $858 = (($tbase$247$i) + ($$sum27$i$i)|0);
         HEAP32[$858>>2] = $F4$0$i$i;
         $$sum28$i$i = (($$sum$i21$i) + 12)|0;
         $859 = (($tbase$247$i) + ($$sum28$i$i)|0);
         HEAP32[$859>>2] = $847;
         break;
        }
        $860 = $qsize$0$i$i >>> 8;
        $861 = ($860|0)==(0);
        if ($861) {
         $I7$0$i$i = 0;
        } else {
         $862 = ($qsize$0$i$i>>>0)>(16777215);
         if ($862) {
          $I7$0$i$i = 31;
         } else {
          $863 = (($860) + 1048320)|0;
          $864 = $863 >>> 16;
          $865 = $864 & 8;
          $866 = $860 << $865;
          $867 = (($866) + 520192)|0;
          $868 = $867 >>> 16;
          $869 = $868 & 4;
          $870 = $869 | $865;
          $871 = $866 << $869;
          $872 = (($871) + 245760)|0;
          $873 = $872 >>> 16;
          $874 = $873 & 2;
          $875 = $870 | $874;
          $876 = (14 - ($875))|0;
          $877 = $871 << $874;
          $878 = $877 >>> 15;
          $879 = (($876) + ($878))|0;
          $880 = $879 << 1;
          $881 = (($879) + 7)|0;
          $882 = $qsize$0$i$i >>> $881;
          $883 = $882 & 1;
          $884 = $883 | $880;
          $I7$0$i$i = $884;
         }
        }
        $885 = ((15144 + ($I7$0$i$i<<2)|0) + 304|0);
        $$sum12$i$i = (($$sum$i21$i) + 28)|0;
        $886 = (($tbase$247$i) + ($$sum12$i$i)|0);
        HEAP32[$886>>2] = $I7$0$i$i;
        $$sum13$i$i = (($$sum$i21$i) + 16)|0;
        $887 = (($tbase$247$i) + ($$sum13$i$i)|0);
        $$sum14$i$i = (($$sum$i21$i) + 20)|0;
        $888 = (($tbase$247$i) + ($$sum14$i$i)|0);
        HEAP32[$888>>2] = 0;
        HEAP32[$887>>2] = 0;
        $889 = HEAP32[((15144 + 4|0))>>2]|0;
        $890 = 1 << $I7$0$i$i;
        $891 = $889 & $890;
        $892 = ($891|0)==(0);
        if ($892) {
         $893 = $889 | $890;
         HEAP32[((15144 + 4|0))>>2] = $893;
         HEAP32[$885>>2] = $725;
         $$sum15$i$i = (($$sum$i21$i) + 24)|0;
         $894 = (($tbase$247$i) + ($$sum15$i$i)|0);
         HEAP32[$894>>2] = $885;
         $$sum16$i$i = (($$sum$i21$i) + 12)|0;
         $895 = (($tbase$247$i) + ($$sum16$i$i)|0);
         HEAP32[$895>>2] = $725;
         $$sum17$i$i = (($$sum$i21$i) + 8)|0;
         $896 = (($tbase$247$i) + ($$sum17$i$i)|0);
         HEAP32[$896>>2] = $725;
         break;
        }
        $897 = HEAP32[$885>>2]|0;
        $898 = ($I7$0$i$i|0)==(31);
        if ($898) {
         $906 = 0;
        } else {
         $899 = $I7$0$i$i >>> 1;
         $900 = (25 - ($899))|0;
         $906 = $900;
        }
        $901 = (($897) + 4|0);
        $902 = HEAP32[$901>>2]|0;
        $903 = $902 & -8;
        $904 = ($903|0)==($qsize$0$i$i|0);
        L435: do {
         if ($904) {
          $T$0$lcssa$i28$i = $897;
         } else {
          $905 = $qsize$0$i$i << $906;
          $K8$052$i$i = $905;$T$051$i$i = $897;
          while(1) {
           $913 = $K8$052$i$i >>> 31;
           $914 = ((($T$051$i$i) + ($913<<2)|0) + 16|0);
           $909 = HEAP32[$914>>2]|0;
           $915 = ($909|0)==(0|0);
           if ($915) {
            break;
           }
           $907 = $K8$052$i$i << 1;
           $908 = (($909) + 4|0);
           $910 = HEAP32[$908>>2]|0;
           $911 = $910 & -8;
           $912 = ($911|0)==($qsize$0$i$i|0);
           if ($912) {
            $T$0$lcssa$i28$i = $909;
            break L435;
           } else {
            $K8$052$i$i = $907;$T$051$i$i = $909;
           }
          }
          $916 = HEAP32[((15144 + 16|0))>>2]|0;
          $917 = ($914>>>0)<($916>>>0);
          if ($917) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$914>>2] = $725;
           $$sum23$i$i = (($$sum$i21$i) + 24)|0;
           $918 = (($tbase$247$i) + ($$sum23$i$i)|0);
           HEAP32[$918>>2] = $T$051$i$i;
           $$sum24$i$i = (($$sum$i21$i) + 12)|0;
           $919 = (($tbase$247$i) + ($$sum24$i$i)|0);
           HEAP32[$919>>2] = $725;
           $$sum25$i$i = (($$sum$i21$i) + 8)|0;
           $920 = (($tbase$247$i) + ($$sum25$i$i)|0);
           HEAP32[$920>>2] = $725;
           break L338;
          }
         }
        } while(0);
        $921 = (($T$0$lcssa$i28$i) + 8|0);
        $922 = HEAP32[$921>>2]|0;
        $923 = HEAP32[((15144 + 16|0))>>2]|0;
        $924 = ($T$0$lcssa$i28$i>>>0)<($923>>>0);
        if ($924) {
         _abort();
         // unreachable;
        }
        $925 = ($922>>>0)<($923>>>0);
        if ($925) {
         _abort();
         // unreachable;
        } else {
         $926 = (($922) + 12|0);
         HEAP32[$926>>2] = $725;
         HEAP32[$921>>2] = $725;
         $$sum20$i$i = (($$sum$i21$i) + 8)|0;
         $927 = (($tbase$247$i) + ($$sum20$i$i)|0);
         HEAP32[$927>>2] = $922;
         $$sum21$i$i = (($$sum$i21$i) + 12)|0;
         $928 = (($tbase$247$i) + ($$sum21$i$i)|0);
         HEAP32[$928>>2] = $T$0$lcssa$i28$i;
         $$sum22$i$i = (($$sum$i21$i) + 24)|0;
         $929 = (($tbase$247$i) + ($$sum22$i$i)|0);
         HEAP32[$929>>2] = 0;
         break;
        }
       }
      } while(0);
      $$sum1819$i$i = $713 | 8;
      $930 = (($tbase$247$i) + ($$sum1819$i$i)|0);
      $mem$0 = $930;
      STACKTOP = sp;return ($mem$0|0);
     }
    }
    $sp$0$i$i$i = ((15144 + 448|0));
    while(1) {
     $931 = HEAP32[$sp$0$i$i$i>>2]|0;
     $932 = ($931>>>0)>($636>>>0);
     if (!($932)) {
      $933 = (($sp$0$i$i$i) + 4|0);
      $934 = HEAP32[$933>>2]|0;
      $935 = (($931) + ($934)|0);
      $936 = ($935>>>0)>($636>>>0);
      if ($936) {
       break;
      }
     }
     $937 = (($sp$0$i$i$i) + 8|0);
     $938 = HEAP32[$937>>2]|0;
     $sp$0$i$i$i = $938;
    }
    $$sum$i15$i = (($934) + -47)|0;
    $$sum1$i16$i = (($934) + -39)|0;
    $939 = (($931) + ($$sum1$i16$i)|0);
    $940 = $939;
    $941 = $940 & 7;
    $942 = ($941|0)==(0);
    if ($942) {
     $945 = 0;
    } else {
     $943 = (0 - ($940))|0;
     $944 = $943 & 7;
     $945 = $944;
    }
    $$sum2$i17$i = (($$sum$i15$i) + ($945))|0;
    $946 = (($931) + ($$sum2$i17$i)|0);
    $947 = (($636) + 16|0);
    $948 = ($946>>>0)<($947>>>0);
    $949 = $948 ? $636 : $946;
    $950 = (($949) + 8|0);
    $951 = (($tsize$246$i) + -40)|0;
    $952 = (($tbase$247$i) + 8|0);
    $953 = $952;
    $954 = $953 & 7;
    $955 = ($954|0)==(0);
    if ($955) {
     $959 = 0;
    } else {
     $956 = (0 - ($953))|0;
     $957 = $956 & 7;
     $959 = $957;
    }
    $958 = (($tbase$247$i) + ($959)|0);
    $960 = (($951) - ($959))|0;
    HEAP32[((15144 + 24|0))>>2] = $958;
    HEAP32[((15144 + 12|0))>>2] = $960;
    $961 = $960 | 1;
    $$sum$i$i$i = (($959) + 4)|0;
    $962 = (($tbase$247$i) + ($$sum$i$i$i)|0);
    HEAP32[$962>>2] = $961;
    $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
    $963 = (($tbase$247$i) + ($$sum2$i$i$i)|0);
    HEAP32[$963>>2] = 40;
    $964 = HEAP32[((15616 + 16|0))>>2]|0;
    HEAP32[((15144 + 28|0))>>2] = $964;
    $965 = (($949) + 4|0);
    HEAP32[$965>>2] = 27;
    ;HEAP32[$950+0>>2]=HEAP32[((15144 + 448|0))+0>>2]|0;HEAP32[$950+4>>2]=HEAP32[((15144 + 448|0))+4>>2]|0;HEAP32[$950+8>>2]=HEAP32[((15144 + 448|0))+8>>2]|0;HEAP32[$950+12>>2]=HEAP32[((15144 + 448|0))+12>>2]|0;
    HEAP32[((15144 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((15144 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((15144 + 460|0))>>2] = 0;
    HEAP32[((15144 + 456|0))>>2] = $950;
    $966 = (($949) + 28|0);
    HEAP32[$966>>2] = 7;
    $967 = (($949) + 32|0);
    $968 = ($967>>>0)<($935>>>0);
    if ($968) {
     $970 = $966;
     while(1) {
      $969 = (($970) + 4|0);
      HEAP32[$969>>2] = 7;
      $971 = (($970) + 8|0);
      $972 = ($971>>>0)<($935>>>0);
      if ($972) {
       $970 = $969;
      } else {
       break;
      }
     }
    }
    $973 = ($949|0)==($636|0);
    if (!($973)) {
     $974 = $949;
     $975 = $636;
     $976 = (($974) - ($975))|0;
     $977 = (($636) + ($976)|0);
     $$sum3$i$i = (($976) + 4)|0;
     $978 = (($636) + ($$sum3$i$i)|0);
     $979 = HEAP32[$978>>2]|0;
     $980 = $979 & -2;
     HEAP32[$978>>2] = $980;
     $981 = $976 | 1;
     $982 = (($636) + 4|0);
     HEAP32[$982>>2] = $981;
     HEAP32[$977>>2] = $976;
     $983 = $976 >>> 3;
     $984 = ($976>>>0)<(256);
     if ($984) {
      $985 = $983 << 1;
      $986 = ((15144 + ($985<<2)|0) + 40|0);
      $987 = HEAP32[15144>>2]|0;
      $988 = 1 << $983;
      $989 = $987 & $988;
      $990 = ($989|0)==(0);
      if ($990) {
       $991 = $987 | $988;
       HEAP32[15144>>2] = $991;
       $$sum10$pre$i$i = (($985) + 2)|0;
       $$pre$i$i = ((15144 + ($$sum10$pre$i$i<<2)|0) + 40|0);
       $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $986;
      } else {
       $$sum11$i$i = (($985) + 2)|0;
       $992 = ((15144 + ($$sum11$i$i<<2)|0) + 40|0);
       $993 = HEAP32[$992>>2]|0;
       $994 = HEAP32[((15144 + 16|0))>>2]|0;
       $995 = ($993>>>0)<($994>>>0);
       if ($995) {
        _abort();
        // unreachable;
       } else {
        $$pre$phi$i$iZ2D = $992;$F$0$i$i = $993;
       }
      }
      HEAP32[$$pre$phi$i$iZ2D>>2] = $636;
      $996 = (($F$0$i$i) + 12|0);
      HEAP32[$996>>2] = $636;
      $997 = (($636) + 8|0);
      HEAP32[$997>>2] = $F$0$i$i;
      $998 = (($636) + 12|0);
      HEAP32[$998>>2] = $986;
      break;
     }
     $999 = $976 >>> 8;
     $1000 = ($999|0)==(0);
     if ($1000) {
      $I1$0$i$i = 0;
     } else {
      $1001 = ($976>>>0)>(16777215);
      if ($1001) {
       $I1$0$i$i = 31;
      } else {
       $1002 = (($999) + 1048320)|0;
       $1003 = $1002 >>> 16;
       $1004 = $1003 & 8;
       $1005 = $999 << $1004;
       $1006 = (($1005) + 520192)|0;
       $1007 = $1006 >>> 16;
       $1008 = $1007 & 4;
       $1009 = $1008 | $1004;
       $1010 = $1005 << $1008;
       $1011 = (($1010) + 245760)|0;
       $1012 = $1011 >>> 16;
       $1013 = $1012 & 2;
       $1014 = $1009 | $1013;
       $1015 = (14 - ($1014))|0;
       $1016 = $1010 << $1013;
       $1017 = $1016 >>> 15;
       $1018 = (($1015) + ($1017))|0;
       $1019 = $1018 << 1;
       $1020 = (($1018) + 7)|0;
       $1021 = $976 >>> $1020;
       $1022 = $1021 & 1;
       $1023 = $1022 | $1019;
       $I1$0$i$i = $1023;
      }
     }
     $1024 = ((15144 + ($I1$0$i$i<<2)|0) + 304|0);
     $1025 = (($636) + 28|0);
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1025>>2] = $I1$0$c$i$i;
     $1026 = (($636) + 20|0);
     HEAP32[$1026>>2] = 0;
     $1027 = (($636) + 16|0);
     HEAP32[$1027>>2] = 0;
     $1028 = HEAP32[((15144 + 4|0))>>2]|0;
     $1029 = 1 << $I1$0$i$i;
     $1030 = $1028 & $1029;
     $1031 = ($1030|0)==(0);
     if ($1031) {
      $1032 = $1028 | $1029;
      HEAP32[((15144 + 4|0))>>2] = $1032;
      HEAP32[$1024>>2] = $636;
      $1033 = (($636) + 24|0);
      HEAP32[$1033>>2] = $1024;
      $1034 = (($636) + 12|0);
      HEAP32[$1034>>2] = $636;
      $1035 = (($636) + 8|0);
      HEAP32[$1035>>2] = $636;
      break;
     }
     $1036 = HEAP32[$1024>>2]|0;
     $1037 = ($I1$0$i$i|0)==(31);
     if ($1037) {
      $1045 = 0;
     } else {
      $1038 = $I1$0$i$i >>> 1;
      $1039 = (25 - ($1038))|0;
      $1045 = $1039;
     }
     $1040 = (($1036) + 4|0);
     $1041 = HEAP32[$1040>>2]|0;
     $1042 = $1041 & -8;
     $1043 = ($1042|0)==($976|0);
     L489: do {
      if ($1043) {
       $T$0$lcssa$i$i = $1036;
      } else {
       $1044 = $976 << $1045;
       $K2$014$i$i = $1044;$T$013$i$i = $1036;
       while(1) {
        $1052 = $K2$014$i$i >>> 31;
        $1053 = ((($T$013$i$i) + ($1052<<2)|0) + 16|0);
        $1048 = HEAP32[$1053>>2]|0;
        $1054 = ($1048|0)==(0|0);
        if ($1054) {
         break;
        }
        $1046 = $K2$014$i$i << 1;
        $1047 = (($1048) + 4|0);
        $1049 = HEAP32[$1047>>2]|0;
        $1050 = $1049 & -8;
        $1051 = ($1050|0)==($976|0);
        if ($1051) {
         $T$0$lcssa$i$i = $1048;
         break L489;
        } else {
         $K2$014$i$i = $1046;$T$013$i$i = $1048;
        }
       }
       $1055 = HEAP32[((15144 + 16|0))>>2]|0;
       $1056 = ($1053>>>0)<($1055>>>0);
       if ($1056) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$1053>>2] = $636;
        $1057 = (($636) + 24|0);
        HEAP32[$1057>>2] = $T$013$i$i;
        $1058 = (($636) + 12|0);
        HEAP32[$1058>>2] = $636;
        $1059 = (($636) + 8|0);
        HEAP32[$1059>>2] = $636;
        break L311;
       }
      }
     } while(0);
     $1060 = (($T$0$lcssa$i$i) + 8|0);
     $1061 = HEAP32[$1060>>2]|0;
     $1062 = HEAP32[((15144 + 16|0))>>2]|0;
     $1063 = ($T$0$lcssa$i$i>>>0)<($1062>>>0);
     if ($1063) {
      _abort();
      // unreachable;
     }
     $1064 = ($1061>>>0)<($1062>>>0);
     if ($1064) {
      _abort();
      // unreachable;
     } else {
      $1065 = (($1061) + 12|0);
      HEAP32[$1065>>2] = $636;
      HEAP32[$1060>>2] = $636;
      $1066 = (($636) + 8|0);
      HEAP32[$1066>>2] = $1061;
      $1067 = (($636) + 12|0);
      HEAP32[$1067>>2] = $T$0$lcssa$i$i;
      $1068 = (($636) + 24|0);
      HEAP32[$1068>>2] = 0;
      break;
     }
    }
   }
  } while(0);
  $1069 = HEAP32[((15144 + 12|0))>>2]|0;
  $1070 = ($1069>>>0)>($nb$0>>>0);
  if ($1070) {
   $1071 = (($1069) - ($nb$0))|0;
   HEAP32[((15144 + 12|0))>>2] = $1071;
   $1072 = HEAP32[((15144 + 24|0))>>2]|0;
   $1073 = (($1072) + ($nb$0)|0);
   HEAP32[((15144 + 24|0))>>2] = $1073;
   $1074 = $1071 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1075 = (($1072) + ($$sum$i32)|0);
   HEAP32[$1075>>2] = $1074;
   $1076 = $nb$0 | 3;
   $1077 = (($1072) + 4|0);
   HEAP32[$1077>>2] = $1076;
   $1078 = (($1072) + 8|0);
   $mem$0 = $1078;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $1079 = (___errno_location()|0);
 HEAP32[$1079>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$pre = 0, $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$pre67 = 0, $$pre69 = 0, $$sum = 0, $$sum16$pre = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum26 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0;
 var $$sum31 = 0, $$sum32 = 0, $$sum33 = 0, $$sum34 = 0, $$sum35 = 0, $$sum36 = 0, $$sum37 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
 var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
 var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
 var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0;
 var $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0;
 var $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0;
 var $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0;
 var $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0;
 var $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0;
 var $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0;
 var $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0;
 var $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0;
 var $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0;
 var $322 = 0, $323 = 0, $324 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0, $K19$057 = 0;
 var $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$056 = 0, $cond = 0, $cond54 = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = (($mem) + -8|0);
 $2 = HEAP32[((15144 + 16|0))>>2]|0;
 $3 = ($1>>>0)<($2>>>0);
 if ($3) {
  _abort();
  // unreachable;
 }
 $4 = (($mem) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 3;
 $7 = ($6|0)==(1);
 if ($7) {
  _abort();
  // unreachable;
 }
 $8 = $5 & -8;
 $$sum = (($8) + -8)|0;
 $9 = (($mem) + ($$sum)|0);
 $10 = $5 & 1;
 $11 = ($10|0)==(0);
 do {
  if ($11) {
   $12 = HEAP32[$1>>2]|0;
   $13 = ($6|0)==(0);
   if ($13) {
    STACKTOP = sp;return;
   }
   $$sum2 = (-8 - ($12))|0;
   $14 = (($mem) + ($$sum2)|0);
   $15 = (($12) + ($8))|0;
   $16 = ($14>>>0)<($2>>>0);
   if ($16) {
    _abort();
    // unreachable;
   }
   $17 = HEAP32[((15144 + 20|0))>>2]|0;
   $18 = ($14|0)==($17|0);
   if ($18) {
    $$sum3 = (($8) + -4)|0;
    $104 = (($mem) + ($$sum3)|0);
    $105 = HEAP32[$104>>2]|0;
    $106 = $105 & 3;
    $107 = ($106|0)==(3);
    if (!($107)) {
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    HEAP32[((15144 + 8|0))>>2] = $15;
    $108 = HEAP32[$104>>2]|0;
    $109 = $108 & -2;
    HEAP32[$104>>2] = $109;
    $110 = $15 | 1;
    $$sum26 = (($$sum2) + 4)|0;
    $111 = (($mem) + ($$sum26)|0);
    HEAP32[$111>>2] = $110;
    HEAP32[$9>>2] = $15;
    STACKTOP = sp;return;
   }
   $19 = $12 >>> 3;
   $20 = ($12>>>0)<(256);
   if ($20) {
    $$sum36 = (($$sum2) + 8)|0;
    $21 = (($mem) + ($$sum36)|0);
    $22 = HEAP32[$21>>2]|0;
    $$sum37 = (($$sum2) + 12)|0;
    $23 = (($mem) + ($$sum37)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = $19 << 1;
    $26 = ((15144 + ($25<<2)|0) + 40|0);
    $27 = ($22|0)==($26|0);
    if (!($27)) {
     $28 = ($22>>>0)<($2>>>0);
     if ($28) {
      _abort();
      // unreachable;
     }
     $29 = (($22) + 12|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = ($30|0)==($14|0);
     if (!($31)) {
      _abort();
      // unreachable;
     }
    }
    $32 = ($24|0)==($22|0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[15144>>2]|0;
     $36 = $35 & $34;
     HEAP32[15144>>2] = $36;
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    $37 = ($24|0)==($26|0);
    if ($37) {
     $$pre69 = (($24) + 8|0);
     $$pre$phi70Z2D = $$pre69;
    } else {
     $38 = ($24>>>0)<($2>>>0);
     if ($38) {
      _abort();
      // unreachable;
     }
     $39 = (($24) + 8|0);
     $40 = HEAP32[$39>>2]|0;
     $41 = ($40|0)==($14|0);
     if ($41) {
      $$pre$phi70Z2D = $39;
     } else {
      _abort();
      // unreachable;
     }
    }
    $42 = (($22) + 12|0);
    HEAP32[$42>>2] = $24;
    HEAP32[$$pre$phi70Z2D>>2] = $22;
    $p$0 = $14;$psize$0 = $15;
    break;
   }
   $$sum28 = (($$sum2) + 24)|0;
   $43 = (($mem) + ($$sum28)|0);
   $44 = HEAP32[$43>>2]|0;
   $$sum29 = (($$sum2) + 12)|0;
   $45 = (($mem) + ($$sum29)|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($14|0);
   do {
    if ($47) {
     $$sum31 = (($$sum2) + 20)|0;
     $57 = (($mem) + ($$sum31)|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = ($58|0)==(0|0);
     if ($59) {
      $$sum30 = (($$sum2) + 16)|0;
      $60 = (($mem) + ($$sum30)|0);
      $61 = HEAP32[$60>>2]|0;
      $62 = ($61|0)==(0|0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;$RP$0 = $60;
      }
     } else {
      $R$0 = $58;$RP$0 = $57;
     }
     while(1) {
      $63 = (($R$0) + 20|0);
      $64 = HEAP32[$63>>2]|0;
      $65 = ($64|0)==(0|0);
      if (!($65)) {
       $R$0 = $64;$RP$0 = $63;
       continue;
      }
      $66 = (($R$0) + 16|0);
      $67 = HEAP32[$66>>2]|0;
      $68 = ($67|0)==(0|0);
      if ($68) {
       break;
      } else {
       $R$0 = $67;$RP$0 = $66;
      }
     }
     $69 = ($RP$0>>>0)<($2>>>0);
     if ($69) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum35 = (($$sum2) + 8)|0;
     $48 = (($mem) + ($$sum35)|0);
     $49 = HEAP32[$48>>2]|0;
     $50 = ($49>>>0)<($2>>>0);
     if ($50) {
      _abort();
      // unreachable;
     }
     $51 = (($49) + 12|0);
     $52 = HEAP32[$51>>2]|0;
     $53 = ($52|0)==($14|0);
     if (!($53)) {
      _abort();
      // unreachable;
     }
     $54 = (($46) + 8|0);
     $55 = HEAP32[$54>>2]|0;
     $56 = ($55|0)==($14|0);
     if ($56) {
      HEAP32[$51>>2] = $46;
      HEAP32[$54>>2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $70 = ($44|0)==(0|0);
   if ($70) {
    $p$0 = $14;$psize$0 = $15;
   } else {
    $$sum32 = (($$sum2) + 28)|0;
    $71 = (($mem) + ($$sum32)|0);
    $72 = HEAP32[$71>>2]|0;
    $73 = ((15144 + ($72<<2)|0) + 304|0);
    $74 = HEAP32[$73>>2]|0;
    $75 = ($14|0)==($74|0);
    if ($75) {
     HEAP32[$73>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[((15144 + 4|0))>>2]|0;
      $79 = $78 & $77;
      HEAP32[((15144 + 4|0))>>2] = $79;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[((15144 + 16|0))>>2]|0;
     $81 = ($44>>>0)<($80>>>0);
     if ($81) {
      _abort();
      // unreachable;
     }
     $82 = (($44) + 16|0);
     $83 = HEAP32[$82>>2]|0;
     $84 = ($83|0)==($14|0);
     if ($84) {
      HEAP32[$82>>2] = $R$1;
     } else {
      $85 = (($44) + 20|0);
      HEAP32[$85>>2] = $R$1;
     }
     $86 = ($R$1|0)==(0|0);
     if ($86) {
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[((15144 + 16|0))>>2]|0;
    $88 = ($R$1>>>0)<($87>>>0);
    if ($88) {
     _abort();
     // unreachable;
    }
    $89 = (($R$1) + 24|0);
    HEAP32[$89>>2] = $44;
    $$sum33 = (($$sum2) + 16)|0;
    $90 = (($mem) + ($$sum33)|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = ($91|0)==(0|0);
    do {
     if (!($92)) {
      $93 = HEAP32[((15144 + 16|0))>>2]|0;
      $94 = ($91>>>0)<($93>>>0);
      if ($94) {
       _abort();
       // unreachable;
      } else {
       $95 = (($R$1) + 16|0);
       HEAP32[$95>>2] = $91;
       $96 = (($91) + 24|0);
       HEAP32[$96>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum34 = (($$sum2) + 20)|0;
    $97 = (($mem) + ($$sum34)|0);
    $98 = HEAP32[$97>>2]|0;
    $99 = ($98|0)==(0|0);
    if ($99) {
     $p$0 = $14;$psize$0 = $15;
    } else {
     $100 = HEAP32[((15144 + 16|0))>>2]|0;
     $101 = ($98>>>0)<($100>>>0);
     if ($101) {
      _abort();
      // unreachable;
     } else {
      $102 = (($R$1) + 20|0);
      HEAP32[$102>>2] = $98;
      $103 = (($98) + 24|0);
      HEAP32[$103>>2] = $R$1;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;$psize$0 = $8;
  }
 } while(0);
 $112 = ($p$0>>>0)<($9>>>0);
 if (!($112)) {
  _abort();
  // unreachable;
 }
 $$sum25 = (($8) + -4)|0;
 $113 = (($mem) + ($$sum25)|0);
 $114 = HEAP32[$113>>2]|0;
 $115 = $114 & 1;
 $116 = ($115|0)==(0);
 if ($116) {
  _abort();
  // unreachable;
 }
 $117 = $114 & 2;
 $118 = ($117|0)==(0);
 if ($118) {
  $119 = HEAP32[((15144 + 24|0))>>2]|0;
  $120 = ($9|0)==($119|0);
  if ($120) {
   $121 = HEAP32[((15144 + 12|0))>>2]|0;
   $122 = (($121) + ($psize$0))|0;
   HEAP32[((15144 + 12|0))>>2] = $122;
   HEAP32[((15144 + 24|0))>>2] = $p$0;
   $123 = $122 | 1;
   $124 = (($p$0) + 4|0);
   HEAP32[$124>>2] = $123;
   $125 = HEAP32[((15144 + 20|0))>>2]|0;
   $126 = ($p$0|0)==($125|0);
   if (!($126)) {
    STACKTOP = sp;return;
   }
   HEAP32[((15144 + 20|0))>>2] = 0;
   HEAP32[((15144 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $127 = HEAP32[((15144 + 20|0))>>2]|0;
  $128 = ($9|0)==($127|0);
  if ($128) {
   $129 = HEAP32[((15144 + 8|0))>>2]|0;
   $130 = (($129) + ($psize$0))|0;
   HEAP32[((15144 + 8|0))>>2] = $130;
   HEAP32[((15144 + 20|0))>>2] = $p$0;
   $131 = $130 | 1;
   $132 = (($p$0) + 4|0);
   HEAP32[$132>>2] = $131;
   $133 = (($p$0) + ($130)|0);
   HEAP32[$133>>2] = $130;
   STACKTOP = sp;return;
  }
  $134 = $114 & -8;
  $135 = (($134) + ($psize$0))|0;
  $136 = $114 >>> 3;
  $137 = ($114>>>0)<(256);
  do {
   if ($137) {
    $138 = (($mem) + ($8)|0);
    $139 = HEAP32[$138>>2]|0;
    $$sum2324 = $8 | 4;
    $140 = (($mem) + ($$sum2324)|0);
    $141 = HEAP32[$140>>2]|0;
    $142 = $136 << 1;
    $143 = ((15144 + ($142<<2)|0) + 40|0);
    $144 = ($139|0)==($143|0);
    if (!($144)) {
     $145 = HEAP32[((15144 + 16|0))>>2]|0;
     $146 = ($139>>>0)<($145>>>0);
     if ($146) {
      _abort();
      // unreachable;
     }
     $147 = (($139) + 12|0);
     $148 = HEAP32[$147>>2]|0;
     $149 = ($148|0)==($9|0);
     if (!($149)) {
      _abort();
      // unreachable;
     }
    }
    $150 = ($141|0)==($139|0);
    if ($150) {
     $151 = 1 << $136;
     $152 = $151 ^ -1;
     $153 = HEAP32[15144>>2]|0;
     $154 = $153 & $152;
     HEAP32[15144>>2] = $154;
     break;
    }
    $155 = ($141|0)==($143|0);
    if ($155) {
     $$pre67 = (($141) + 8|0);
     $$pre$phi68Z2D = $$pre67;
    } else {
     $156 = HEAP32[((15144 + 16|0))>>2]|0;
     $157 = ($141>>>0)<($156>>>0);
     if ($157) {
      _abort();
      // unreachable;
     }
     $158 = (($141) + 8|0);
     $159 = HEAP32[$158>>2]|0;
     $160 = ($159|0)==($9|0);
     if ($160) {
      $$pre$phi68Z2D = $158;
     } else {
      _abort();
      // unreachable;
     }
    }
    $161 = (($139) + 12|0);
    HEAP32[$161>>2] = $141;
    HEAP32[$$pre$phi68Z2D>>2] = $139;
   } else {
    $$sum5 = (($8) + 16)|0;
    $162 = (($mem) + ($$sum5)|0);
    $163 = HEAP32[$162>>2]|0;
    $$sum67 = $8 | 4;
    $164 = (($mem) + ($$sum67)|0);
    $165 = HEAP32[$164>>2]|0;
    $166 = ($165|0)==($9|0);
    do {
     if ($166) {
      $$sum9 = (($8) + 12)|0;
      $177 = (($mem) + ($$sum9)|0);
      $178 = HEAP32[$177>>2]|0;
      $179 = ($178|0)==(0|0);
      if ($179) {
       $$sum8 = (($8) + 8)|0;
       $180 = (($mem) + ($$sum8)|0);
       $181 = HEAP32[$180>>2]|0;
       $182 = ($181|0)==(0|0);
       if ($182) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $181;$RP9$0 = $180;
       }
      } else {
       $R7$0 = $178;$RP9$0 = $177;
      }
      while(1) {
       $183 = (($R7$0) + 20|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($184|0)==(0|0);
       if (!($185)) {
        $R7$0 = $184;$RP9$0 = $183;
        continue;
       }
       $186 = (($R7$0) + 16|0);
       $187 = HEAP32[$186>>2]|0;
       $188 = ($187|0)==(0|0);
       if ($188) {
        break;
       } else {
        $R7$0 = $187;$RP9$0 = $186;
       }
      }
      $189 = HEAP32[((15144 + 16|0))>>2]|0;
      $190 = ($RP9$0>>>0)<($189>>>0);
      if ($190) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0>>2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $167 = (($mem) + ($8)|0);
      $168 = HEAP32[$167>>2]|0;
      $169 = HEAP32[((15144 + 16|0))>>2]|0;
      $170 = ($168>>>0)<($169>>>0);
      if ($170) {
       _abort();
       // unreachable;
      }
      $171 = (($168) + 12|0);
      $172 = HEAP32[$171>>2]|0;
      $173 = ($172|0)==($9|0);
      if (!($173)) {
       _abort();
       // unreachable;
      }
      $174 = (($165) + 8|0);
      $175 = HEAP32[$174>>2]|0;
      $176 = ($175|0)==($9|0);
      if ($176) {
       HEAP32[$171>>2] = $165;
       HEAP32[$174>>2] = $168;
       $R7$1 = $165;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $191 = ($163|0)==(0|0);
    if (!($191)) {
     $$sum18 = (($8) + 20)|0;
     $192 = (($mem) + ($$sum18)|0);
     $193 = HEAP32[$192>>2]|0;
     $194 = ((15144 + ($193<<2)|0) + 304|0);
     $195 = HEAP32[$194>>2]|0;
     $196 = ($9|0)==($195|0);
     if ($196) {
      HEAP32[$194>>2] = $R7$1;
      $cond54 = ($R7$1|0)==(0|0);
      if ($cond54) {
       $197 = 1 << $193;
       $198 = $197 ^ -1;
       $199 = HEAP32[((15144 + 4|0))>>2]|0;
       $200 = $199 & $198;
       HEAP32[((15144 + 4|0))>>2] = $200;
       break;
      }
     } else {
      $201 = HEAP32[((15144 + 16|0))>>2]|0;
      $202 = ($163>>>0)<($201>>>0);
      if ($202) {
       _abort();
       // unreachable;
      }
      $203 = (($163) + 16|0);
      $204 = HEAP32[$203>>2]|0;
      $205 = ($204|0)==($9|0);
      if ($205) {
       HEAP32[$203>>2] = $R7$1;
      } else {
       $206 = (($163) + 20|0);
       HEAP32[$206>>2] = $R7$1;
      }
      $207 = ($R7$1|0)==(0|0);
      if ($207) {
       break;
      }
     }
     $208 = HEAP32[((15144 + 16|0))>>2]|0;
     $209 = ($R7$1>>>0)<($208>>>0);
     if ($209) {
      _abort();
      // unreachable;
     }
     $210 = (($R7$1) + 24|0);
     HEAP32[$210>>2] = $163;
     $$sum19 = (($8) + 8)|0;
     $211 = (($mem) + ($$sum19)|0);
     $212 = HEAP32[$211>>2]|0;
     $213 = ($212|0)==(0|0);
     do {
      if (!($213)) {
       $214 = HEAP32[((15144 + 16|0))>>2]|0;
       $215 = ($212>>>0)<($214>>>0);
       if ($215) {
        _abort();
        // unreachable;
       } else {
        $216 = (($R7$1) + 16|0);
        HEAP32[$216>>2] = $212;
        $217 = (($212) + 24|0);
        HEAP32[$217>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum20 = (($8) + 12)|0;
     $218 = (($mem) + ($$sum20)|0);
     $219 = HEAP32[$218>>2]|0;
     $220 = ($219|0)==(0|0);
     if (!($220)) {
      $221 = HEAP32[((15144 + 16|0))>>2]|0;
      $222 = ($219>>>0)<($221>>>0);
      if ($222) {
       _abort();
       // unreachable;
      } else {
       $223 = (($R7$1) + 20|0);
       HEAP32[$223>>2] = $219;
       $224 = (($219) + 24|0);
       HEAP32[$224>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $225 = $135 | 1;
  $226 = (($p$0) + 4|0);
  HEAP32[$226>>2] = $225;
  $227 = (($p$0) + ($135)|0);
  HEAP32[$227>>2] = $135;
  $228 = HEAP32[((15144 + 20|0))>>2]|0;
  $229 = ($p$0|0)==($228|0);
  if ($229) {
   HEAP32[((15144 + 8|0))>>2] = $135;
   STACKTOP = sp;return;
  } else {
   $psize$1 = $135;
  }
 } else {
  $230 = $114 & -2;
  HEAP32[$113>>2] = $230;
  $231 = $psize$0 | 1;
  $232 = (($p$0) + 4|0);
  HEAP32[$232>>2] = $231;
  $233 = (($p$0) + ($psize$0)|0);
  HEAP32[$233>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $234 = $psize$1 >>> 3;
 $235 = ($psize$1>>>0)<(256);
 if ($235) {
  $236 = $234 << 1;
  $237 = ((15144 + ($236<<2)|0) + 40|0);
  $238 = HEAP32[15144>>2]|0;
  $239 = 1 << $234;
  $240 = $238 & $239;
  $241 = ($240|0)==(0);
  if ($241) {
   $242 = $238 | $239;
   HEAP32[15144>>2] = $242;
   $$sum16$pre = (($236) + 2)|0;
   $$pre = ((15144 + ($$sum16$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F16$0 = $237;
  } else {
   $$sum17 = (($236) + 2)|0;
   $243 = ((15144 + ($$sum17<<2)|0) + 40|0);
   $244 = HEAP32[$243>>2]|0;
   $245 = HEAP32[((15144 + 16|0))>>2]|0;
   $246 = ($244>>>0)<($245>>>0);
   if ($246) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $243;$F16$0 = $244;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $247 = (($F16$0) + 12|0);
  HEAP32[$247>>2] = $p$0;
  $248 = (($p$0) + 8|0);
  HEAP32[$248>>2] = $F16$0;
  $249 = (($p$0) + 12|0);
  HEAP32[$249>>2] = $237;
  STACKTOP = sp;return;
 }
 $250 = $psize$1 >>> 8;
 $251 = ($250|0)==(0);
 if ($251) {
  $I18$0 = 0;
 } else {
  $252 = ($psize$1>>>0)>(16777215);
  if ($252) {
   $I18$0 = 31;
  } else {
   $253 = (($250) + 1048320)|0;
   $254 = $253 >>> 16;
   $255 = $254 & 8;
   $256 = $250 << $255;
   $257 = (($256) + 520192)|0;
   $258 = $257 >>> 16;
   $259 = $258 & 4;
   $260 = $259 | $255;
   $261 = $256 << $259;
   $262 = (($261) + 245760)|0;
   $263 = $262 >>> 16;
   $264 = $263 & 2;
   $265 = $260 | $264;
   $266 = (14 - ($265))|0;
   $267 = $261 << $264;
   $268 = $267 >>> 15;
   $269 = (($266) + ($268))|0;
   $270 = $269 << 1;
   $271 = (($269) + 7)|0;
   $272 = $psize$1 >>> $271;
   $273 = $272 & 1;
   $274 = $273 | $270;
   $I18$0 = $274;
  }
 }
 $275 = ((15144 + ($I18$0<<2)|0) + 304|0);
 $276 = (($p$0) + 28|0);
 $I18$0$c = $I18$0;
 HEAP32[$276>>2] = $I18$0$c;
 $277 = (($p$0) + 20|0);
 HEAP32[$277>>2] = 0;
 $278 = (($p$0) + 16|0);
 HEAP32[$278>>2] = 0;
 $279 = HEAP32[((15144 + 4|0))>>2]|0;
 $280 = 1 << $I18$0;
 $281 = $279 & $280;
 $282 = ($281|0)==(0);
 L199: do {
  if ($282) {
   $283 = $279 | $280;
   HEAP32[((15144 + 4|0))>>2] = $283;
   HEAP32[$275>>2] = $p$0;
   $284 = (($p$0) + 24|0);
   HEAP32[$284>>2] = $275;
   $285 = (($p$0) + 12|0);
   HEAP32[$285>>2] = $p$0;
   $286 = (($p$0) + 8|0);
   HEAP32[$286>>2] = $p$0;
  } else {
   $287 = HEAP32[$275>>2]|0;
   $288 = ($I18$0|0)==(31);
   if ($288) {
    $296 = 0;
   } else {
    $289 = $I18$0 >>> 1;
    $290 = (25 - ($289))|0;
    $296 = $290;
   }
   $291 = (($287) + 4|0);
   $292 = HEAP32[$291>>2]|0;
   $293 = $292 & -8;
   $294 = ($293|0)==($psize$1|0);
   L205: do {
    if ($294) {
     $T$0$lcssa = $287;
    } else {
     $295 = $psize$1 << $296;
     $K19$057 = $295;$T$056 = $287;
     while(1) {
      $303 = $K19$057 >>> 31;
      $304 = ((($T$056) + ($303<<2)|0) + 16|0);
      $299 = HEAP32[$304>>2]|0;
      $305 = ($299|0)==(0|0);
      if ($305) {
       break;
      }
      $297 = $K19$057 << 1;
      $298 = (($299) + 4|0);
      $300 = HEAP32[$298>>2]|0;
      $301 = $300 & -8;
      $302 = ($301|0)==($psize$1|0);
      if ($302) {
       $T$0$lcssa = $299;
       break L205;
      } else {
       $K19$057 = $297;$T$056 = $299;
      }
     }
     $306 = HEAP32[((15144 + 16|0))>>2]|0;
     $307 = ($304>>>0)<($306>>>0);
     if ($307) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$304>>2] = $p$0;
      $308 = (($p$0) + 24|0);
      HEAP32[$308>>2] = $T$056;
      $309 = (($p$0) + 12|0);
      HEAP32[$309>>2] = $p$0;
      $310 = (($p$0) + 8|0);
      HEAP32[$310>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $311 = (($T$0$lcssa) + 8|0);
   $312 = HEAP32[$311>>2]|0;
   $313 = HEAP32[((15144 + 16|0))>>2]|0;
   $314 = ($T$0$lcssa>>>0)<($313>>>0);
   if ($314) {
    _abort();
    // unreachable;
   }
   $315 = ($312>>>0)<($313>>>0);
   if ($315) {
    _abort();
    // unreachable;
   } else {
    $316 = (($312) + 12|0);
    HEAP32[$316>>2] = $p$0;
    HEAP32[$311>>2] = $p$0;
    $317 = (($p$0) + 8|0);
    HEAP32[$317>>2] = $312;
    $318 = (($p$0) + 12|0);
    HEAP32[$318>>2] = $T$0$lcssa;
    $319 = (($p$0) + 24|0);
    HEAP32[$319>>2] = 0;
    break;
   }
  }
 } while(0);
 $320 = HEAP32[((15144 + 32|0))>>2]|0;
 $321 = (($320) + -1)|0;
 HEAP32[((15144 + 32|0))>>2] = $321;
 $322 = ($321|0)==(0);
 if ($322) {
  $sp$0$in$i = ((15144 + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $323 = ($sp$0$i|0)==(0|0);
  $324 = (($sp$0$i) + 8|0);
  if ($323) {
   break;
  } else {
   $sp$0$in$i = $324;
  }
 }
 HEAP32[((15144 + 32|0))>>2] = -1;
 STACKTOP = sp;return;
}
function __ZNSt9bad_allocD0Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 __ZNSt9exceptionD2Ev(($this|0));
 $0 = ($this|0)==(0|0);
 if (!($0)) {
  _free($this);
 }
 STACKTOP = sp;return;
}
function __ZNSt9bad_allocD2Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZNSt9exceptionD2Ev(($this|0));
 STACKTOP = sp;return;
}
function __ZNKSt9bad_alloc4whatEv($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return (15672|0);
}
function runPostSets() {
 HEAP32[3928] = __ZTISt9exception;
}
function _i64Subtract(a, b, c, d) {
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a - c)>>>0;
    h = (b - d)>>>0;
    h = (b - d - (((c>>>0) > (a>>>0))|0))>>>0; // Borrow one from high word to low word on underflow.
    return ((tempRet0 = h,l|0)|0);
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[((ptr)>>0)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[((ptr)>>0)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[((curr)>>0)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}
function _i64Add(a, b, c, d) {
    /*
      x = a + b*2^32
      y = c + d*2^32
      result = l + h*2^32
    */
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a + c)>>>0;
    h = (b + d + (((l>>>0) < (a>>>0))|0))>>>0; // Add carry from low word to high word on overflow.
    return ((tempRet0 = h,l|0)|0);
}
function _memcpy(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _strcpy(pdest, psrc) {
    pdest = pdest|0; psrc = psrc|0;
    var i = 0;
    do {
      HEAP8[(((pdest+i)|0)>>0)]=HEAP8[(((psrc+i)|0)>>0)];
      i = (i+1)|0;
    } while (((HEAP8[(((psrc)+(i-1))>>0)])|0));
    return pdest|0;
}
function _bitshift64Shl(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits));
      return low << bits;
    }
    tempRet0 = low << (bits - 32);
    return 0;
  }
function _bitshift64Lshr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >>> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = 0;
    return (high >>> (bits - 32))|0;
  }
function _bitshift64Ashr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = (high|0) < 0 ? -1 : 0;
    return (high >> (bits - 32))|0;
  }
function _llvm_ctlz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((ctlz_i8)+(x >>> 24))>>0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((ctlz_i8)+((x >> 16)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((ctlz_i8)+((x >> 8)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((ctlz_i8)+(x&0xff))>>0)])|0) + 24)|0;
  }

function _llvm_cttz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((cttz_i8)+(x & 0xff))>>0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 8)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 16)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((cttz_i8)+(x >>> 24))>>0)])|0) + 24)|0;
  }

// ======== compiled code from system/lib/compiler-rt , see readme therein
function ___muldsi3($a, $b) {
  $a = $a | 0;
  $b = $b | 0;
  var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
  $1 = $a & 65535;
  $2 = $b & 65535;
  $3 = Math_imul($2, $1) | 0;
  $6 = $a >>> 16;
  $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
  $11 = $b >>> 16;
  $12 = Math_imul($11, $1) | 0;
  return (tempRet0 = (($8 >>> 16) + (Math_imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
}
function ___divdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $7$0 = 0, $7$1 = 0, $8$0 = 0, $10$0 = 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  $7$0 = $2$0 ^ $1$0;
  $7$1 = $2$1 ^ $1$1;
  $8$0 = ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, 0) | 0;
  $10$0 = _i64Subtract($8$0 ^ $7$0, tempRet0 ^ $7$1, $7$0, $7$1) | 0;
  return (tempRet0 = tempRet0, $10$0) | 0;
}
function ___remdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, $rem) | 0;
  $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0, HEAP32[$rem + 4 >> 2] ^ $1$1, $1$0, $1$1) | 0;
  $10$1 = tempRet0;
  STACKTOP = __stackBase__;
  return (tempRet0 = $10$1, $10$0) | 0;
}
function ___muldi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0, $2 = 0;
  $x_sroa_0_0_extract_trunc = $a$0;
  $y_sroa_0_0_extract_trunc = $b$0;
  $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
  $1$1 = tempRet0;
  $2 = Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
  return (tempRet0 = ((Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0, 0 | $1$0 & -1) | 0;
}
function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0;
  $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
  return (tempRet0 = tempRet0, $1$0) | 0;
}
function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 8 | 0;
  $rem = __stackBase__ | 0;
  ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
  STACKTOP = __stackBase__;
  return (tempRet0 = HEAP32[$rem + 4 >> 2] | 0, HEAP32[$rem >> 2] | 0) | 0;
}
function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  $rem = $rem | 0;
  var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $49 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $86 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $117 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $154$0 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $q_sroa_0_0_insert_insert77$1 = 0, $_0$0 = 0, $_0$1 = 0;
  $n_sroa_0_0_extract_trunc = $a$0;
  $n_sroa_1_4_extract_shift$0 = $a$1;
  $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
  $d_sroa_0_0_extract_trunc = $b$0;
  $d_sroa_1_4_extract_shift$0 = $b$1;
  $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
  if (($n_sroa_1_4_extract_trunc | 0) == 0) {
    $4 = ($rem | 0) != 0;
    if (($d_sroa_1_4_extract_trunc | 0) == 0) {
      if ($4) {
        HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
        HEAP32[$rem + 4 >> 2] = 0;
      }
      $_0$1 = 0;
      $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$4) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    }
  }
  $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
  do {
    if (($d_sroa_0_0_extract_trunc | 0) == 0) {
      if ($17) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
          HEAP32[$rem + 4 >> 2] = 0;
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      if (($n_sroa_0_0_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0;
          HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
      if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0 | $a$0 & -1;
          HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
        }
        $_0$1 = 0;
        $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $49 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
      $51 = $49 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
      if ($51 >>> 0 <= 30) {
        $57 = $51 + 1 | 0;
        $58 = 31 - $51 | 0;
        $sr_1_ph = $57;
        $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
        $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
        $q_sroa_0_1_ph = 0;
        $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
        break;
      }
      if (($rem | 0) == 0) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = 0 | $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$17) {
        $117 = _llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0;
        $119 = $117 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        if ($119 >>> 0 <= 31) {
          $125 = $119 + 1 | 0;
          $126 = 31 - $119 | 0;
          $130 = $119 - 31 >> 31;
          $sr_1_ph = $125;
          $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
          $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
          $q_sroa_0_1_ph = 0;
          $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
          break;
        }
        if (($rem | 0) == 0) {
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet0 = $_0$1, $_0$0) | 0;
        }
        HEAP32[$rem >> 2] = 0 | $a$0 & -1;
        HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
      if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
        $86 = (_llvm_ctlz_i32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 | 0;
        $88 = $86 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        $89 = 64 - $88 | 0;
        $91 = 32 - $88 | 0;
        $92 = $91 >> 31;
        $95 = $88 - 32 | 0;
        $105 = $95 >> 31;
        $sr_1_ph = $88;
        $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
        $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
        $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
        $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
        break;
      }
      if (($rem | 0) != 0) {
        HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
        HEAP32[$rem + 4 >> 2] = 0;
      }
      if (($d_sroa_0_0_extract_trunc | 0) == 1) {
        $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$0 = 0 | $a$0 & -1;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      } else {
        $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
        $_0$1 = 0 | $n_sroa_1_4_extract_trunc >>> ($78 >>> 0);
        $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
    }
  } while (0);
  if (($sr_1_ph | 0) == 0) {
    $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
    $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
    $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
    $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = 0;
  } else {
    $d_sroa_0_0_insert_insert99$0 = 0 | $b$0 & -1;
    $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
    $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0, $d_sroa_0_0_insert_insert99$1, -1, -1) | 0;
    $137$1 = tempRet0;
    $q_sroa_1_1198 = $q_sroa_1_1_ph;
    $q_sroa_0_1199 = $q_sroa_0_1_ph;
    $r_sroa_1_1200 = $r_sroa_1_1_ph;
    $r_sroa_0_1201 = $r_sroa_0_1_ph;
    $sr_1202 = $sr_1_ph;
    $carry_0203 = 0;
    while (1) {
      $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
      $149 = $carry_0203 | $q_sroa_0_1199 << 1;
      $r_sroa_0_0_insert_insert42$0 = 0 | ($r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31);
      $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
      _i64Subtract($137$0, $137$1, $r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1) | 0;
      $150$1 = tempRet0;
      $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
      $152 = $151$0 & 1;
      $154$0 = _i64Subtract($r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1, $151$0 & $d_sroa_0_0_insert_insert99$0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1) | 0;
      $r_sroa_0_0_extract_trunc = $154$0;
      $r_sroa_1_4_extract_trunc = tempRet0;
      $155 = $sr_1202 - 1 | 0;
      if (($155 | 0) == 0) {
        break;
      } else {
        $q_sroa_1_1198 = $147;
        $q_sroa_0_1199 = $149;
        $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
        $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
        $sr_1202 = $155;
        $carry_0203 = $152;
      }
    }
    $q_sroa_1_1_lcssa = $147;
    $q_sroa_0_1_lcssa = $149;
    $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = $152;
  }
  $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
  $q_sroa_0_0_insert_ext75$1 = 0;
  $q_sroa_0_0_insert_insert77$1 = $q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1;
  if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = 0 | $r_sroa_0_1_lcssa;
    HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa | 0;
  }
  $_0$1 = (0 | $q_sroa_0_0_insert_ext75$0) >>> 31 | $q_sroa_0_0_insert_insert77$1 << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
  $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
  return (tempRet0 = $_0$1, $_0$0) | 0;
}
// =======================================================================



// EMSCRIPTEN_END_FUNCS

  
  function dynCall_iiii(index,a1,a2,a3) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0;
    return FUNCTION_TABLE_iiii[index&127](a1|0,a2|0,a3|0)|0;
  }


  function jsCall_iiii_0(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(0,a1|0,a2|0,a3|0)|0;
  }



  function jsCall_iiii_1(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(1,a1|0,a2|0,a3|0)|0;
  }



  function jsCall_iiii_2(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(2,a1|0,a2|0,a3|0)|0;
  }



  function jsCall_iiii_3(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(3,a1|0,a2|0,a3|0)|0;
  }



  function jsCall_iiii_4(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(4,a1|0,a2|0,a3|0)|0;
  }



  function jsCall_iiii_5(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(5,a1|0,a2|0,a3|0)|0;
  }



  function jsCall_iiii_6(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(6,a1|0,a2|0,a3|0)|0;
  }



  function jsCall_iiii_7(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(7,a1|0,a2|0,a3|0)|0;
  }



  function jsCall_iiii_8(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(8,a1|0,a2|0,a3|0)|0;
  }



  function jsCall_iiii_9(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    return jsCall(9,a1|0,a2|0,a3|0)|0;
  }



  function dynCall_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    FUNCTION_TABLE_viiiiiiiiii[index&127](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }


  function jsCall_viiiiiiiiii_0(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(0,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function jsCall_viiiiiiiiii_1(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(1,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function jsCall_viiiiiiiiii_2(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(2,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function jsCall_viiiiiiiiii_3(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(3,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function jsCall_viiiiiiiiii_4(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(4,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function jsCall_viiiiiiiiii_5(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(5,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function jsCall_viiiiiiiiii_6(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(6,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function jsCall_viiiiiiiiii_7(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(7,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function jsCall_viiiiiiiiii_8(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(8,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function jsCall_viiiiiiiiii_9(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0; a10=a10|0;
    jsCall(9,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0,a10|0);
  }



  function dynCall_vid(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=+a2;
    FUNCTION_TABLE_vid[index&127](a1|0,+a2);
  }


  function jsCall_vid_0(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(0,a1|0,+a2);
  }



  function jsCall_vid_1(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(1,a1|0,+a2);
  }



  function jsCall_vid_2(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(2,a1|0,+a2);
  }



  function jsCall_vid_3(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(3,a1|0,+a2);
  }



  function jsCall_vid_4(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(4,a1|0,+a2);
  }



  function jsCall_vid_5(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(5,a1|0,+a2);
  }



  function jsCall_vid_6(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(6,a1|0,+a2);
  }



  function jsCall_vid_7(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(7,a1|0,+a2);
  }



  function jsCall_vid_8(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(8,a1|0,+a2);
  }



  function jsCall_vid_9(a1,a2) {
    a1=a1|0; a2=+a2;
    jsCall(9,a1|0,+a2);
  }



  function dynCall_viiiii(index,a1,a2,a3,a4,a5) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    FUNCTION_TABLE_viiiii[index&127](a1|0,a2|0,a3|0,a4|0,a5|0);
  }


  function jsCall_viiiii_0(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(0,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function jsCall_viiiii_1(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(1,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function jsCall_viiiii_2(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(2,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function jsCall_viiiii_3(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(3,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function jsCall_viiiii_4(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(4,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function jsCall_viiiii_5(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(5,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function jsCall_viiiii_6(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(6,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function jsCall_viiiii_7(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(7,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function jsCall_viiiii_8(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(8,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function jsCall_viiiii_9(a1,a2,a3,a4,a5) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
    jsCall(9,a1|0,a2|0,a3|0,a4|0,a5|0);
  }



  function dynCall_i(index) {
    index = index|0;
    
    return FUNCTION_TABLE_i[index&255]()|0;
  }


  function jsCall_i_0() {
    
    return jsCall(0)|0;
  }



  function jsCall_i_1() {
    
    return jsCall(1)|0;
  }



  function jsCall_i_2() {
    
    return jsCall(2)|0;
  }



  function jsCall_i_3() {
    
    return jsCall(3)|0;
  }



  function jsCall_i_4() {
    
    return jsCall(4)|0;
  }



  function jsCall_i_5() {
    
    return jsCall(5)|0;
  }



  function jsCall_i_6() {
    
    return jsCall(6)|0;
  }



  function jsCall_i_7() {
    
    return jsCall(7)|0;
  }



  function jsCall_i_8() {
    
    return jsCall(8)|0;
  }



  function jsCall_i_9() {
    
    return jsCall(9)|0;
  }



  function dynCall_vi(index,a1) {
    index = index|0;
    a1=a1|0;
    FUNCTION_TABLE_vi[index&255](a1|0);
  }


  function jsCall_vi_0(a1) {
    a1=a1|0;
    jsCall(0,a1|0);
  }



  function jsCall_vi_1(a1) {
    a1=a1|0;
    jsCall(1,a1|0);
  }



  function jsCall_vi_2(a1) {
    a1=a1|0;
    jsCall(2,a1|0);
  }



  function jsCall_vi_3(a1) {
    a1=a1|0;
    jsCall(3,a1|0);
  }



  function jsCall_vi_4(a1) {
    a1=a1|0;
    jsCall(4,a1|0);
  }



  function jsCall_vi_5(a1) {
    a1=a1|0;
    jsCall(5,a1|0);
  }



  function jsCall_vi_6(a1) {
    a1=a1|0;
    jsCall(6,a1|0);
  }



  function jsCall_vi_7(a1) {
    a1=a1|0;
    jsCall(7,a1|0);
  }



  function jsCall_vi_8(a1) {
    a1=a1|0;
    jsCall(8,a1|0);
  }



  function jsCall_vi_9(a1) {
    a1=a1|0;
    jsCall(9,a1|0);
  }



  function dynCall_vii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    FUNCTION_TABLE_vii[index&255](a1|0,a2|0);
  }


  function jsCall_vii_0(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(0,a1|0,a2|0);
  }



  function jsCall_vii_1(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(1,a1|0,a2|0);
  }



  function jsCall_vii_2(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(2,a1|0,a2|0);
  }



  function jsCall_vii_3(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(3,a1|0,a2|0);
  }



  function jsCall_vii_4(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(4,a1|0,a2|0);
  }



  function jsCall_vii_5(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(5,a1|0,a2|0);
  }



  function jsCall_vii_6(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(6,a1|0,a2|0);
  }



  function jsCall_vii_7(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(7,a1|0,a2|0);
  }



  function jsCall_vii_8(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(8,a1|0,a2|0);
  }



  function jsCall_vii_9(a1,a2) {
    a1=a1|0; a2=a2|0;
    jsCall(9,a1|0,a2|0);
  }



  function dynCall_ii(index,a1) {
    index = index|0;
    a1=a1|0;
    return FUNCTION_TABLE_ii[index&255](a1|0)|0;
  }


  function jsCall_ii_0(a1) {
    a1=a1|0;
    return jsCall(0,a1|0)|0;
  }



  function jsCall_ii_1(a1) {
    a1=a1|0;
    return jsCall(1,a1|0)|0;
  }



  function jsCall_ii_2(a1) {
    a1=a1|0;
    return jsCall(2,a1|0)|0;
  }



  function jsCall_ii_3(a1) {
    a1=a1|0;
    return jsCall(3,a1|0)|0;
  }



  function jsCall_ii_4(a1) {
    a1=a1|0;
    return jsCall(4,a1|0)|0;
  }



  function jsCall_ii_5(a1) {
    a1=a1|0;
    return jsCall(5,a1|0)|0;
  }



  function jsCall_ii_6(a1) {
    a1=a1|0;
    return jsCall(6,a1|0)|0;
  }



  function jsCall_ii_7(a1) {
    a1=a1|0;
    return jsCall(7,a1|0)|0;
  }



  function jsCall_ii_8(a1) {
    a1=a1|0;
    return jsCall(8,a1|0)|0;
  }



  function jsCall_ii_9(a1) {
    a1=a1|0;
    return jsCall(9,a1|0)|0;
  }



  function dynCall_iid(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=+a2;
    return FUNCTION_TABLE_iid[index&127](a1|0,+a2)|0;
  }


  function jsCall_iid_0(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(0,a1|0,+a2)|0;
  }



  function jsCall_iid_1(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(1,a1|0,+a2)|0;
  }



  function jsCall_iid_2(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(2,a1|0,+a2)|0;
  }



  function jsCall_iid_3(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(3,a1|0,+a2)|0;
  }



  function jsCall_iid_4(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(4,a1|0,+a2)|0;
  }



  function jsCall_iid_5(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(5,a1|0,+a2)|0;
  }



  function jsCall_iid_6(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(6,a1|0,+a2)|0;
  }



  function jsCall_iid_7(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(7,a1|0,+a2)|0;
  }



  function jsCall_iid_8(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(8,a1|0,+a2)|0;
  }



  function jsCall_iid_9(a1,a2) {
    a1=a1|0; a2=+a2;
    return jsCall(9,a1|0,+a2)|0;
  }



  function dynCall_viii(index,a1,a2,a3) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0;
    FUNCTION_TABLE_viii[index&255](a1|0,a2|0,a3|0);
  }


  function jsCall_viii_0(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(0,a1|0,a2|0,a3|0);
  }



  function jsCall_viii_1(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(1,a1|0,a2|0,a3|0);
  }



  function jsCall_viii_2(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(2,a1|0,a2|0,a3|0);
  }



  function jsCall_viii_3(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(3,a1|0,a2|0,a3|0);
  }



  function jsCall_viii_4(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(4,a1|0,a2|0,a3|0);
  }



  function jsCall_viii_5(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(5,a1|0,a2|0,a3|0);
  }



  function jsCall_viii_6(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(6,a1|0,a2|0,a3|0);
  }



  function jsCall_viii_7(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(7,a1|0,a2|0,a3|0);
  }



  function jsCall_viii_8(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(8,a1|0,a2|0,a3|0);
  }



  function jsCall_viii_9(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=a3|0;
    jsCall(9,a1|0,a2|0,a3|0);
  }



  function dynCall_v(index) {
    index = index|0;
    
    FUNCTION_TABLE_v[index&31]();
  }


  function jsCall_v_0() {
    
    jsCall(0);
  }



  function jsCall_v_1() {
    
    jsCall(1);
  }



  function jsCall_v_2() {
    
    jsCall(2);
  }



  function jsCall_v_3() {
    
    jsCall(3);
  }



  function jsCall_v_4() {
    
    jsCall(4);
  }



  function jsCall_v_5() {
    
    jsCall(5);
  }



  function jsCall_v_6() {
    
    jsCall(6);
  }



  function jsCall_v_7() {
    
    jsCall(7);
  }



  function jsCall_v_8() {
    
    jsCall(8);
  }



  function jsCall_v_9() {
    
    jsCall(9);
  }



  function dynCall_viid(index,a1,a2,a3) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=+a3;
    FUNCTION_TABLE_viid[index&255](a1|0,a2|0,+a3);
  }


  function jsCall_viid_0(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(0,a1|0,a2|0,+a3);
  }



  function jsCall_viid_1(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(1,a1|0,a2|0,+a3);
  }



  function jsCall_viid_2(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(2,a1|0,a2|0,+a3);
  }



  function jsCall_viid_3(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(3,a1|0,a2|0,+a3);
  }



  function jsCall_viid_4(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(4,a1|0,a2|0,+a3);
  }



  function jsCall_viid_5(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(5,a1|0,a2|0,+a3);
  }



  function jsCall_viid_6(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(6,a1|0,a2|0,+a3);
  }



  function jsCall_viid_7(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(7,a1|0,a2|0,+a3);
  }



  function jsCall_viid_8(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(8,a1|0,a2|0,+a3);
  }



  function jsCall_viid_9(a1,a2,a3) {
    a1=a1|0; a2=a2|0; a3=+a3;
    jsCall(9,a1|0,a2|0,+a3);
  }



  function dynCall_viiiiii(index,a1,a2,a3,a4,a5,a6) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    FUNCTION_TABLE_viiiiii[index&127](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }


  function jsCall_viiiiii_0(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(0,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function jsCall_viiiiii_1(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(1,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function jsCall_viiiiii_2(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(2,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function jsCall_viiiiii_3(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(3,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function jsCall_viiiiii_4(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(4,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function jsCall_viiiiii_5(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(5,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function jsCall_viiiiii_6(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(6,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function jsCall_viiiiii_7(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(7,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function jsCall_viiiiii_8(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(8,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function jsCall_viiiiii_9(a1,a2,a3,a4,a5,a6) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
    jsCall(9,a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
  }



  function dynCall_iii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    return FUNCTION_TABLE_iii[index&255](a1|0,a2|0)|0;
  }


  function jsCall_iii_0(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(0,a1|0,a2|0)|0;
  }



  function jsCall_iii_1(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(1,a1|0,a2|0)|0;
  }



  function jsCall_iii_2(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(2,a1|0,a2|0)|0;
  }



  function jsCall_iii_3(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(3,a1|0,a2|0)|0;
  }



  function jsCall_iii_4(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(4,a1|0,a2|0)|0;
  }



  function jsCall_iii_5(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(5,a1|0,a2|0)|0;
  }



  function jsCall_iii_6(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(6,a1|0,a2|0)|0;
  }



  function jsCall_iii_7(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(7,a1|0,a2|0)|0;
  }



  function jsCall_iii_8(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(8,a1|0,a2|0)|0;
  }



  function jsCall_iii_9(a1,a2) {
    a1=a1|0; a2=a2|0;
    return jsCall(9,a1|0,a2|0)|0;
  }



  function dynCall_id(index,a1) {
    index = index|0;
    a1=+a1;
    return FUNCTION_TABLE_id[index&127](+a1)|0;
  }


  function jsCall_id_0(a1) {
    a1=+a1;
    return jsCall(0,+a1)|0;
  }



  function jsCall_id_1(a1) {
    a1=+a1;
    return jsCall(1,+a1)|0;
  }



  function jsCall_id_2(a1) {
    a1=+a1;
    return jsCall(2,+a1)|0;
  }



  function jsCall_id_3(a1) {
    a1=+a1;
    return jsCall(3,+a1)|0;
  }



  function jsCall_id_4(a1) {
    a1=+a1;
    return jsCall(4,+a1)|0;
  }



  function jsCall_id_5(a1) {
    a1=+a1;
    return jsCall(5,+a1)|0;
  }



  function jsCall_id_6(a1) {
    a1=+a1;
    return jsCall(6,+a1)|0;
  }



  function jsCall_id_7(a1) {
    a1=+a1;
    return jsCall(7,+a1)|0;
  }



  function jsCall_id_8(a1) {
    a1=+a1;
    return jsCall(8,+a1)|0;
  }



  function jsCall_id_9(a1) {
    a1=+a1;
    return jsCall(9,+a1)|0;
  }



  function dynCall_viiii(index,a1,a2,a3,a4) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    FUNCTION_TABLE_viiii[index&127](a1|0,a2|0,a3|0,a4|0);
  }


  function jsCall_viiii_0(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(0,a1|0,a2|0,a3|0,a4|0);
  }



  function jsCall_viiii_1(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(1,a1|0,a2|0,a3|0,a4|0);
  }



  function jsCall_viiii_2(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(2,a1|0,a2|0,a3|0,a4|0);
  }



  function jsCall_viiii_3(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(3,a1|0,a2|0,a3|0,a4|0);
  }



  function jsCall_viiii_4(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(4,a1|0,a2|0,a3|0,a4|0);
  }



  function jsCall_viiii_5(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(5,a1|0,a2|0,a3|0,a4|0);
  }



  function jsCall_viiii_6(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(6,a1|0,a2|0,a3|0,a4|0);
  }



  function jsCall_viiii_7(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(7,a1|0,a2|0,a3|0,a4|0);
  }



  function jsCall_viiii_8(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(8,a1|0,a2|0,a3|0,a4|0);
  }



  function jsCall_viiii_9(a1,a2,a3,a4) {
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    jsCall(9,a1|0,a2|0,a3|0,a4|0);
  }


function b0(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_iiii(0);return 0; }
  function b1(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0;p8 = p8|0;p9 = p9|0; nullFunc_viiiiiiiiii(1); }
  function __embind_register_value_object_field__wrapper(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0;p8 = p8|0;p9 = p9|0; __embind_register_value_object_field(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0,p7|0,p8|0,p9|0); }
  function b2(p0,p1) { p0 = p0|0;p1 = +p1; nullFunc_vid(2); }
  function b3(p0,p1,p2,p3,p4) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0; nullFunc_viiiii(3); }
  function b4() { ; nullFunc_i(4);return 0; }
  function b5(p0) { p0 = p0|0; nullFunc_vi(5); }
  function __emval_decref__wrapper(p0) { p0 = p0|0; __emval_decref(p0|0); }
  function __emval_run_destructors__wrapper(p0) { p0 = p0|0; __emval_run_destructors(p0|0); }
  function __embind_finalize_value_object__wrapper(p0) { p0 = p0|0; __embind_finalize_value_object(p0|0); }
  function b6(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_vii(6); }
  function b7(p0) { p0 = p0|0; nullFunc_ii(7);return 0; }
  function b8(p0,p1) { p0 = p0|0;p1 = +p1; nullFunc_iid(8);return 0; }
  function b9(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_viii(9); }
  function ___cxa_throw__wrapper(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; ___cxa_throw(p0|0,p1|0,p2|0); }
  function b10() { ; nullFunc_v(10); }
  function ___cxa_pure_virtual__wrapper() { ; ___cxa_pure_virtual(); }
  function b11(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = +p2; nullFunc_viid(11); }
  function b12(p0,p1,p2,p3,p4,p5) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0; nullFunc_viiiiii(12); }
  function b13(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_iii(13);return 0; }
  function __emval_get_method_caller__wrapper(p0,p1) { p0 = p0|0;p1 = p1|0; return __emval_get_method_caller(p0|0,p1|0)|0; }
  function b14(p0) { p0 = +p0; nullFunc_id(14);return 0; }
  function b15(p0,p1,p2,p3) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; nullFunc_viiii(15); }
  function ___assert_fail__wrapper(p0,p1,p2,p3) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; ___assert_fail(p0|0,p1|0,p2|0,p3|0); }
  // EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_iiii = [b0,b0,jsCall_iiii_0,b0,jsCall_iiii_1,b0,jsCall_iiii_2,b0,jsCall_iiii_3,b0,jsCall_iiii_4,b0,jsCall_iiii_5,b0,jsCall_iiii_6,b0,jsCall_iiii_7,b0,jsCall_iiii_8,b0,jsCall_iiii_9,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,b0,b0,b0,b0,__ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv,b0,__ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,__ZN10emscripten12value_objectIN6fskube9FskParamsEE5fieldIS2_jEERS3_PKcMT_T0_,b0,b0,b0,__ZN10emscripten12value_objectIN6fskube13StackmatStateEE5fieldIS2_jEERS3_PKcMT_T0_,__ZN10emscripten12value_objectIN6fskube13StackmatStateEE5fieldIS2_hEERS3_PKcMT_T0_,b0,b0,b0,b0,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0];
  var FUNCTION_TABLE_viiiiiiiiii = [b1,b1,jsCall_viiiiiiiiii_0,b1,jsCall_viiiiiiiiii_1,b1,jsCall_viiiiiiiiii_2,b1,jsCall_viiiiiiiiii_3,b1,jsCall_viiiiiiiiii_4,b1,jsCall_viiiiiiiiii_5,b1,jsCall_viiiiiiiiii_6,b1,jsCall_viiiiiiiiii_7,b1,jsCall_viiiiiiiiii_8,b1,jsCall_viiiiiiiiii_9,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,__embind_register_value_object_field__wrapper,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1];
  var FUNCTION_TABLE_vid = [b2,b2,jsCall_vid_0,b2,jsCall_vid_1,b2,jsCall_vid_2,b2,jsCall_vid_3,b2,jsCall_vid_4,b2,jsCall_vid_5,b2,jsCall_vid_6,b2,jsCall_vid_7,b2,jsCall_vid_8,b2,jsCall_vid_9,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,__ZN6fskube21doubleReceiverWrapper7receiveEd,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,__ZN6fskube11Demodulator7receiveEd,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,__ZN6fskube9Digitizer7receiveEd,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2];
  var FUNCTION_TABLE_viiiii = [b3,b3,jsCall_viiiii_0,b3,jsCall_viiiii_1,b3,jsCall_viiiii_2,b3,jsCall_viiiii_3,b3,jsCall_viiiii_4,b3,jsCall_viiiii_5,b3,jsCall_viiiii_6,b3,jsCall_viiiii_7,b3,jsCall_viiiii_8,b3,jsCall_viiiii_9,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b3,b3,b3,b3,b3,b3,b3,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b3,b3,b3,__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3];
  var FUNCTION_TABLE_i = [b4,b4,jsCall_i_0,b4,jsCall_i_1,b4,jsCall_i_2,b4,jsCall_i_3,b4,jsCall_i_4,b4,jsCall_i_5,b4,jsCall_i_6,b4,jsCall_i_7,b4,jsCall_i_8,b4,jsCall_i_9,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,__ZN10emscripten8internal15raw_constructorIN6fskube9FskParamsEJEEEPT_DpNS0_11BindingTypeIT0_E8WireTypeE,b4,b4,b4,__ZN10emscripten8internal15raw_constructorIN6fskube13StackmatStateEJEEEPT_DpNS0_11BindingTypeIT0_E8WireTypeE,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,__ZN10emscripten8internal12operator_newIN6fskube16Rs232SynthesizerEJEEEPT_DpT0_,b4,b4,b4,b4,b4,__ZN10emscripten8internal12operator_newIN6fskube16Rs232InterpreterEJEEEPT_DpT0_,b4,b4,b4,b4,b4,b4,b4,__ZN10emscripten8internal12operator_newIN6fskube19StackmatSynthesizerEJEEEPT_DpT0_,b4,b4,b4,b4,b4,__ZN10emscripten8internal12operator_newIN6fskube19StackmatInterpreterEJEEEPT_DpT0_,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4];
  var FUNCTION_TABLE_vi = [b5,b5,jsCall_vi_0,b5,jsCall_vi_1,b5,jsCall_vi_2,b5,jsCall_vi_3,b5,jsCall_vi_4,b5,jsCall_vi_5,b5,jsCall_vi_6,b5,jsCall_vi_7,b5,jsCall_vi_8,b5,jsCall_vi_9,b5,__ZN6fskube28stackmatstateReceiverWrapperD1Ev,__ZN6fskube28stackmatstateReceiverWrapperD0Ev,b5,__ZN10emscripten7wrapperIN6fskube8ReceiverINS1_13StackmatStateEEEED1Ev,__ZN10emscripten7wrapperIN6fskube8ReceiverINS1_13StackmatStateEEEED0Ev,b5,__ZN6fskube18intReceiverWrapperD1Ev
  ,__ZN6fskube18intReceiverWrapperD0Ev,b5,__ZN10emscripten7wrapperIN6fskube8ReceiverIiEEED1Ev,__ZN10emscripten7wrapperIN6fskube8ReceiverIiEEED0Ev,__ZN6fskube21doubleReceiverWrapperD1Ev,__ZN6fskube21doubleReceiverWrapperD0Ev,b5,__ZN10emscripten7wrapperIN6fskube8ReceiverIdEEED1Ev,__ZN10emscripten7wrapperIN6fskube8ReceiverIdEEED0Ev,__ZN6fskube19boolReceiverWrapperD1Ev,__ZN6fskube19boolReceiverWrapperD0Ev,b5,__ZN10emscripten7wrapperIN6fskube8ReceiverIbEEED1Ev,__ZN10emscripten7wrapperIN6fskube8ReceiverIbEEED0Ev,__ZN6fskube9ModulatorD1Ev,__ZN6fskube9ModulatorD0Ev,b5,__ZN6fskube9Modulator5resetEv,__ZN6fskube11DemodulatorD1Ev,__ZN6fskube11DemodulatorD0Ev,b5,__ZN6fskube16Rs232SynthesizerD1Ev,__ZN6fskube16Rs232SynthesizerD0Ev,b5,__ZN6fskube16Rs232InterpreterD1Ev,__ZN6fskube16Rs232InterpreterD0Ev,b5,__ZN6fskube19StackmatSynthesizerD1Ev,__ZN6fskube19StackmatSynthesizerD0Ev,b5
  ,__ZN6fskube19StackmatInterpreterD1Ev,__ZN6fskube19StackmatInterpreterD0Ev,b5,__ZN21StackmatStateReceiverD1Ev,__ZN21StackmatStateReceiverD0Ev,b5,__ZN6fskube9DigitizerD1Ev,__ZN6fskube9DigitizerD0Ev,b5,__ZN6fskube9Digitizer5resetEv,__ZN10__cxxabiv116__shim_type_infoD2Ev,__ZN10__cxxabiv117__class_type_infoD0Ev,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,b5,b5,b5,b5,__ZN10__cxxabiv119__pointer_type_infoD0Ev,b5,__ZN10__cxxabiv123__fundamental_type_infoD0Ev,b5,__ZN10__cxxabiv120__si_class_type_infoD0Ev,b5,b5,b5,__ZN10__cxxabiv121__vmi_class_type_infoD0Ev,b5,b5,b5
  ,__ZNSt9bad_allocD2Ev,__ZNSt9bad_allocD0Ev,b5,b5,b5,b5,b5,b5,b5,b5,b5,__emval_decref__wrapper,b5,__emval_run_destructors__wrapper,b5,__ZN10emscripten8internal14raw_destructorIN6fskube9FskParamsEEEvPT_,b5,__embind_finalize_value_object__wrapper,b5,__ZN10emscripten8internal14raw_destructorIN6fskube13StackmatStateEEEvPT_,b5,b5,b5,b5,b5,b5,_fskube_initialize,b5,b5,b5
  ,_fskube_getState,b5,__ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIbEEEEvPT_,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube19boolReceiverWrapperEEEvPT_,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIdEEEEvPT_,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube21doubleReceiverWrapperEEEvPT_,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIiEEEEvPT_,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube18intReceiverWrapperEEEvPT_,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverINS2_13StackmatStateEEEEEvPT_
  ,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube28stackmatstateReceiverWrapperEEEvPT_,b5,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderIbdEEEEvPT_,b5,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderIdbEEEEvPT_,b5,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderIibEEEEvPT_,b5,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderIbiEEEEvPT_,b5
  ,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderIiNS2_13StackmatStateEEEEEvPT_,b5,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderINS2_13StackmatStateEiEEEEvPT_,b5,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube9ModulatorEEEvPT_,b5,b5,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube11DemodulatorEEEvPT_,b5,b5,__ZN6fskube11Demodulator5flushEv,b5,b5,b5
  ,b5,__ZN10emscripten8internal14raw_destructorIN6fskube16Rs232SynthesizerEEEvPT_,b5,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube16Rs232InterpreterEEEvPT_,b5,b5,__ZN6fskube16Rs232Interpreter5resetEv,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube19StackmatSynthesizerEEEvPT_,b5,b5,b5,b5,b5,__ZN10emscripten8internal14raw_destructorIN6fskube19StackmatInterpreterEEEvPT_,b5,b5,__ZN6fskube19StackmatInterpreter5resetEv,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5];
  var FUNCTION_TABLE_vii = [b6,b6,jsCall_vii_0,b6,jsCall_vii_1,b6,jsCall_vii_2,b6,jsCall_vii_3,b6,jsCall_vii_4,b6,jsCall_vii_5,b6,jsCall_vii_6,b6,jsCall_vii_7,b6,jsCall_vii_8,b6,jsCall_vii_9,b6,b6,b6,__ZN6fskube28stackmatstateReceiverWrapper7receiveENS_13StackmatStateE,b6,b6,b6,b6
  ,b6,__ZN6fskube18intReceiverWrapper7receiveEi,b6,b6,b6,b6,b6,b6,b6,b6,b6,__ZN6fskube19boolReceiverWrapper7receiveEb,b6,b6,b6,b6,__ZN6fskube9Modulator7receiveEb,b6,b6,b6,b6,b6,b6,__ZN6fskube16Rs232Synthesizer7receiveEi,b6,b6,__ZN6fskube16Rs232Interpreter7receiveEb,b6,b6,__ZN6fskube19StackmatSynthesizer7receiveENS_13StackmatStateE
  ,b6,b6,__ZN6fskube19StackmatInterpreter7receiveEi,b6,b6,__ZN21StackmatStateReceiver7receiveEN6fskube13StackmatStateE,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,__ZN10emscripten8internal7InvokerIvJjEE6invokeEPFvjEj,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,__ZN6fskube6SenderIbdE7connectEPNS_8ReceiverIdEE,b6,b6,b6,b6,b6,__ZN6fskube6SenderIdbE7connectEPNS_8ReceiverIbEE,b6,b6,b6,b6,b6,__ZN6fskube6SenderIibE7connectEPNS_8ReceiverIbEE,b6,b6,b6,b6,b6,__ZN6fskube6SenderIbiE7connectEPNS_8ReceiverIiEE
  ,b6,b6,b6,b6,b6,__ZN6fskube6SenderIiNS_13StackmatStateEE7connectEPNS_8ReceiverIS1_EE,b6,b6,b6,b6,b6,__ZN6fskube6SenderINS_13StackmatStateEiE7connectEPNS_8ReceiverIiEE,b6,b6,b6,b6,b6,b6,b6,__ZN10emscripten8internal13MethodInvokerIMN6fskube9ModulatorEFvvEvPS3_JEE6invokeERKS5_S6_,b6,b6,b6,b6,b6,b6,b6,__ZN10emscripten8internal13MethodInvokerIMN6fskube11DemodulatorEFvvEvPS3_JEE6invokeERKS5_S6_,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,__ZN10emscripten8internal13MethodInvokerIMN6fskube16Rs232InterpreterEFvvEvPS3_JEE6invokeERKS5_S6_,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,__ZN10emscripten8internal13MethodInvokerIMN6fskube19StackmatInterpreterEFvvEvPS3_JEE6invokeERKS5_S6_,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6];
  var FUNCTION_TABLE_ii = [b7,b7,jsCall_ii_0,b7,jsCall_ii_1,b7,jsCall_ii_2,b7,jsCall_ii_3,b7,jsCall_ii_4,b7,jsCall_ii_5,b7,jsCall_ii_6,b7,jsCall_ii_7,b7,jsCall_ii_8,b7,jsCall_ii_9,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,__ZNKSt9bad_alloc4whatEv,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,__ZN10emscripten8internal7InvokerIN6fskube13StackmatStateEJEE6invokeEPFS3_vE
  ,b7,__ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIbEEEEPKNS0_7_TYPEIDEPT_,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube19boolReceiverWrapperEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_19boolReceiverWrapperES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_19boolReceiverWrapperEEEPT0_PT_,b7,b7,__ZN10emscripten8internal11wrapped_newIPN6fskube19boolReceiverWrapperES3_JNS_3valEEEET_DpOT1_,__ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIdEEEEPKNS0_7_TYPEIDEPT_,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube21doubleReceiverWrapperEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerINS1_21doubleReceiverWrapperES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerIS3_NS1_21doubleReceiverWrapperEEEPT0_PT_,b7,b7,__ZN10emscripten8internal11wrapped_newIPN6fskube21doubleReceiverWrapperES3_JNS_3valEEEET_DpOT1_,__ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIiEEEEPKNS0_7_TYPEIDEPT_,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube18intReceiverWrapperEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_18intReceiverWrapperES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_18intReceiverWrapperEEEPT0_PT_,b7,b7,__ZN10emscripten8internal11wrapped_newIPN6fskube18intReceiverWrapperES3_JNS_3valEEEET_DpOT1_,__ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverINS2_13StackmatStateEEEEEPKNS0_7_TYPEIDEPT_,b7
  ,b7,__ZN10emscripten8internal13getActualTypeIN6fskube28stackmatstateReceiverWrapperEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverINS1_13StackmatStateEEEE14convertPointerINS1_28stackmatstateReceiverWrapperES4_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverINS1_13StackmatStateEEEE14convertPointerIS4_NS1_28stackmatstateReceiverWrapperEEEPT0_PT_,b7,b7,__ZN10emscripten8internal11wrapped_newIPN6fskube28stackmatstateReceiverWrapperES3_JNS_3valEEEET_DpOT1_,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderIbdEEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_6SenderIbdEES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_6SenderIbdEEEEPT0_PT_,b7,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderIdbEEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerINS1_6SenderIdbEES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerIS3_NS1_6SenderIdbEEEEPT0_PT_,b7,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderIibEEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_6SenderIibEES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_6SenderIibEEEEPT0_PT_,b7,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderIbiEEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_6SenderIbiEES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_6SenderIbiEEEEPT0_PT_,b7,b7
  ,b7,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderIiNS2_13StackmatStateEEEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_6SenderIiNS1_13StackmatStateEEES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_6SenderIiNS1_13StackmatStateEEEEEPT0_PT_,b7,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderINS2_13StackmatStateEiEEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube8ReceiverINS1_13StackmatStateEEEE14convertPointerINS1_6SenderIS3_iEES4_EEPT0_PT_,__ZN10emscripten4baseIN6fskube8ReceiverINS1_13StackmatStateEEEE14convertPointerIS4_NS1_6SenderIS3_iEEEEPT0_PT_,b7,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube9ModulatorEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube6SenderIbdEEE14convertPointerINS1_9ModulatorES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube6SenderIbdEEE14convertPointerIS3_NS1_9ModulatorEEEPT0_PT_,b7,b7,__ZN10emscripten8internal12operator_newIN6fskube9ModulatorEJNS2_9FskParamsEEEEPT_DpT0_,b7,__ZN10emscripten8internal13getActualTypeIN6fskube11DemodulatorEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube6SenderIdbEEE14convertPointerINS1_11DemodulatorES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube6SenderIdbEEE14convertPointerIS3_NS1_11DemodulatorEEEPT0_PT_,b7,b7,__ZN10emscripten8internal12operator_newIN6fskube11DemodulatorEJNS2_9FskParamsEEEEPT_DpT0_,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube16Rs232SynthesizerEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube6SenderIibEEE14convertPointerINS1_16Rs232SynthesizerES3_EEPT0_PT_
  ,__ZN10emscripten4baseIN6fskube6SenderIibEEE14convertPointerIS3_NS1_16Rs232SynthesizerEEEPT0_PT_,b7,__ZN10emscripten8internal7InvokerIPN6fskube16Rs232SynthesizerEJEE6invokeEPFS4_vE,b7,__ZN10emscripten8internal13getActualTypeIN6fskube16Rs232InterpreterEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube6SenderIbiEEE14convertPointerINS1_16Rs232InterpreterES3_EEPT0_PT_,__ZN10emscripten4baseIN6fskube6SenderIbiEEE14convertPointerIS3_NS1_16Rs232InterpreterEEEPT0_PT_,b7,__ZN10emscripten8internal7InvokerIPN6fskube16Rs232InterpreterEJEE6invokeEPFS4_vE,b7,b7,b7,__ZN10emscripten8internal13getActualTypeIN6fskube19StackmatSynthesizerEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube6SenderINS1_13StackmatStateEiEEE14convertPointerINS1_19StackmatSynthesizerES4_EEPT0_PT_,__ZN10emscripten4baseIN6fskube6SenderINS1_13StackmatStateEiEEE14convertPointerIS4_NS1_19StackmatSynthesizerEEEPT0_PT_,b7,__ZN10emscripten8internal7InvokerIPN6fskube19StackmatSynthesizerEJEE6invokeEPFS4_vE,b7,__ZN10emscripten8internal13getActualTypeIN6fskube19StackmatInterpreterEEEPKNS0_7_TYPEIDEPT_,__ZN10emscripten4baseIN6fskube6SenderIiNS1_13StackmatStateEEEE14convertPointerINS1_19StackmatInterpreterES4_EEPT0_PT_,__ZN10emscripten4baseIN6fskube6SenderIiNS1_13StackmatStateEEEE14convertPointerIS4_NS1_19StackmatInterpreterEEEPT0_PT_,b7,__ZN10emscripten8internal7InvokerIPN6fskube19StackmatInterpreterEJEE6invokeEPFS4_vE,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7];
  var FUNCTION_TABLE_iid = [b8,b8,jsCall_iid_0,b8,jsCall_iid_1,b8,jsCall_iid_2,b8,jsCall_iid_3,b8,jsCall_iid_4,b8,jsCall_iid_5,b8,jsCall_iid_6,b8,jsCall_iid_7,b8,jsCall_iid_8,b8,jsCall_iid_9,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,__ZN10emscripten8internal7InvokerIbJdEE6invokeEPFbdEd,b8,b8
  ,b8,b8,b8,b8,b8,b8,b8,b8,b8];
  var FUNCTION_TABLE_viii = [b9,b9,jsCall_viii_0,b9,jsCall_viii_1,b9,jsCall_viii_2,b9,jsCall_viii_3,b9,jsCall_viii_4,b9,jsCall_viii_5,b9,jsCall_viii_6,b9,jsCall_viii_7,b9,jsCall_viii_8,b9,jsCall_viii_9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,__ZN10emscripten8internal12MemberAccessIN6fskube9FskParamsEjE7setWireIS3_EEvRKMS3_jRT_j,b9,__ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEjE7setWireIS3_EEvRKMS3_jRT_j,b9,__ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEhE7setWireIS3_EEvRKMS3_hRT_h,___cxa_throw__wrapper,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,__ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEbE7setWireIS3_EEvRKMS3_bRT_b,b9,b9,b9,b9,b9
  ,b9,b9,b9,__ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIbEEFvbEvPS4_JbEE6invokeERKS6_S7_b,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,__ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIiEEFviEvPS4_JiEE6invokeERKS6_S7_i,b9,b9,b9,b9,b9,b9,b9,b9
  ,__ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverINS2_13StackmatStateEEEFvS4_EvPS5_JS4_EE6invokeERKS7_S8_PS4_,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIbdEEFvPNS2_8ReceiverIdEEEvPS4_JS7_EE6invokeERKS9_SA_S7_,b9,b9,b9,b9,b9,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIdbEEFvPNS2_8ReceiverIbEEEvPS4_JS7_EE6invokeERKS9_SA_S7_,b9,b9,b9,b9,b9,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIibEEFvPNS2_8ReceiverIbEEEvPS4_JS7_EE6invokeERKS9_SA_S7_,b9,b9,b9,b9,b9
  ,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIbiEEFvPNS2_8ReceiverIiEEEvPS4_JS7_EE6invokeERKS9_SA_S7_,b9,b9,b9,b9,b9,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIiNS2_13StackmatStateEEEFvPNS2_8ReceiverIS4_EEEvPS5_JS8_EE6invokeERKSA_SB_S8_,b9,b9,b9,b9,b9,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderINS2_13StackmatStateEiEEFvPNS2_8ReceiverIiEEEvPS5_JS8_EE6invokeERKSA_SB_S8_,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9
  ,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9,b9];
  var FUNCTION_TABLE_v = [b10,b10,jsCall_v_0,b10,jsCall_v_1,b10,jsCall_v_2,b10,jsCall_v_3,b10,jsCall_v_4,b10,jsCall_v_5,b10,jsCall_v_6,b10,jsCall_v_7,b10,jsCall_v_8,b10,jsCall_v_9,b10,b10,b10,b10,b10,b10,___cxa_pure_virtual__wrapper,b10
  ,b10,b10,b10];
  var FUNCTION_TABLE_viid = [b11,b11,jsCall_viid_0,b11,jsCall_viid_1,b11,jsCall_viid_2,b11,jsCall_viid_3,b11,jsCall_viid_4,b11,jsCall_viid_5,b11,jsCall_viid_6,b11,jsCall_viid_7,b11,jsCall_viid_8,b11,jsCall_viid_9,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,__ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIdEEFvdEvPS4_JdEE6invokeERKS6_S7_d,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11
  ,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11,b11];
  var FUNCTION_TABLE_viiiiii = [b12,b12,jsCall_viiiiii_0,b12,jsCall_viiiiii_1,b12,jsCall_viiiiii_2,b12,jsCall_viiiiii_3,b12,jsCall_viiiiii_4,b12,jsCall_viiiiii_5,b12,jsCall_viiiiii_6,b12,jsCall_viiiiii_7,b12,jsCall_viiiiii_8,b12,jsCall_viiiiii_9,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b12,b12,b12,b12,b12,b12,b12,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b12,b12,b12,__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12,b12
  ,b12,b12,b12,b12,b12,b12,b12,b12,b12];
  var FUNCTION_TABLE_iii = [b13,b13,jsCall_iii_0,b13,jsCall_iii_1,b13,jsCall_iii_2,b13,jsCall_iii_3,b13,jsCall_iii_4,b13,jsCall_iii_5,b13,jsCall_iii_6,b13,jsCall_iii_7,b13,jsCall_iii_8,b13,jsCall_iii_9,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,__ZN10emscripten8internal12MemberAccessIN6fskube9FskParamsEjE7getWireIS3_EEjRKMS3_jRKT_,b13,__ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEjE7getWireIS3_EEjRKMS3_jRKT_,b13,__ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEhE7getWireIS3_EEhRKMS3_hRKT_,b13,b13,b13,b13,__emval_get_method_caller__wrapper,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,__ZN10emscripten8internal12MemberAccessIN6fskube13StackmatStateEbE7getWireIS3_EEbRKMS3_bRKT_,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,__ZN10emscripten8internal7InvokerIPN6fskube19boolReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE,b13,b13,b13,b13,b13,b13,b13,b13,__ZN10emscripten8internal7InvokerIPN6fskube21doubleReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE,b13,b13,b13,b13,b13,b13,b13,b13,__ZN10emscripten8internal7InvokerIPN6fskube18intReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE,b13,b13,b13
  ,b13,b13,b13,b13,b13,__ZN10emscripten8internal7InvokerIPN6fskube28stackmatstateReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,__ZN10emscripten8internal7InvokerIPN6fskube9ModulatorEJNS2_9FskParamsEEE6invokeEPFS4_S5_EPS5_,b13,b13,b13,b13,b13,b13,__ZN10emscripten8internal7InvokerIPN6fskube11DemodulatorEJNS2_9FskParamsEEE6invokeEPFS4_S5_EPS5_,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13
  ,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13,b13];
  var FUNCTION_TABLE_id = [b14,b14,jsCall_id_0,b14,jsCall_id_1,b14,jsCall_id_2,b14,jsCall_id_3,b14,jsCall_id_4,b14,jsCall_id_5,b14,jsCall_id_6,b14,jsCall_id_7,b14,jsCall_id_8,b14,jsCall_id_9,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,b14,_fskube_addSample,b14
  ,b14,b14,b14,b14,b14,b14,b14,b14,b14];
  var FUNCTION_TABLE_viiii = [b15,b15,jsCall_viiii_0,b15,jsCall_viiii_1,b15,jsCall_viiii_2,b15,jsCall_viiii_3,b15,jsCall_viiii_4,b15,jsCall_viiii_5,b15,jsCall_viiii_6,b15,jsCall_viiii_7,b15,jsCall_viiii_8,b15,jsCall_viiii_9,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b15,b15,b15,b15,b15,b15,b15,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b15,b15,b15,__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,___assert_fail__wrapper,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15,b15
  ,b15,b15,b15,b15,b15,b15,b15,b15,b15];

  return { _getLogLevels: _getLogLevels, _i64Subtract: _i64Subtract, _free: _free, _i64Add: _i64Add, _strlen: _strlen, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, ___getTypeName: ___getTypeName, _setLogLevels: _setLogLevels, _strcpy: _strcpy, __GLOBAL__I_a: __GLOBAL__I_a, __GLOBAL__I_a65: __GLOBAL__I_a65, __GLOBAL__I_a81: __GLOBAL__I_a81, __GLOBAL__I_a101: __GLOBAL__I_a101, __GLOBAL__I_a125: __GLOBAL__I_a125, __GLOBAL__I_a136: __GLOBAL__I_a136, __GLOBAL__I_a159: __GLOBAL__I_a159, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0, dynCall_iiii: dynCall_iiii, dynCall_viiiiiiiiii: dynCall_viiiiiiiiii, dynCall_vid: dynCall_vid, dynCall_viiiii: dynCall_viiiii, dynCall_i: dynCall_i, dynCall_vi: dynCall_vi, dynCall_vii: dynCall_vii, dynCall_ii: dynCall_ii, dynCall_iid: dynCall_iid, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v, dynCall_viid: dynCall_viid, dynCall_viiiiii: dynCall_viiiiii, dynCall_iii: dynCall_iii, dynCall_id: dynCall_id, dynCall_viiii: dynCall_viiii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "jsCall": jsCall, "nullFunc_iiii": nullFunc_iiii, "nullFunc_viiiiiiiiii": nullFunc_viiiiiiiiii, "nullFunc_vid": nullFunc_vid, "nullFunc_viiiii": nullFunc_viiiii, "nullFunc_i": nullFunc_i, "nullFunc_vi": nullFunc_vi, "nullFunc_vii": nullFunc_vii, "nullFunc_ii": nullFunc_ii, "nullFunc_iid": nullFunc_iid, "nullFunc_viii": nullFunc_viii, "nullFunc_v": nullFunc_v, "nullFunc_viid": nullFunc_viid, "nullFunc_viiiiii": nullFunc_viiiiii, "nullFunc_iii": nullFunc_iii, "nullFunc_id": nullFunc_id, "nullFunc_viiii": nullFunc_viiii, "invoke_iiii": invoke_iiii, "invoke_viiiiiiiiii": invoke_viiiiiiiiii, "invoke_vid": invoke_vid, "invoke_viiiii": invoke_viiiii, "invoke_i": invoke_i, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_iid": invoke_iid, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_viid": invoke_viid, "invoke_viiiiii": invoke_viiiiii, "invoke_iii": invoke_iii, "invoke_id": invoke_id, "invoke_viiii": invoke_viiii, "_sin": _sin, "_send": _send, "__embind_register_memory_view": __embind_register_memory_view, "__ZSt9terminatev": __ZSt9terminatev, "___cxa_pure_virtual": ___cxa_pure_virtual, "___cxa_guard_acquire": ___cxa_guard_acquire, "__reallyNegative": __reallyNegative, "___cxa_is_number_type": ___cxa_is_number_type, "___gxx_personality_v0": ___gxx_personality_v0, "__embind_register_integer": __embind_register_integer, "_llvm_stackrestore": _llvm_stackrestore, "___assert_fail": ___assert_fail, "__embind_register_void": __embind_register_void, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "__embind_register_value_object_field": __embind_register_value_object_field, "___buildEnvironment": ___buildEnvironment, "_fflush": _fflush, "___cxa_guard_release": ___cxa_guard_release, "_time": _time, "_pwrite": _pwrite, "___setErrNo": ___setErrNo, "_sbrk": _sbrk, "__embind_register_class_class_function": __embind_register_class_class_function, "__embind_register_std_wstring": __embind_register_std_wstring, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "__embind_register_bool": __embind_register_bool, "___resumeException": ___resumeException, "__embind_register_value_object": __embind_register_value_object, "_sysconf": _sysconf, "___cxa_begin_catch": ___cxa_begin_catch, "___cxa_call_unexpected": ___cxa_call_unexpected, "__embind_register_emval": __embind_register_emval, "__embind_finalize_value_object": __embind_finalize_value_object, "__embind_register_class_function": __embind_register_class_function, "__emval_decref": __emval_decref, "_llvm_stacksave": _llvm_stacksave, "_getenv": _getenv, "__embind_register_float": __embind_register_float, "__embind_register_class": __embind_register_class, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "__embind_register_function": __embind_register_function, "_write": _write, "___errno_location": ___errno_location, "__emval_call_method": __emval_call_method, "__embind_register_class_constructor": __embind_register_class_constructor, "__emval_run_destructors": __emval_run_destructors, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "_mkport": _mkport, "___cxa_does_inherit": ___cxa_does_inherit, "__exit": __exit, "_abort": _abort, "___cxa_allocate_exception": ___cxa_allocate_exception, "_fwrite": _fwrite, "___cxa_throw": ___cxa_throw, "_fprintf": _fprintf, "__formatString": __formatString, "_rint": _rint, "_exit": _exit, "__embind_register_std_string": __embind_register_std_string, "_setenv": _setenv, "___cxa_guard_abort": ___cxa_guard_abort, "__emval_get_method_caller": __emval_get_method_caller, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "__ZTISt9exception": __ZTISt9exception, "_stderr": _stderr }, buffer);
var _getLogLevels = Module["_getLogLevels"] = asm["_getLogLevels"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _free = Module["_free"] = asm["_free"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var ___getTypeName = Module["___getTypeName"] = asm["___getTypeName"];
var _setLogLevels = Module["_setLogLevels"] = asm["_setLogLevels"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var __GLOBAL__I_a65 = Module["__GLOBAL__I_a65"] = asm["__GLOBAL__I_a65"];
var __GLOBAL__I_a81 = Module["__GLOBAL__I_a81"] = asm["__GLOBAL__I_a81"];
var __GLOBAL__I_a101 = Module["__GLOBAL__I_a101"] = asm["__GLOBAL__I_a101"];
var __GLOBAL__I_a125 = Module["__GLOBAL__I_a125"] = asm["__GLOBAL__I_a125"];
var __GLOBAL__I_a136 = Module["__GLOBAL__I_a136"] = asm["__GLOBAL__I_a136"];
var __GLOBAL__I_a159 = Module["__GLOBAL__I_a159"] = asm["__GLOBAL__I_a159"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = asm["dynCall_viiiiiiiiii"];
var dynCall_vid = Module["dynCall_vid"] = asm["dynCall_vid"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iid = Module["dynCall_iid"] = asm["dynCall_iid"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_viid = Module["dynCall_viid"] = asm["dynCall_viid"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_id = Module["dynCall_id"] = asm["dynCall_id"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = asm['stackAlloc'];
Runtime.stackSave = asm['stackSave'];
Runtime.stackRestore = asm['stackRestore'];
Runtime.setTempRet0 = asm['setTempRet0'];
Runtime.getTempRet0 = asm['getTempRet0'];


// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}
/*global Module, asm*/
/*global _malloc, _free, _memcpy*/
/*global FUNCTION_TABLE, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64*/
/*global readLatin1String*/
/*global __emval_register, _emval_handle_array, __emval_decref*/
/*global ___getTypeName*/
/*jslint sub:true*/ /* The symbols 'fromWireType' and 'toWireType' must be accessed via array notation to be closure-safe since craftInvokerFunction crafts functions as strings that can't be closured. */
var InternalError = Module['InternalError'] = extendError(Error, 'InternalError');
var BindingError = Module['BindingError'] = extendError(Error, 'BindingError');
var UnboundTypeError = Module['UnboundTypeError'] = extendError(BindingError, 'UnboundTypeError');

function throwInternalError(message) {
    throw new InternalError(message);
}

function throwBindingError(message) {
    throw new BindingError(message);
}

function throwUnboundTypeError(message, types) {
    var unboundTypes = [];
    var seen = {};
    function visit(type) {
        if (seen[type]) {
            return;
        }
        if (registeredTypes[type]) {
            return;
        }
        if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
        }
        unboundTypes.push(type);
        seen[type] = true;
    }
    types.forEach(visit);

    throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
}

// Creates a function overload resolution table to the given method 'methodName' in the given prototype,
// if the overload table doesn't yet exist.
function ensureOverloadTable(proto, methodName, humanName) {
    if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
        proto[methodName] = function() {
            // TODO This check can be removed in -O3 level "unsafe" optimizations.
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        // Move the previous function into the overload table.
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
    }
}

/* Registers a symbol (function, class, enum, ...) as part of the Module JS object so that
   hand-written code is able to access that symbol via 'Module.name'.
   name: The name of the symbol that's being exposed.
   value: The object itself to expose (function, class, ...)
   numArguments: For functions, specifies the number of arguments the function takes in. For other types, unused and undefined.

   To implement support for multiple overloads of a function, an 'overload selector' function is used. That selector function chooses
   the appropriate overload to call from an function overload table. This selector function is only used if multiple overloads are
   actually registered, since it carries a slight performance penalty. */
function exposePublicSymbol(name, value, numArguments) {
    if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
            throwBindingError("Cannot register public name '" + name + "' twice");
        }

        // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
        // that routes between the two.
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        // Add the new function into the overload table.
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        Module[name] = value;
        if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
        }
    }
}

function replacePublicSymbol(name, value, numArguments) {
    if (!Module.hasOwnProperty(name)) {
        throwInternalError('Replacing nonexistant public symbol');
    }
    // If there's an overload table for this symbol, replace the symbol in the overload table instead.
    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        Module[name] = value;
    }
}

// from https://github.com/imvu/imvujs/blob/master/src/error.js
function extendError(baseErrorType, errorName) {
    var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;

        var stack = (new Error(message)).stack;
        if (stack !== undefined) {
            this.stack = this.toString() + '\n' +
                stack.replace(/^Error(:[^\n]*)?\n/, '');
        }
    });
    errorClass.prototype = Object.create(baseErrorType.prototype);
    errorClass.prototype.constructor = errorClass;
    errorClass.prototype.toString = function() {
        if (this.message === undefined) {
            return this.name;
        } else {
            return this.name + ': ' + this.message;
        }
    };

    return errorClass;
}


// from https://github.com/imvu/imvujs/blob/master/src/function.js
function createNamedFunction(name, body) {
    name = makeLegalFunctionName(name);
    /*jshint evil:true*/
    return new Function(
        "body",
        "return function " + name + "() {\n" +
        "    \"use strict\";" +
        "    return body.apply(this, arguments);\n" +
        "};\n"
    )(body);
}

function _embind_repr(v) {
    var t = typeof v;
    if (t === 'object' || t === 'array' || t === 'function') {
        return v.toString();
    } else {
        return '' + v;
    }
}

// typeID -> { toWireType: ..., fromWireType: ... }
var registeredTypes = {};

// typeID -> [callback]
var awaitingDependencies = {};

// typeID -> [dependentTypes]
var typeDependencies = {};

// class typeID -> {pointerType: ..., constPointerType: ...}
var registeredPointers = {};

function registerType(rawType, registeredInstance) {
    if (!('argPackAdvance' in registeredInstance)) {
        throw new TypeError('registerType registeredInstance requires argPackAdvance');
    }

    var name = registeredInstance.name;
    if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
    }
    if (registeredTypes.hasOwnProperty(rawType)) {
        throwBindingError("Cannot register type '" + name + "' twice");
    }

    registeredTypes[rawType] = registeredInstance;
    delete typeDependencies[rawType];

    if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function(cb) {
            cb();
        });
    }
}

function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
    myTypes.forEach(function(type) {
        typeDependencies[type] = dependentTypes;
    });

    function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
            throwInternalError('Mismatched type converter count');
        }
        for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
        }
    }

    var typeConverters = new Array(dependentTypes.length);
    var unregisteredTypes = [];
    var registered = 0;
    dependentTypes.forEach(function(dt, i) {
        if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
        } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(function() {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                    onComplete(typeConverters);
                }
            });
        }
    });
    if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
    }
}

var __charCodes = (function() {
    var codes = new Array(256);
    for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i);
    }
    return codes;
})();

function readLatin1String(ptr) {
    var ret = "";
    var c = ptr;
    while (HEAPU8[c]) {
        ret += __charCodes[HEAPU8[c++]];
    }
    return ret;
}

function getTypeName(type) {
    var ptr = ___getTypeName(type);
    var rv = readLatin1String(ptr);
    _free(ptr);
    return rv;
}

function heap32VectorToArray(count, firstElement) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array.push(HEAP32[(firstElement >> 2) + i]);
    }
    return array;
}

function requireRegisteredType(rawType, humanName) {
    var impl = registeredTypes[rawType];
    if (undefined === impl) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
    }
    return impl;
}

function __embind_register_void(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'argPackAdvance': 0,
        'fromWireType': function() {
            return undefined;
        },
        'toWireType': function(destructors, o) {
            // TODO: assert if anything else is given?
            return undefined;
        },
    });
}

function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
    var shift = getShiftFromSize(size);

    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(wt) {
            // ambiguous emscripten ABI: sometimes return values are
            // true or false, and sometimes integers (0 or 1)
            return !!wt;
        },
        'toWireType': function(destructors, o) {
            return o ? trueValue : falseValue;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': function(pointer) {
            // TODO: if heap is fixed (like in asm.js) this could be executed outside
            var heap;
            if (size === 1) {
                heap = HEAP8;
            } else if (size === 2) {
                heap = HEAP16;
            } else if (size === 4) {
                heap = HEAP32;
            } else {
                throw new TypeError("Unknown boolean type size: " + name);
            }
            return this['fromWireType'](heap[pointer >> shift]);
        },
        destructorFunction: null, // This type does not need a destructor
    });
}

function getShiftFromSize(size) {
    switch (size) {
        case 1: return 0;
        case 2: return 1;
        case 4: return 2;
        case 8: return 3;
        default:
            throw new TypeError('Unknown type size: ' + size);
    }
}

function integerReadValueFromPointer(name, shift, signed) {
    switch (shift) {
        case 0: return function(pointer) {
            var heap = signed ? HEAP8 : HEAPU8;
            return this['fromWireType'](heap[pointer]);
        };
        case 1: return function(pointer) {
            var heap = signed ? HEAP16 : HEAPU16;
            return this['fromWireType'](heap[pointer >> 1]);
        };
        case 2: return function(pointer) {
            var heap = signed ? HEAP32 : HEAPU32;
            return this['fromWireType'](heap[pointer >> 2]);
        };
        default:
            throw new TypeError("Unknown integer type: " + name);
    }
}

function floatReadValueFromPointer(name, shift) {
    switch (shift) {
        case 2: return function(pointer) {
            return this['fromWireType'](HEAPF32[pointer >> 2]);
        };
        case 3: return function(pointer) {
            return this['fromWireType'](HEAPF64[pointer >> 3]);
        };
        default:
            throw new TypeError("Unknown float type: " + name);
    }
}

// When converting a number from JS to C++ side, the valid range of the number is
// [minRange, maxRange], inclusive.
function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
    name = readLatin1String(name);
    if (maxRange === -1) { // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come out as 'i32 -1'. Always treat those as max u32.
        maxRange = 4294967295;
    }

    var shift = getShiftFromSize(size);

    registerType(primitiveType, {
        name: name,
        'fromWireType': function(value) {
            return value;
        },
        'toWireType': function(destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following two if()s and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            if (value < minRange || value > maxRange) {
                throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ', ' + maxRange + ']!');
            }
            return value | 0;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': integerReadValueFromPointer(name, shift, minRange !== 0),
        destructorFunction: null, // This type does not need a destructor
    });
}



function __embind_register_float(rawType, name, size) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            return value;
        },
        'toWireType': function(destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following if() and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            return value;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': floatReadValueFromPointer(name, shift),
        destructorFunction: null, // This type does not need a destructor
    });
}

// For types whose wire types are 32-bit pointers.
function simpleReadValueFromPointer(pointer) {
    return this['fromWireType'](HEAPU32[pointer >> 2]);
}

function __embind_register_std_string(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
            }
            _free(value);
            return a.join('');
        },
        'toWireType': function(destructors, value) {
            if (value instanceof ArrayBuffer) {
                value = new Uint8Array(value);
            }

            function getTAElement(ta, index) {
                return ta[index];
            }
            function getStringElement(string, index) {
                return string.charCodeAt(index);
            }
            var getElement;
            if (value instanceof Uint8Array) {
                getElement = getTAElement;
            } else if (value instanceof Int8Array) {
                getElement = getTAElement;
            } else if (typeof value === 'string') {
                getElement = getStringElement;
            } else {
                throwBindingError('Cannot pass non-string to std::string');
            }

            // assumes 4-byte alignment
            var length = value.length;
            var ptr = _malloc(4 + length);
            HEAPU32[ptr >> 2] = length;
            for (var i = 0; i < length; ++i) {
                var charCode = getElement(value, i);
                if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + 4 + i] = charCode;
            }
            if (destructors !== null) {
                destructors.push(_free, ptr);
            }
            return ptr;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: function(ptr) { _free(ptr); },
    });
}

function __embind_register_std_wstring(rawType, charSize, name) {
    name = readLatin1String(name);
    var HEAP, shift;
    if (charSize === 2) {
        HEAP = HEAPU16;
        shift = 1;
    } else if (charSize === 4) {
        HEAP = HEAPU32;
        shift = 2;
    }
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            var start = (value + 4) >> shift;
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAP[start + i]);
            }
            _free(value);
            return a.join('');
        },
        'toWireType': function(destructors, value) {
            // assumes 4-byte alignment
            var length = value.length;
            var ptr = _malloc(4 + length * charSize);
            HEAPU32[ptr >> 2] = length;
            var start = (ptr + 4) >> shift;
            for (var i = 0; i < length; ++i) {
                HEAP[start + i] = value.charCodeAt(i);
            }
            if (destructors !== null) {
                destructors.push(_free, ptr);
            }
            return ptr;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: function(ptr) { _free(ptr); },
    });
}

function __embind_register_emval(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
            var rv = _emval_handle_array[handle].value;
            __emval_decref(handle);
            return rv;
        },
        'toWireType': function(destructors, value) {
            return __emval_register(value);
        },
        'argPackAdvance': 8,
        'readValueFromPointer': simpleReadValueFromPointer,
        destructorFunction: null, // This type does not need a destructor
    });
}

function __embind_register_memory_view(rawType, name) {
    var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
    ];

    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
            var type = HEAPU32[handle >> 2];
            var size = HEAPU32[(handle >> 2) + 1]; // in elements
            var data = HEAPU32[(handle >> 2) + 2]; // byte offset into emscripten heap
            var TA = typeMapping[type];
            return new TA(HEAP8.buffer, data, size);
        },
        'argPackAdvance': 16,
        'readValueFromPointer': function(ptr) {
            return this['fromWireType'](ptr);
        },
    });
}

function runDestructors(destructors) {
    while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
    }
}

// Function implementation of operator new, per
// http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
// 13.2.2
// ES3
function new_(constructor, argumentList) {
    if (!(constructor instanceof Function)) {
        throw new TypeError('new_ called with constructor type ' + typeof(constructor) + " which is not a function");
    }

    /*
     * Previously, the following line was just:

     function dummy() {};

     * Unfortunately, Chrome was preserving 'dummy' as the object's name, even though at creation, the 'dummy' has the
     * correct constructor name.  Thus, objects created with IMVU.new would show up in the debugger as 'dummy', which
     * isn't very helpful.  Using IMVU.createNamedFunction addresses the issue.  Doublely-unfortunately, there's no way
     * to write a test for this behavior.  -NRD 2013.02.22
     */
    var dummy = createNamedFunction(constructor.name, function(){});
    dummy.prototype = constructor.prototype;
    var obj = new dummy;

    var r = constructor.apply(obj, argumentList);
    return (r instanceof Object) ? r : obj;
}

// The path to interop from JS code to C++ code:
// (hand-written JS code) -> (autogenerated JS invoker) -> (template-generated C++ invoker) -> (target C++ function)
// craftInvokerFunction generates the JS invoker function for each function exposed to JS through embind.
function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
    // humanName: a human-readable string name for the function to be generated.
    // argTypes: An array that contains the embind type objects for all types in the function signature.
    //    argTypes[0] is the type object for the function return value.
    //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
    //    argTypes[2...] are the actual function parameters.
    // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
    // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
    // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
    var argCount = argTypes.length;

    if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
    }

    var isClassMethodFunc = (argTypes[1] !== null && classType !== null);

    // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
// TODO: This omits argument count check - enable only at -O3 or similar.
//    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
//       return FUNCTION_TABLE[fn];
//    }

    var argsList = "";
    var argsListWired = "";
    for(var i = 0; i < argCount-2; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i;
        argsListWired += (i!==0?", ":"")+"arg"+i+"Wired";
    }

    var invokerFnBody =
        "return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n" +
        "if (arguments.length !== "+(argCount - 2)+") {\n" +
            "throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount - 2)+" args!');\n" +
        "}\n";

    // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
    // TODO: Remove this completely once all function invokers are being dynamically generated.
    var needsDestructorStack = false;

    for(var i = 1; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here.
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) { // The type does not define a destructor function - must use dynamic stack
            needsDestructorStack = true;
            break;
        }
    }

    if (needsDestructorStack) {
        invokerFnBody +=
            "var destructors = [];\n";
    }

    var dtorStack = needsDestructorStack ? "destructors" : "null";
    var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
    var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];

    if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType("+dtorStack+", this);\n";
    }

    for(var i = 0; i < argCount-2; ++i) {
        invokerFnBody += "var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";
        args1.push("argType"+i);
        args2.push(argTypes[i+2]);
    }

    if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
    }

    var returns = (argTypes[0].name !== "void");

    invokerFnBody +=
        (returns?"var rv = ":"") + "invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";

    if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
    } else {
        for(var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
            var paramName = (i === 1 ? "thisWired" : ("arg"+(i-2)+"Wired"));
            if (argTypes[i].destructorFunction !== null) {
                invokerFnBody += paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";
                args1.push(paramName+"_dtor");
                args2.push(argTypes[i].destructorFunction);
            }
        }
    }

    if (returns) {
        invokerFnBody += "return retType.fromWireType(rv);\n";
    }
    invokerFnBody += "}\n";

    args1.push(invokerFnBody);

    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}

function requireFunction(signature, rawFunction) {
    signature = readLatin1String(signature);
    var fp;
    // asm.js does not define FUNCTION_TABLE
    if (typeof FUNCTION_TABLE === "undefined") {
        // asm.js does not give direct access to the function tables,
        // and thus we must go through the dynCall interface which allows
        // calling into a signature's function table by pointer value.
        //
        // https://github.com/dherman/asm.js/issues/83
        //
        // This has three main penalties:
        // - dynCall is another function call in the path from JavaScript to C++.
        // - JITs may not predict through the function table indirection at runtime.
        // - Function.prototype.bind generally benchmarks poorly relative to
        //   function objects, but using 'arguments' would confound JITs and
        //   possibly allocate.
        var dc = asm['dynCall_' + signature];
        if (dc === undefined) {
            // We will always enter this branch if the signature
            // contains 'f' and PRECISE_F32 is not enabled.
            //
            // Try again, replacing 'f' with 'd'.
            dc = asm['dynCall_' + signature.replace(/f/g, 'd')];
            if (dc === undefined) {
                throwBindingError("No dynCall invoker for signature: " + signature);
            }
        }
        fp = dc.bind(undefined, rawFunction);
    } else {
        fp = FUNCTION_TABLE[rawFunction];
    }

    if (typeof fp !== "function") {
        throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
    }
    return fp;
}

function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
    var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    name = readLatin1String(name);
    
    rawInvoker = requireFunction(signature, rawInvoker);

    exposePublicSymbol(name, function() {
        throwUnboundTypeError('Cannot call ' + name + ' due to unbound types', argTypes);
    }, argCount - 1);

    whenDependentTypesAreResolved([], argTypes, function(argTypes) {
        var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn), argCount - 1);
        return [];
    });
}

var tupleRegistrations = {};

function __embind_register_value_array(rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) {
    tupleRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: requireFunction(constructorSignature, rawConstructor),
        rawDestructor: requireFunction(destructorSignature, rawDestructor),
        elements: [],
    };
}

function __embind_register_value_array_element(
    rawTupleType,
    getterReturnType,
    getterSignature,
    getter,
    getterContext,
    setterArgumentType,
    setterSignature,
    setter,
    setterContext
) {
    tupleRegistrations[rawTupleType].elements.push({
        getterReturnType: getterReturnType,
        getter: requireFunction(getterSignature, getter),
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: requireFunction(setterSignature, setter),
        setterContext: setterContext,
    });
}

function __embind_finalize_value_array(rawTupleType) {
    var reg = tupleRegistrations[rawTupleType];
    delete tupleRegistrations[rawTupleType];
    var elements = reg.elements;
    var elementsLength = elements.length;
    var elementTypes = elements.map(function(elt) { return elt.getterReturnType; }).
                concat(elements.map(function(elt) { return elt.setterArgumentType; }));

    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;

    whenDependentTypesAreResolved([rawTupleType], elementTypes, function(elementTypes) {
        elements.forEach(function(elt, i) {
            var getterReturnType = elementTypes[i];
            var getter = elt.getter;
            var getterContext = elt.getterContext;
            var setterArgumentType = elementTypes[i + elementsLength];
            var setter = elt.setter;
            var setterContext = elt.setterContext;
            elt.read = function(ptr) {
                return getterReturnType['fromWireType'](getter(getterContext, ptr));
            };
            elt.write = function(ptr, o) {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
                runDestructors(destructors);
            };
        });

        return [{
            name: reg.name,
            'fromWireType': function(ptr) {
                var rv = new Array(elementsLength);
                for (var i = 0; i < elementsLength; ++i) {
                    rv[i] = elements[i].read(ptr);
                }
                rawDestructor(ptr);
                return rv;
            },
            'toWireType': function(destructors, o) {
                if (elementsLength !== o.length) {
                    throw new TypeError("Incorrect number of tuple elements for " + reg.name + ": expected=" + elementsLength + ", actual=" + o.length);
                }
                var ptr = rawConstructor();
                for (var i = 0; i < elementsLength; ++i) {
                    elements[i].write(ptr, o[i]);
                }
                if (destructors !== null) {
                    destructors.push(rawDestructor, ptr);
                }
                return ptr;
            },
            'argPackAdvance': 8,
            'readValueFromPointer': simpleReadValueFromPointer,
            destructorFunction: rawDestructor,
        }];
    });
}

var structRegistrations = {};

function __embind_register_value_object(
    rawType,
    name,
    constructorSignature,
    rawConstructor,
    destructorSignature,
    rawDestructor
) {
    structRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: requireFunction(constructorSignature, rawConstructor),
        rawDestructor: requireFunction(destructorSignature, rawDestructor),
        fields: [],
    };
}

function __embind_register_value_object_field(
    structType,
    fieldName,
    getterReturnType,
    getterSignature,
    getter,
    getterContext,
    setterArgumentType,
    setterSignature,
    setter,
    setterContext
) {
    structRegistrations[structType].fields.push({
        fieldName: readLatin1String(fieldName),
        getterReturnType: getterReturnType,
        getter: requireFunction(getterSignature, getter),
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: requireFunction(setterSignature, setter),
        setterContext: setterContext,
    });
}

function __embind_finalize_value_object(structType) {
    var reg = structRegistrations[structType];
    delete structRegistrations[structType];

    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;
    var fieldRecords = reg.fields;
    var fieldTypes = fieldRecords.map(function(field) { return field.getterReturnType; }).
              concat(fieldRecords.map(function(field) { return field.setterArgumentType; }));
    whenDependentTypesAreResolved([structType], fieldTypes, function(fieldTypes) {
        var fields = {};
        fieldRecords.forEach(function(field, i) {
            var fieldName = field.fieldName;
            var getterReturnType = fieldTypes[i];
            var getter = field.getter;
            var getterContext = field.getterContext;
            var setterArgumentType = fieldTypes[i + fieldRecords.length];
            var setter = field.setter;
            var setterContext = field.setterContext;
            fields[fieldName] = {
                read: function(ptr) {
                    return getterReturnType['fromWireType'](
                        getter(getterContext, ptr));
                },
                write: function(ptr, o) {
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
                    runDestructors(destructors);
                }
            };
        });

        return [{
            name: reg.name,
            'fromWireType': function(ptr) {
                var rv = {};
                for (var i in fields) {
                    rv[i] = fields[i].read(ptr);
                }
                rawDestructor(ptr);
                return rv;
            },
            'toWireType': function(destructors, o) {
                // todo: Here we have an opportunity for -O3 level "unsafe" optimizations:
                // assume all fields are present without checking.
                for (var fieldName in fields) {
                    if (!(fieldName in o)) {
                        throw new TypeError('Missing field');
                    }
                }
                var ptr = rawConstructor();
                for (fieldName in fields) {
                    fields[fieldName].write(ptr, o[fieldName]);
                }
                if (destructors !== null) {
                    destructors.push(rawDestructor, ptr);
                }
                return ptr;
            },
            'argPackAdvance': 8,
            'readValueFromPointer': simpleReadValueFromPointer,
            destructorFunction: rawDestructor,
        }];
    });
}

var genericPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }

        if (this.isSmartPointer) {
            var ptr = this.rawConstructor();
            if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
            }
            return ptr;
        } else {
            return 0;
        }
    }

    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);

    if (this.isSmartPointer) {
        // TODO: this is not strictly true
        // We could support BY_EMVAL conversions from raw pointers to smart pointers
        // because the smart pointer can hold a reference to the handle
        if (undefined === handle.$$.smartPtr) {
            throwBindingError('Passing raw pointer to smart pointer is illegal');
        }

        switch (this.sharingPolicy) {
            case 0: // NONE
                // no upcasting
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                } else {
                    throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
                }
                break;

            case 1: // INTRUSIVE
                ptr = handle.$$.smartPtr;
                break;

            case 2: // BY_EMVAL
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                } else {
                    var clonedHandle = handle['clone']();
                    ptr = this.rawShare(
                        ptr,
                        __emval_register(function() {
                            clonedHandle['delete']();
                        })
                    );
                    if (destructors !== null) {
                        destructors.push(this.rawDestructor, ptr);
                    }
                }
                break;

            default:
                throwBindingError('Unsupporting sharing policy');
        }
    }
    return ptr;
};

// If we know a pointer type is not going to have SmartPtr logic in it, we can
// special-case optimize it a bit (compare to genericPointerToWireType)
var constNoSmartPtrRawPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
    }

    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
};

// An optimized version for non-const method accesses - there we must additionally restrict that
// the pointer is not a const-pointer.
var nonConstNoSmartPtrRawPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
    }

    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    if (handle.$$.ptrType.isConst) {
        throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
};

function RegisteredPointer(
    name,
    registeredClass,
    isReference,
    isConst,

    // smart pointer properties
    isSmartPointer,
    pointeeType,
    sharingPolicy,
    rawGetPointee,
    rawConstructor,
    rawShare,
    rawDestructor
) {
    this.name = name;
    this.registeredClass = registeredClass;
    this.isReference = isReference;
    this.isConst = isConst;

    // smart pointer properties
    this.isSmartPointer = isSmartPointer;
    this.pointeeType = pointeeType;
    this.sharingPolicy = sharingPolicy;
    this.rawGetPointee = rawGetPointee;
    this.rawConstructor = rawConstructor;
    this.rawShare = rawShare;
    this.rawDestructor = rawDestructor;

    if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
            this['toWireType'] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
        } else {
            this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
        }
    } else {
        this['toWireType'] = genericPointerToWireType;
        // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
        // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
        // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in
        //       craftInvokerFunction altogether.
    }
}

RegisteredPointer.prototype.getPointee = function(ptr) {
    if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr);
    }
    return ptr;
};

RegisteredPointer.prototype.destructor = function(ptr) {
    if (this.rawDestructor) {
        this.rawDestructor(ptr);
    }
};

RegisteredPointer.prototype['argPackAdvance'] = 8;
RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer;

RegisteredPointer.prototype['fromWireType'] = function(ptr) {
    // ptr is a raw pointer (or a raw smartpointer)

    // rawPointer is a maybe-null raw pointer
    var rawPointer = this.getPointee(ptr);
    if (!rawPointer) {
        this.destructor(ptr);
        return null;
    }

    function makeDefaultHandle() {
        if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this.pointeeType,
                ptr: rawPointer,
                smartPtrType: this,
                smartPtr: ptr,
            });
        } else {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this,
                ptr: ptr,
            });
        }
    }

    var actualType = this.registeredClass.getActualType(rawPointer);
    var registeredPointerRecord = registeredPointers[actualType];
    if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
    }

    var toType;
    if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
    } else {
        toType = registeredPointerRecord.pointerType;
    }
    var dp = downcastPointer(
        rawPointer,
        this.registeredClass,
        toType.registeredClass);
    if (dp === null) {
        return makeDefaultHandle.call(this);
    }
    if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
            smartPtrType: this,
            smartPtr: ptr,
        });
    } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
        });
    }
};

function makeClassHandle(prototype, record) {
    if (!record.ptrType || !record.ptr) {
        throwInternalError('makeClassHandle requires ptr and ptrType');
    }
    var hasSmartPtrType = !!record.smartPtrType;
    var hasSmartPtr = !!record.smartPtr;
    if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError('Both smartPtrType and smartPtr must be specified');
    }
    record.count = { value: 1 };
    return Object.create(prototype, {
        $$: {
            value: record,
        },
    });
}

// root of all pointer and smart pointer handles in embind
function ClassHandle() {
}

function getInstanceTypeName(handle) {
    return handle.$$.ptrType.registeredClass.name;
}

ClassHandle.prototype['isAliasOf'] = function(other) {
    if (!(this instanceof ClassHandle)) {
        return false;
    }
    if (!(other instanceof ClassHandle)) {
        return false;
    }

    var leftClass = this.$$.ptrType.registeredClass;
    var left = this.$$.ptr;
    var rightClass = other.$$.ptrType.registeredClass;
    var right = other.$$.ptr;

    while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass;
    }

    while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass;
    }

    return leftClass === rightClass && left === right;
};

function throwInstanceAlreadyDeleted(obj) {
    throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
}

ClassHandle.prototype['clone'] = function() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }

    var clone = Object.create(Object.getPrototypeOf(this), {
        $$: {
            value: shallowCopy(this.$$),
        }
    });

    clone.$$.count.value += 1;
    return clone;
};

function runDestructor(handle) {
    var $$ = handle.$$;
    if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
    } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
    }
}

ClassHandle.prototype['delete'] = function ClassHandle_delete() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    if (this.$$.deleteScheduled) {
        throwBindingError('Object already scheduled for deletion');
    }

    this.$$.count.value -= 1;
    if (0 === this.$$.count.value) {
        runDestructor(this);
    }
    this.$$.smartPtr = undefined;
    this.$$.ptr = undefined;
};

var deletionQueue = [];

ClassHandle.prototype['isDeleted'] = function isDeleted() {
    return !this.$$.ptr;
};

ClassHandle.prototype['deleteLater'] = function deleteLater() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    if (this.$$.deleteScheduled) {
        throwBindingError('Object already scheduled for deletion');
    }
    deletionQueue.push(this);
    if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes);
    }
    this.$$.deleteScheduled = true;
    return this;
};

function flushPendingDeletes() {
    while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj['delete']();
    }
}
Module['flushPendingDeletes'] = flushPendingDeletes;

var delayFunction;
Module['setDelayFunction'] = function setDelayFunction(fn) {
    delayFunction = fn;
    if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
    }
};

function RegisteredClass(
    name,
    constructor,
    instancePrototype,
    rawDestructor,
    baseClass,
    getActualType,
    upcast,
    downcast
) {
    this.name = name;
    this.constructor = constructor;
    this.instancePrototype = instancePrototype;
    this.rawDestructor = rawDestructor;
    this.baseClass = baseClass;
    this.getActualType = getActualType;
    this.upcast = upcast;
    this.downcast = downcast;
}

function shallowCopy(o) {
    var rv = {};
    for (var k in o) {
        rv[k] = o[k];
    }
    return rv;
}

function __embind_register_class(
    rawType,
    rawPointerType,
    rawConstPointerType,
    baseClassRawType,
    getActualTypeSignature,
    getActualType,
    upcastSignature,
    upcast,
    downcastSignature,
    downcast,
    name,
    destructorSignature,
    rawDestructor
) {
    name = readLatin1String(name);
    getActualType = requireFunction(getActualTypeSignature, getActualType);
    if (upcast) {
        upcast = requireFunction(upcastSignature, upcast);
    }
    if (downcast) {
        downcast = requireFunction(downcastSignature, downcast);
    }
    rawDestructor = requireFunction(destructorSignature, rawDestructor);
    var legalFunctionName = makeLegalFunctionName(name);

    exposePublicSymbol(legalFunctionName, function() {
        // this code cannot run if baseClassRawType is zero
        throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
    });

    whenDependentTypesAreResolved(
        [rawType, rawPointerType, rawConstPointerType],
        baseClassRawType ? [baseClassRawType] : [],
        function(base) {
            base = base[0];

            var baseClass;
            var basePrototype;
            if (baseClassRawType) {
                baseClass = base.registeredClass;
                basePrototype = baseClass.instancePrototype;
            } else {
                basePrototype = ClassHandle.prototype;
            }

            var constructor = createNamedFunction(legalFunctionName, function() {
                if (Object.getPrototypeOf(this) !== instancePrototype) {
                    throw new BindingError("Use 'new' to construct " + name);
                }
                if (undefined === registeredClass.constructor_body) {
                    throw new BindingError(name + " has no accessible constructor");
                }
                var body = registeredClass.constructor_body[arguments.length];
                if (undefined === body) {
                    throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
                }
                return body.apply(this, arguments);
            });

            var instancePrototype = Object.create(basePrototype, {
                constructor: { value: constructor },
            });

            constructor.prototype = instancePrototype;

            var registeredClass = new RegisteredClass(
                name,
                constructor,
                instancePrototype,
                rawDestructor,
                baseClass,
                getActualType,
                upcast,
                downcast);

            var referenceConverter = new RegisteredPointer(
                name,
                registeredClass,
                true,
                false,
                false);

            var pointerConverter = new RegisteredPointer(
                name + '*',
                registeredClass,
                false,
                false,
                false);

            var constPointerConverter = new RegisteredPointer(
                name + ' const*',
                registeredClass,
                false,
                true,
                false);

            registeredPointers[rawType] = {
                pointerType: pointerConverter,
                constPointerType: constPointerConverter
            };

            replacePublicSymbol(legalFunctionName, constructor);

            return [referenceConverter, pointerConverter, constPointerConverter];
        }
    );
}

function __embind_register_class_constructor(
    rawClassType,
    argCount,
    rawArgTypesAddr,
    invokerSignature,
    invoker,
    rawConstructor
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    invoker = requireFunction(invokerSignature, invoker);

    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = 'constructor ' + classType.name;

        if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount-1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
        }
        classType.registeredClass.constructor_body[argCount - 1] = function() {
            throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
        };

        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            classType.registeredClass.constructor_body[argCount - 1] = function() {
                if (arguments.length !== argCount - 1) {
                    throwBindingError(humanName + ' called with ' + arguments.length + ' arguments, expected ' + (argCount-1));
                }
                var destructors = [];
                var args = new Array(argCount);
                args[0] = rawConstructor;
                for (var i = 1; i < argCount; ++i) {
                    args[i] = argTypes[i]['toWireType'](destructors, arguments[i - 1]);
                }

                var ptr = invoker.apply(null, args);
                runDestructors(destructors);

                return argTypes[0]['fromWireType'](ptr);
            };
            return [];
        });
        return [];
    });
}

function downcastPointer(ptr, ptrClass, desiredClass) {
    if (ptrClass === desiredClass) {
        return ptr;
    }
    if (undefined === desiredClass.baseClass) {
        return null; // no conversion
    }

    var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
    if (rv === null) {
        return null;
    }
    return desiredClass.downcast(rv);
}

function upcastPointer(ptr, ptrClass, desiredClass) {
    while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
            throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
    }
    return ptr;
}

function validateThis(this_, classType, humanName) {
    if (!(this_ instanceof Object)) {
        throwBindingError(humanName + ' with invalid "this": ' + this_);
    }
    if (!(this_ instanceof classType.registeredClass.constructor)) {
        throwBindingError(humanName + ' incompatible with "this" of type ' + this_.constructor.name);
    }
    if (!this_.$$.ptr) {
        throwBindingError('cannot call emscripten binding method ' + humanName + ' on deleted object');
    }

    // todo: kill this
    return upcastPointer(
        this_.$$.ptr,
        this_.$$.ptrType.registeredClass,
        classType.registeredClass);
}

function __embind_register_class_function(
    rawClassType,
    methodName,
    argCount,
    rawArgTypesAddr, // [ReturnType, ThisType, Args...]
    invokerSignature,
    rawInvoker,
    context
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = requireFunction(invokerSignature, rawInvoker);

    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + methodName;

        var unboundTypesHandler = function() {
            throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
        };

        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount-2)) {
            // This is the first overload to be registered, OR we are replacing a function in the base class with a function in the derived class.
            unboundTypesHandler.argCount = argCount-2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler;
        } else {
            // There was an existing function with the same name registered. Set up a function overload routing table.
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount-2] = unboundTypesHandler;
        }

        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {

            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);

            // Replace the initial unbound-handler-stub function with the appropriate member function, now that all types
            // are resolved. If multiple overloads are registered for this function, the function goes into an overload table.
            if (undefined === proto[methodName].overloadTable) {
                proto[methodName] = memberFunction;
            } else {
                proto[methodName].overloadTable[argCount-2] = memberFunction;
            }

            return [];
        });
        return [];
    });
}

function __embind_register_class_class_function(
    rawClassType,
    methodName,
    argCount,
    rawArgTypesAddr,
    invokerSignature,
    rawInvoker,
    fn
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = requireFunction(invokerSignature, rawInvoker);
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + methodName;

        var unboundTypesHandler = function() {
                throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
            };

        var proto = classType.registeredClass.constructor;
        if (undefined === proto[methodName]) {
            // This is the first function to be registered with this name.
            unboundTypesHandler.argCount = argCount-1;
            proto[methodName] = unboundTypesHandler;
        } else {
            // There was an existing function with the same name registered. Set up a function overload routing table.
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount-1] = unboundTypesHandler;
        }

        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            // Replace the initial unbound-types-handler stub with the proper function. If multiple overloads are registered,
            // the function handlers go into an overload table.
            var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
            var func = craftInvokerFunction(humanName, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn);
            if (undefined === proto[methodName].overloadTable) {
                proto[methodName] = func;
            } else {
                proto[methodName].overloadTable[argCount-1] = func;
            }
            return [];
        });
        return [];
    });
}

function __embind_register_class_property(
    classType,
    fieldName,
    getterReturnType,
    getterSignature,
    getter,
    getterContext,
    setterArgumentType,
    setterSignature,
    setter,
    setterContext
) {
    fieldName = readLatin1String(fieldName);
    getter = requireFunction(getterSignature, getter);

    whenDependentTypesAreResolved([], [classType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + fieldName;
        var desc = {
            get: function() {
                throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [getterReturnType, setterArgumentType]);
            },
            enumerable: true,
            configurable: true
        };
        if (setter) {
            desc.set = function() {
                throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [getterReturnType, setterArgumentType]);
            };
        } else {
            desc.set = function(v) {
                throwBindingError(humanName + ' is a read-only property');
            };
        }

        Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);

        whenDependentTypesAreResolved(
            [],
            (setter ? [getterReturnType, setterArgumentType] : [getterReturnType]),
        function(types) {
            var getterReturnType = types[0];
            var desc = {
                get: function() {
                    var ptr = validateThis(this, classType, humanName + ' getter');
                    return getterReturnType['fromWireType'](getter(getterContext, ptr));
                },
                enumerable: true
            };

            if (setter) {
                setter = requireFunction(setterSignature, setter);
                var setterArgumentType = types[1];
                desc.set = function(v) {
                    var ptr = validateThis(this, classType, humanName + ' setter');
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, v));
                    runDestructors(destructors);
                };
            }

            Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
            return [];
        });

        return [];
    });
}

var char_0 = '0'.charCodeAt(0);
var char_9 = '9'.charCodeAt(0);
function makeLegalFunctionName(name) {
    name = name.replace(/[^a-zA-Z0-9_]/g, '$');
    var f = name.charCodeAt(0);
    if (f >= char_0 && f <= char_9) {
        return '_' + name;
    } else {
        return name;
    }
}

function __embind_register_smart_ptr(
    rawType,
    rawPointeeType,
    name,
    sharingPolicy,
    getPointeeSignature,
    rawGetPointee,
    constructorSignature,
    rawConstructor,
    shareSignature,
    rawShare,
    destructorSignature,
    rawDestructor
) {
    name = readLatin1String(name);
    rawGetPointee = requireFunction(getPointeeSignature, rawGetPointee);
    rawConstructor = requireFunction(constructorSignature, rawConstructor);
    rawShare = requireFunction(shareSignature, rawShare);
    rawDestructor = requireFunction(destructorSignature, rawDestructor);

    whenDependentTypesAreResolved([rawType], [rawPointeeType], function(pointeeType) {
        pointeeType = pointeeType[0];

        var registeredPointer = new RegisteredPointer(
            name,
            pointeeType.registeredClass,
            false,
            false,
            // smart pointer properties
            true,
            pointeeType,
            sharingPolicy,
            rawGetPointee,
            rawConstructor,
            rawShare,
            rawDestructor);
        return [registeredPointer];
    });
}

function __embind_register_enum(
    rawType,
    name,
    size,
    isSigned
) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);

    function constructor() {
    }
    constructor.values = {};

    registerType(rawType, {
        name: name,
        constructor: constructor,
        'fromWireType': function(c) {
            return this.constructor.values[c];
        },
        'toWireType': function(destructors, c) {
            return c.value;
        },
        'argPackAdvance': 8,
        'readValueFromPointer': integerReadValueFromPointer(name, shift, isSigned),
        destructorFunction: null,
    });
    exposePublicSymbol(name, constructor);
}

function __embind_register_enum_value(
    rawEnumType,
    name,
    enumValue
) {
    var enumType = requireRegisteredType(rawEnumType, 'enum');
    name = readLatin1String(name);

    var Enum = enumType.constructor;

    var Value = Object.create(enumType.constructor.prototype, {
        value: {value: enumValue},
        constructor: {value: createNamedFunction(enumType.name + '_' + name, function() {})},
    });
    Enum.values[enumValue] = Value;
    Enum[name] = Value;
}

function __embind_register_constant(name, type, value) {
    name = readLatin1String(name);
    whenDependentTypesAreResolved([], [type], function(type) {
        type = type[0];
        Module[name] = type['fromWireType'](value);
        return [];
    });
}
/*global Module:true, Runtime*/
/*global HEAP32*/
/*global new_*/
/*global createNamedFunction*/
/*global readLatin1String, writeStringToMemory*/
/*global requireRegisteredType, throwBindingError, runDestructors*/
/*jslint sub:true*/ /* The symbols 'fromWireType' and 'toWireType' must be accessed via array notation to be closure-safe since craftInvokerFunction crafts functions as strings that can't be closured. */

var Module = Module || {};

var _emval_handle_array = [{}]; // reserve zero
var _emval_free_list = [];

// Public JS API

/** @expose */
Module.count_emval_handles = function() {
    var count = 0;
    for (var i = 1; i < _emval_handle_array.length; ++i) {
        if (_emval_handle_array[i] !== undefined) {
            ++count;
        }
    }
    return count;
};

/** @expose */
Module.get_first_emval = function() {
    for (var i = 1; i < _emval_handle_array.length; ++i) {
        if (_emval_handle_array[i] !== undefined) {
            return _emval_handle_array[i];
        }
    }
    return null;
};

// Private C++ API

var _emval_symbols = {}; // address -> string

function __emval_register_symbol(address) {
    _emval_symbols[address] = readLatin1String(address);
}

function getStringOrSymbol(address) {
    var symbol = _emval_symbols[address];
    if (symbol === undefined) {
        return readLatin1String(address);
    } else {
        return symbol;
    }
}

function requireHandle(handle) {
    if (!handle) {
        throwBindingError('Cannot use deleted val. handle = ' + handle);
    }
    return _emval_handle_array[handle].value;
}

function __emval_register(value) {
    var handle = _emval_free_list.length ?
        _emval_free_list.pop() :
        _emval_handle_array.length;

    _emval_handle_array[handle] = {refcount: 1, value: value};
    return handle;
}

function __emval_incref(handle) {
    if (handle) {
        _emval_handle_array[handle].refcount += 1;
    }
}

function __emval_decref(handle) {
    if (handle && 0 === --_emval_handle_array[handle].refcount) {
        _emval_handle_array[handle] = undefined;
        _emval_free_list.push(handle);
    }
}

function __emval_run_destructors(handle) {
    var destructors = _emval_handle_array[handle].value;
    runDestructors(destructors);
    __emval_decref(handle);
}

function __emval_new_array() {
    return __emval_register([]);
}

function __emval_new_object() {
    return __emval_register({});
}

function __emval_undefined() {
    return __emval_register(undefined);
}

function __emval_null() {
    return __emval_register(null);
}

function __emval_new_cstring(v) {
    return __emval_register(getStringOrSymbol(v));
}

function __emval_take_value(type, argv) {
    type = requireRegisteredType(type, '_emval_take_value');
    var v = type['readValueFromPointer'](argv);
    return __emval_register(v);
}

var __newers = {}; // arity -> function


function craftEmvalAllocator(argCount) {
    /*This function returns a new function that looks like this:
    function emval_allocator_3(constructor, argTypes, args) {
        var argType0 = requireRegisteredType(HEAP32[(argTypes >> 2)], "parameter 0");
        var arg0 = argType0.readValueFromPointer(args);
        var argType1 = requireRegisteredType(HEAP32[(argTypes >> 2) + 1], "parameter 1");
        var arg1 = argType1.readValueFromPointer(args + 8);
        var argType2 = requireRegisteredType(HEAP32[(argTypes >> 2) + 2], "parameter 2");
        var arg2 = argType2.readValueFromPointer(args + 16);
        var obj = new constructor(arg0, arg1, arg2);
        return __emval_register(obj);
    } */

    var argsList = "";
    for(var i = 0; i < argCount; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i; // 'arg0, arg1, ..., argn'
    }

    var functionBody =
        "return function emval_allocator_"+argCount+"(constructor, argTypes, args) {\n";

    for(var i = 0; i < argCount; ++i) {
        functionBody +=
            "var argType"+i+" = requireRegisteredType(HEAP32[(argTypes >> 2) + "+i+"], \"parameter "+i+"\");\n" +
            "var arg"+i+" = argType"+i+".readValueFromPointer(args);\n" +
            "args += argType"+i+".argPackAdvance;\n";
    }
    functionBody +=
        "var obj = new constructor("+argsList+");\n" +
        "return __emval_register(obj);\n" +
        "}\n";

    /*jshint evil:true*/
    return (new Function("requireRegisteredType", "HEAP32", "__emval_register", functionBody))(
        requireRegisteredType, HEAP32, __emval_register);
}

function __emval_new(handle, argCount, argTypes, args) {
    handle = requireHandle(handle);

    var newer = __newers[argCount];
    if (!newer) {
        newer = craftEmvalAllocator(argCount);
        __newers[argCount] = newer;
    }

    return newer(handle, argTypes, args);
}

// appease jshint (technically this code uses eval)
var global = (function(){return Function;})()('return this')();

function __emval_get_global(name) {
    name = getStringOrSymbol(name);
    return __emval_register(global[name]);
}

function __emval_get_module_property(name) {
    name = getStringOrSymbol(name);
    return __emval_register(Module[name]);
}

function __emval_get_property(handle, key) {
    handle = requireHandle(handle);
    key = requireHandle(key);
    return __emval_register(handle[key]);
}

function __emval_set_property(handle, key, value) {
    handle = requireHandle(handle);
    key = requireHandle(key);
    value = requireHandle(value);
    handle[key] = value;
}

function __emval_as(handle, returnType, destructorsRef) {
    handle = requireHandle(handle);
    returnType = requireRegisteredType(returnType, 'emval::as');
    var destructors = [];
    var rd = __emval_register(destructors);
    HEAP32[destructorsRef >> 2] = rd;
    return returnType['toWireType'](destructors, handle);
}

function __emval_call(handle, argCount, argTypes, argv) {
    handle = requireHandle(handle);
    var types = lookupTypes(argCount, argTypes);

    var args = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        var type = types[i];
        args[i] = type['readValueFromPointer'](argv);
        argv += type.argPackAdvance;
    }

    var rv = handle.apply(undefined, args);
    return __emval_register(rv);
}

function lookupTypes(argCount, argTypes, argWireTypes) {
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        a[i] = requireRegisteredType(
            HEAP32[(argTypes >> 2) + i],
            "parameter " + i);
    }
    return a;
}

function allocateDestructors(destructorsRef) {
    var destructors = [];
    HEAP32[destructorsRef >> 2] = __emval_register(destructors);
    return destructors;
}

// Leave id 0 undefined.  It's not a big deal, but might be confusing
// to have null be a valid method caller.
var methodCallers = [undefined];

function addMethodCaller(caller) {
    var id = methodCallers.length;
    methodCallers.push(caller);
    return id;
}

function __emval_get_method_caller(argCount, argTypes) {
    var types = lookupTypes(argCount, argTypes);

    var retType = types[0];
    var signatureName = retType.name + "_$" + types.slice(1).map(function (t) { return t.name; }).join("_") + "$";

    var params = ["retType"];
    var args = [retType];

    var argsList = ""; // 'arg0, arg1, arg2, ... , argN'
    for (var i = 0; i < argCount - 1; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        params.push("argType" + i);
        args.push(types[1 + i]);
    }

    var functionBody =
        "return function (handle, name, destructors, args) {\n";

    for (var i = 0; i < argCount - 1; ++i) {
        functionBody +=
        "    var arg" + i + " = argType" + i + ".readValueFromPointer(args);\n" +
        "    args += argType" + i + ".argPackAdvance;\n";
    }
    functionBody +=
        "    var rv = handle[name](" + argsList + ");\n" +
        "    return retType.toWireType(destructors, rv);\n" +
        "};\n";

    params.push(functionBody);
    var invokerFunction = new_(Function, params).apply(null, args);
    return addMethodCaller(createNamedFunction(signatureName, invokerFunction));
}

function __emval_call_method(caller, handle, methodName, destructorsRef, args) {
    caller = methodCallers[caller];
    handle = requireHandle(handle);
    methodName = getStringOrSymbol(methodName);
    return caller(handle, methodName, allocateDestructors(destructorsRef), args);
}

function __emval_has_function(handle, name) {
    handle = requireHandle(handle);
    name = getStringOrSymbol(name);
    return handle[name] instanceof Function;
}


if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



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

