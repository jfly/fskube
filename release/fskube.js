// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
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
    if (vararg) return 8;
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
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    assert(ret % 2 === 0);
    table.push(func);
    for (var i = 0; i < 2-1; i++) table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
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
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};

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
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math_abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math_min(Math_floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
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



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 5232;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } },{ func: function() { __GLOBAL__I_a45() } });

































































































































































































































































var __ZTVN10__cxxabiv120__si_class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,240,17,0,0,38,0,0,0,8,1,0,0,238,0,0,0,56,0,0,0,26,0,0,0,146,0,0,0,94,0,0,0,138,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;
var __ZTVN10__cxxabiv119__pointer_type_infoE;
__ZTVN10__cxxabiv119__pointer_type_infoE=allocate([0,0,0,0,0,18,0,0,38,0,0,0,244,0,0,0,238,0,0,0,56,0,0,0,212,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,32,18,0,0,38,0,0,0,218,0,0,0,238,0,0,0,56,0,0,0,26,0,0,0,28,0,0,0,132,0,0,0,92,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;
























































































































































var __ZTIt;
__ZTIt=allocate([104,6,0,0,192,6,0,0], "i8", ALLOC_STATIC);;
var __ZTIs;
__ZTIs=allocate([104,6,0,0,200,6,0,0], "i8", ALLOC_STATIC);;
var __ZTIm;
__ZTIm=allocate([104,6,0,0,208,6,0,0], "i8", ALLOC_STATIC);;
var __ZTIl;
__ZTIl=allocate([104,6,0,0,216,6,0,0], "i8", ALLOC_STATIC);;
var __ZTIj;
__ZTIj=allocate([104,6,0,0,224,6,0,0], "i8", ALLOC_STATIC);;
var __ZTIi;
__ZTIi=allocate([104,6,0,0,232,6,0,0], "i8", ALLOC_STATIC);;
var __ZTIh;
__ZTIh=allocate([104,6,0,0,240,6,0,0], "i8", ALLOC_STATIC);;
var __ZTIf;
__ZTIf=allocate([104,6,0,0,248,6,0,0], "i8", ALLOC_STATIC);;
var __ZTId;
__ZTId=allocate([104,6,0,0,0,7,0,0], "i8", ALLOC_STATIC);;
var __ZTIc;
__ZTIc=allocate([104,6,0,0,8,7,0,0], "i8", ALLOC_STATIC);;


var __ZTIa;
__ZTIa=allocate([104,6,0,0,24,7,0,0], "i8", ALLOC_STATIC);;


var __ZTISt9exception;
var __ZTISt9exception=__ZTISt9exception=allocate([allocate([1,0,0,0,0,0,0], "i8", ALLOC_STATIC)+8, 0], "i32", ALLOC_STATIC);




































































































































/* memory initializer */ allocate([108,111,110,103,0,0,0,0,100,111,117,98,108,101,82,101,99,101,105,118,101,114,0,0,117,110,115,105,103,110,101,100,32,105,110,116,0,0,0,0,105,110,116,0,0,0,0,0,98,111,111,108,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,0,0,0,0,0,117,110,115,105,103,110,101,100,32,115,104,111,114,116,0,0,114,101,99,101,105,118,101,0,115,104,111,114,116,0,0,0,98,111,111,108,82,101,99,101,105,118,101,114,0,0,0,0,117,110,115,105,103,110,101,100,32,99,104,97,114,0,0,0,115,112,97,99,101,70,114,101,113,117,101,110,99,121,0,0,115,105,103,110,101,100,32,99,104,97,114,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,109,97,114,107,70,114,101,113,117,101,110,99,121,0,0,0,118,111,105,100,0,0,0,0,105,109,112,108,101,109,101,110,116,0,0,0,0,0,0,0,68,101,82,115,50,51,50,111,114,0,0,0,0,0,0,0,99,104,97,114,0,0,0,0,82,115,50,51,50,111,114,0,102,108,117,115,104,0,0,0,68,101,109,111,100,117,108,97,116,111,114,0,0,0,0,0,98,105,116,115,80,101,114,83,101,99,111,110,100,0,0,0,114,101,115,101,116,0,0,0,77,111,100,117,108,97,116,111,114,0,0,0,0,0,0,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,0,98,111,111,108,82,101,99,101,105,118,101,114,95,105,110,116,83,101,110,100,101,114,0,0,101,109,115,99,114,105,112,116,101,110,58,58,118,97,108,0,105,110,116,82,101,99,101,105,118,101,114,95,98,111,111,108,83,101,110,100,101,114,0,0,115,116,100,58,58,119,115,116,114,105,110,103,0,0,0,0,100,111,117,98,108,101,82,101,99,101,105,118,101,114,95,98,111,111,108,83,101,110,100,101,114,0,0,0,0,0,0,0,115,116,100,58,58,98,97,115,105,99,95,115,116,114,105,110,103,60,117,110,115,105,103,110,101,100,32,99,104,97,114,62,0,0,0,0,0,0,0,0,99,111,110,110,101,99,116,0,115,116,100,58,58,115,116,114,105,110,103,0,0,0,0,0,98,111,111,108,82,101,99,101,105,118,101,114,95,100,111,117,98,108,101,83,101,110,100,101,114,0,0,0,0,0,0,0,98,111,111,108,0,0,0,0,100,111,117,98,108,101,0,0,105,110,116,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,0,0,0,0,0,0,102,108,111,97,116,0,0,0,105,110,116,82,101,99,101,105,118,101,114,0,0,0,0,0,117,110,115,105,103,110,101,100,32,108,111,110,103,0,0,0,100,111,117,98,108,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,0,0,0,115,97,109,112,108,101,115,80,101,114,83,101,99,111,110,100,0,0,0,0,0,0,0,0,70,115,107,80,97,114,97,109,115,0,0,0,0,0,0,0,118,105,105,0,0,0,0,0,118,105,105,105,0,0,0,0,118,105,105,0,0,0,0,0,118,105,105,105,0,0,0,0,118,105,105,100,0,0,0,0,118,105,105,105,0,0,0,0,118,105,105,105,0,0,0,0,118,105,105,105,0,0,0,0,118,105,105,105,0,0,0,0,118,105,105,105,0,0,0,0,118,105,105,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,105,0,0,0,0,0,0,118,0,0,0,0,0,0,0,105,105,105,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,105,0,0,0,0,0,105,0,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,105,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,105,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,105,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,105,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,105,105,0,0,0,0,0,0,0,0,0,0,160,14,0,0,100,0,0,0,216,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,16,0,0,236,0,0,0,40,0,0,0,200,0,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,16,0,0,8,0,0,0,102,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,248,0,0,0,174,0,0,0,166,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,17,0,0,60,0,0,0,120,0,0,0,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,17,0,0,0,1,0,0,44,0,0,0,190,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,17,0,0,58,0,0,0,106,0,0,0,10,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,17,0,0,130,0,0,0,198,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,17,0,0,24,0,0,0,226,0,0,0,202,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,17,0,0,48,0,0,0,114,0,0,0,202,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,17,0,0,6,1,0,0,2,0,0,0,202,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,17,0,0,38,0,0,0,62,0,0,0,238,0,0,0,56,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,17,0,0,38,0,0,0,254,0,0,0,238,0,0,0,56,0,0,0,26,0,0,0,98,0,0,0,110,0,0,0,144,0,0,0,0,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,106,0,0,0,0,0,0,0,105,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,98,0,0,0,0,0,0,0,97,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,80,78,54,102,115,107,117,98,101,57,77,111,100,117,108,97,116,111,114,69,0,0,0,0,80,78,54,102,115,107,117,98,101,57,68,101,82,115,50,51,50,111,114,69,0,0,0,0,80,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,105,69,69,0,0,80,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,100,69,69,0,0,80,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,98,69,69,0,0,80,78,54,102,115,107,117,98,101,55,82,115,50,51,50,111,114,69,0,0,0,0,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,105,98,69,69,0,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,100,98,69,69,0,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,105,69,69,0,0,0,80,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,100,69,69,0,0,0,80,78,54,102,115,107,117,98,101,50,49,100,111,117,98,108,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,0,80,78,54,102,115,107,117,98,101,49,57,98,111,111,108,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,80,78,54,102,115,107,117,98,101,49,56,105,110,116,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,80,78,54,102,115,107,117,98,101,49,49,68,101,109,111,100,117,108,97,116,111,114,69,0,80,75,78,54,102,115,107,117,98,101,57,77,111,100,117,108,97,116,111,114,69,0,0,0,80,75,78,54,102,115,107,117,98,101,57,68,101,82,115,50,51,50,111,114,69,0,0,0,80,75,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,105,69,69,0,80,75,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,100,69,69,0,80,75,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,98,69,69,0,80,75,78,54,102,115,107,117,98,101,55,82,115,50,51,50,111,114,69,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,105,98,69,69,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,100,98,69,69,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,105,69,69,0,0,80,75,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,100,69,69,0,0,80,75,78,54,102,115,107,117,98,101,50,49,100,111,117,98,108,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,49,57,98,111,111,108,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,0,0,80,75,78,54,102,115,107,117,98,101,49,56,105,110,116,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,80,75,78,54,102,115,107,117,98,101,49,49,68,101,109,111,100,117,108,97,116,111,114,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,104,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,104,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,104,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,78,54,102,115,107,117,98,101,57,77,111,100,117,108,97,116,111,114,69,0,0,0,0,0,78,54,102,115,107,117,98,101,57,70,115,107,80,97,114,97,109,115,69,0,0,0,0,0,78,54,102,115,107,117,98,101,57,68,101,82,115,50,51,50,111,114,69,0,0,0,0,0,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,105,69,69,0,0,0,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,100,69,69,0,0,0,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,98,69,69,0,0,0,78,54,102,115,107,117,98,101,55,82,115,50,51,50,111,114,69,0,0,0,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,105,98,69,69,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,100,98,69,69,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,105,69,69,0,0,0,0,78,54,102,115,107,117,98,101,54,83,101,110,100,101,114,73,98,100,69,69,0,0,0,0,78,54,102,115,107,117,98,101,50,49,100,111,117,98,108,101,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,0,0,0,0,0,78,54,102,115,107,117,98,101,49,57,98,111,111,108,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,78,54,102,115,107,117,98,101,49,56,105,110,116,82,101,99,101,105,118,101,114,87,114,97,112,112,101,114,69,0,0,0,78,54,102,115,107,117,98,101,49,49,68,101,109,111,100,117,108,97,116,111,114,69,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,55,119,114,97,112,112,101,114,73,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,105,69,69,69,69,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,55,119,114,97,112,112,101,114,73,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,100,69,69,69,69,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,55,119,114,97,112,112,101,114,73,78,54,102,115,107,117,98,101,56,82,101,99,101,105,118,101,114,73,98,69,69,69,69,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,51,118,97,108,69,0,0,0,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,68,110,0,0,0,0,0,0,104,6,0,0,184,6,0,0,104,6,0,0,16,7,0,0,0,0,0,0,32,7,0,0,0,0,0,0,48,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,7,0,0,0,0,0,0,192,16,0,0,0,0,0,0,88,7,0,0,0,0,0,0,216,16,0,0,0,0,0,0,112,7,0,0,0,0,0,0,232,16,0,0,0,0,0,0,136,7,0,0,0,0,0,0,240,16,0,0,0,0,0,0,160,7,0,0,0,0,0,0,248,16,0,0,0,0,0,0,184,7,0,0,0,0,0,0,0,17,0,0,0,0,0,0,208,7,0,0,0,0,0,0,16,17,0,0,0,0,0,0,232,7,0,0,0,0,0,0,32,17,0,0,0,0,0,0,0,8,0,0,0,0,0,0,48,17,0,0,0,0,0,0,24,8,0,0,0,0,0,0,64,17,0,0,0,0,0,0,48,8,0,0,0,0,0,0,80,17,0,0,0,0,0,0,88,8,0,0,0,0,0,0,96,17,0,0,0,0,0,0,120,8,0,0,0,0,0,0,112,17,0,0,0,0,0,0,152,8,0,0,0,0,0,0,128,17,0,0,0,0,0,0,176,8,0,0,1,0,0,0,192,16,0,0,0,0,0,0,200,8,0,0,1,0,0,0,216,16,0,0,0,0,0,0,224,8,0,0,1,0,0,0,232,16,0,0,0,0,0,0,248,8,0,0,1,0,0,0,240,16,0,0,0,0,0,0,16,9,0,0,1,0,0,0,248,16,0,0,0,0,0,0,40,9,0,0,1,0,0,0,0,17,0,0,0,0,0,0,64,9,0,0,1,0,0,0,16,17,0,0,0,0,0,0,88,9,0,0,1,0,0,0,32,17,0,0,0,0,0,0,112,9,0,0,1,0,0,0,48,17,0,0,0,0,0,0,136,9,0,0,1,0,0,0,64,17,0,0,0,0,0,0,160,9,0,0,1,0,0,0,80,17,0,0,0,0,0,0,200,9,0,0,1,0,0,0,96,17,0,0,0,0,0,0,240,9,0,0,1,0,0,0,112,17,0,0,0,0,0,0,16,10,0,0,1,0,0,0,128,17,0,0,0,0,0,0,48,10,0,0,144,6,0,0,88,10,0,0,0,0,0,0,1,0,0,0,112,16,0,0,0,0,0,0,144,6,0,0,152,10,0,0,0,0,0,0,1,0,0,0,112,16,0,0,0,0,0,0,144,6,0,0,216,10,0,0,0,0,0,0,1,0,0,0,112,16,0,0,0,0,0,0,0,0,0,0,24,11,0,0,64,17,0,0,0,0,0,0,0,0,0,0,48,11,0,0,0,0,0,0,72,11,0,0,48,17,0,0,0,0,0,0,0,0,0,0,96,11,0,0,0,0,0,0,120,11,0,0,0,0,0,0,144,11,0,0,0,0,0,0,168,11,0,0,16,17,0,0,0,0,0,0,0,0,0,0,192,11,0,0,232,16,0,0,0,0,0,0,0,0,0,0,216,11,0,0,240,16,0,0,0,0,0,0,0,0,0,0,240,11,0,0,248,16,0,0,0,0,0,0,0,0,0,0,8,12,0,0,248,16,0,0,0,0,0,0,0,0,0,0,32,12,0,0,160,17,0,0,0,0,0,0,0,0,0,0,72,12,0,0,176,17,0,0,0,0,0,0,0,0,0,0,104,12,0,0,144,17,0,0,0,0,0,0,0,0,0,0,136,12,0,0,32,17,0,0,0,0,0,0,0,0,0,0,160,12,0,0,232,16,0,0,0,0,0,0,0,0,0,0,208,12,0,0,240,16,0,0,0,0,0,0,0,0,0,0,0,13,0,0,248,16,0,0,0,0,0,0,0,0,0,0,48,13,0,0,0,0,0,0,72,13,0,0,0,0,0,0,104,13,0,0,48,18,0,0,0,0,0,0,0,0,0,0,144,13,0,0,32,18,0,0,0,0,0,0,0,0,0,0,184,13,0,0,32,18,0,0,0,0,0,0,0,0,0,0,224,13,0,0,16,18,0,0,0,0,0,0,0,0,0,0,8,14,0,0,48,18,0,0,0,0,0,0,0,0,0,0,48,14,0,0,48,18,0,0,0,0,0,0,0,0,0,0,88,14,0,0,152,14,0,0,0,0,0,0,104,6,0,0,128,14,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
function runPostSets() {

HEAP32[((3736 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((3744 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((3752 )>>2)]=__ZTISt9exception;
HEAP32[((3760 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3776 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3792 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3808 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3824 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3840 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3856 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3872 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3888 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3904 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3920 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3936 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3952 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3968 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((3984 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4000 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4016 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4032 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4048 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4064 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4080 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4096 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4112 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4128 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4144 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4160 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4176 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4192 )>>2)]=(((__ZTVN10__cxxabiv119__pointer_type_infoE+8)|0));
HEAP32[((4208 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((4288 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4304 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((4312 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4328 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((4336 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((4344 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((4352 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4368 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4384 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4400 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4416 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4432 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4448 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4464 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4480 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4496 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4512 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4528 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4544 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((4552 )>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((4560 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4576 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4592 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4608 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4624 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4640 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((4656 )>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
}

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


  var _llvm_dbg_declare=undefined;

  
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
          return tempRet0 = typeArray[i],thrown;
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return tempRet0 = throwntype,thrown;
    }function ___gxx_personality_v0() {
    }

  function __embind_register_class_function() {
  Module['printErr']('missing function: _embind_register_class_function'); abort(-1);
  }

  function __embind_register_class_constructor() {
  Module['printErr']('missing function: _embind_register_class_constructor'); abort(-1);
  }

  function __embind_register_class() {
  Module['printErr']('missing function: _embind_register_class'); abort(-1);
  }

  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    }function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[((dest)>>0)]=HEAP8[((src)>>0)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[((dest)>>0)]=HEAP8[((src)>>0)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  function __emval_call_method() {
  Module['printErr']('missing function: _emval_call_method'); abort(-1);
  }

  function __emval_run_destructors() {
  Module['printErr']('missing function: _emval_run_destructors'); abort(-1);
  }

  
  var ___cxa_caught_exceptions=[];function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
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

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[((variable)>>0)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[((variable)>>0)]=1;
        return 1;
      }
      return 0;
    }

  function ___cxa_guard_abort() {}

  function ___cxa_guard_release() {}

  function __emval_get_method_caller() {
  Module['printErr']('missing function: _emval_get_method_caller'); abort(-1);
  }

  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }

  function __emval_decref() {
  Module['printErr']('missing function: _emval_decref'); abort(-1);
  }

  function __embind_register_class_class_function() {
  Module['printErr']('missing function: _embind_register_class_class_function'); abort(-1);
  }

  function __embind_register_value_object_field() {
  Module['printErr']('missing function: _embind_register_value_object_field'); abort(-1);
  }

  function __embind_finalize_value_object() {
  Module['printErr']('missing function: _embind_finalize_value_object'); abort(-1);
  }

  function __embind_register_value_object() {
  Module['printErr']('missing function: _embind_register_value_object'); abort(-1);
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
    }var _llvm_memset_p0i8_i32=_memset;

  var _sin=Math_sin;

  var _llvm_memset_p0i8_i64=_memset;

  function _rint(x) {
      if (Math.abs(x % 1) !== 0.5) return Math.round(x);
      return x + x % 2 + ((x < 0) ? 1 : -1);
    }

  var _fabs=Math_abs;

  function __embind_register_void() {
  Module['printErr']('missing function: _embind_register_void'); abort(-1);
  }

  function __embind_register_bool() {
  Module['printErr']('missing function: _embind_register_bool'); abort(-1);
  }

  function __embind_register_std_string() {
  Module['printErr']('missing function: _embind_register_std_string'); abort(-1);
  }

  function __embind_register_std_wstring() {
  Module['printErr']('missing function: _embind_register_std_wstring'); abort(-1);
  }

  function __embind_register_emval() {
  Module['printErr']('missing function: _embind_register_emval'); abort(-1);
  }

  function __embind_register_memory_view() {
  Module['printErr']('missing function: _embind_register_memory_view'); abort(-1);
  }

  function __embind_register_float() {
  Module['printErr']('missing function: _embind_register_float'); abort(-1);
  }

  function __embind_register_integer() {
  Module['printErr']('missing function: _embind_register_integer'); abort(-1);
  }

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }function ___errno_location() {
      return ___errno_state;
    }

  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[((curr)>>0)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }

  function _llvm_lifetime_start() {}

  function _llvm_lifetime_end() {}

  function __ZNSt9exceptionD2Ev() {}

  function _abort() {
      Module['abort']();
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

  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
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

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  function ___cxa_throw(ptr, type, destructor) {
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

  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }

  var _llvm_dbg_value=true;






  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
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
      }};var PATH={splitPath:function (filename) {
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
      }};var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
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
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");



var FUNCTION_TABLE = [0,0,__ZN10emscripten7wrapperIN6fskube8ReceiverIbEEED0Ev,0,__ZN10emscripten8internal12MemberAccessIN6fskube9FskParamsEjE7getWireIS3_EEjRKMS3_jRKT_,0,__ZN10emscripten8internal14raw_destructorIN6fskube18intReceiverWrapperEEEvPT_,0,__ZN6fskube9DeRs232orD1Ev,0,__ZN10emscripten8internal15raw_constructorIN6fskube9FskParamsEJEEEPT_DpNS0_11BindingTypeIT0_E8WireTypeE,0,__ZN10emscripten8internal14raw_destructorIN6fskube21doubleReceiverWrapperEEEvPT_,0,__ZN10emscripten4baseIN6fskube6SenderIbdEEE14convertPointerIS3_NS1_9ModulatorEEEPT0_PT_,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIibEEFvPNS2_8ReceiverIbEEEvPS4_JS7_EE6invokeERKS9_SA_S7_,0,__ZN10emscripten8internal13getActualTypeIN6fskube19boolReceiverWrapperEEEPKNS0_7_TYPEIDEPT_,0,__ZNKSt9bad_alloc4whatEv,0,__ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZN10emscripten7wrapperIN6fskube8ReceiverIiEEED1Ev,0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZN6fskube6SenderIdbE7connectEPNS_8ReceiverIbEE,0,__ZN10emscripten4baseIN6fskube6SenderIbiEEE14convertPointerIS3_NS1_9DeRs232orEEEPT0_PT_,0,__ZN10emscripten8internal12MemberAccessIN6fskube9FskParamsEjE7setWireIS3_EEvRKMS3_jRT_j,0,__ZN10emscripten8internal7InvokerIPN6fskube11DemodulatorEJNS2_9FskParamsEEE6invokeEPFS4_S5_EPS5_,0,__ZN10__cxxabiv116__shim_type_infoD2Ev,0,__ZN6fskube9ModulatorD0Ev,0,__ZN10emscripten8internal13getActualTypeIN6fskube9DeRs232orEEEPKNS0_7_TYPEIDEPT_,0,__ZN6fskube19boolReceiverWrapperD0Ev,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIdEEFvdEvPS4_JdEE6invokeERKS6_S7_d,0,__ZN10emscripten7wrapperIN6fskube8ReceiverIdEEED1Ev,0,__ZN6fskube11Demodulator7receiveEd,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube11DemodulatorEFvvEvPS3_JEE6invokeERKS5_S6_,0,__ZN10emscripten8internal14raw_destructorIN6fskube11DemodulatorEEEvPT_,0,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,0,__ZN6fskube18intReceiverWrapperD1Ev,0,__ZN6fskube21doubleReceiverWrapperD1Ev,0,__ZN10__cxxabiv123__fundamental_type_infoD0Ev,0,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderIbdEEEEvPT_,0,__ZN10emscripten8internal11wrapped_newIPN6fskube21doubleReceiverWrapperES3_JNS_3valEEEET_DpOT1_,0,__ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIiEEEEvPT_,0,__ZN6fskube9DeRs232or7receiveEb,0,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_19boolReceiverWrapperES3_EEPT0_PT_,0,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_6SenderIbiEEEEPT0_PT_,0,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderIibEEEEPKNS0_7_TYPEIDEPT_,0,__ZN10emscripten4baseIN6fskube6SenderIbdEEE14convertPointerINS1_9ModulatorES3_EEPT0_PT_,0,__ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIdEEEEPKNS0_7_TYPEIDEPT_,0,__ZN10emscripten8internal7InvokerIPN6fskube7Rs232orEJEE6invokeEPFS4_vE,0,__ZN10emscripten8internal7InvokerIPN6fskube9ModulatorEJNS2_9FskParamsEEE6invokeEPFS4_S5_EPS5_,0,__ZN10emscripten8internal12operator_newIN6fskube9ModulatorEJNS2_9FskParamsEEEEPT_DpT0_,0,__ZN6fskube11Demodulator5flushEv,0,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderIdbEEEEPKNS0_7_TYPEIDEPT_,0,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_19boolReceiverWrapperEEEPT0_PT_,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNSt9bad_allocD2Ev,0,__ZN6fskube9DeRs232orD0Ev,0,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderIdbEEEEvPT_,0,__ZN6fskube18intReceiverWrapperD0Ev,0,__ZN6fskube6SenderIbiE7connectEPNS_8ReceiverIiEE,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIbdEEFvPNS2_8ReceiverIdEEEvPS4_JS7_EE6invokeERKS9_SA_S7_,0,__ZN10emscripten7wrapperIN6fskube8ReceiverIdEEED0Ev,0,__ZN10emscripten8internal7InvokerIPN6fskube19boolReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE,0,__ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerIS3_NS1_21doubleReceiverWrapperEEEPT0_PT_,0,__ZN6fskube21doubleReceiverWrapperD0Ev,0,__ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIbEEEEvPT_,0,__ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIdEEEEvPT_,0,__ZN6fskube6SenderIbdE7connectEPNS_8ReceiverIdEE,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube9DeRs232orEFvvEvPS3_JEE6invokeERKS5_S6_,0,__ZN6fskube11DemodulatorD1Ev,0,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZN10emscripten8internal14raw_destructorIN6fskube9FskParamsEEEvPT_,0,__ZN6fskube6SenderIibE7connectEPNS_8ReceiverIbEE,0,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerINS1_21doubleReceiverWrapperES3_EEPT0_PT_,0,__ZN10emscripten8internal11wrapped_newIPN6fskube19boolReceiverWrapperES3_JNS_3valEEEET_DpOT1_,0,__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZN10emscripten8internal12operator_newIN6fskube7Rs232orEJEEEPT_DpT0_,0,__ZN10emscripten8internal12operator_newIN6fskube9DeRs232orEJEEEPT_DpT0_,0,__ZN10emscripten8internal13getActualTypeIN6fskube9ModulatorEEEPKNS0_7_TYPEIDEPT_,0,__ZN10emscripten8internal14raw_destructorIN6fskube7Rs232orEEEvPT_,0,__ZN10emscripten4baseIN6fskube6SenderIbiEEE14convertPointerINS1_9DeRs232orES3_EEPT0_PT_,0,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_6SenderIbdEES3_EEPT0_PT_,0,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderIbdEEEEPKNS0_7_TYPEIDEPT_,0,__ZN10emscripten4baseIN6fskube6SenderIibEEE14convertPointerINS1_7Rs232orES3_EEPT0_PT_,0,__ZN10emscripten8internal7InvokerIPN6fskube9DeRs232orEJEE6invokeEPFS4_vE,0,__ZN6fskube7Rs232or7receiveEi,0,__ZN10emscripten8internal13getActualTypeIN6fskube7Rs232orEEEPKNS0_7_TYPEIDEPT_,0,__ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerIS3_NS1_6SenderIdbEEEEPT0_PT_,0,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_6SenderIbiEES3_EEPT0_PT_,0,__ZN6fskube7Rs232orD0Ev,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIiEEFviEvPS4_JiEE6invokeERKS6_S7_i,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIbiEEFvPNS2_8ReceiverIiEEEvPS4_JS7_EE6invokeERKS9_SA_S7_,0,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderIbiEEEEvPT_,0,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_18intReceiverWrapperEEEPT0_PT_,0,__ZN6fskube9Modulator5resetEv,0,__ZN10emscripten8internal13getActualTypeIN6fskube21doubleReceiverWrapperEEEPKNS0_7_TYPEIDEPT_,0,__ZN10emscripten8internal7InvokerIPN6fskube18intReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE,0,__ZN6fskube19boolReceiverWrapper7receiveEb,0,__ZN10emscripten8internal13getActualTypeIN6fskube18intReceiverWrapperEEEPKNS0_7_TYPEIDEPT_,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube9ModulatorEFvvEvPS3_JEE6invokeERKS5_S6_,0,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_18intReceiverWrapperES3_EEPT0_PT_,0,__ZN6fskube11DemodulatorD0Ev,0,__ZN6fskube9Modulator7receiveEb,0,___cxa_pure_virtual,0,__ZN10emscripten8internal14raw_destructorIN6fskube6SenderIibEEEEvPT_,0,__ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerINS1_6SenderIdbEES3_EEPT0_PT_,0,__ZN10emscripten8internal12operator_newIN6fskube11DemodulatorEJNS2_9FskParamsEEEEPT_DpT0_,0,__ZN10emscripten8internal14raw_destructorIN6fskube19boolReceiverWrapperEEEvPT_,0,__ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIbEEFvbEvPS4_JbEE6invokeERKS6_S7_b,0,__ZNSt9bad_allocD0Ev,0,__ZN10__cxxabiv117__class_type_infoD0Ev,0,__ZN10emscripten4baseIN6fskube6SenderIdbEEE14convertPointerINS1_11DemodulatorES3_EEPT0_PT_,0,__ZN6fskube9DeRs232or5resetEv,0,__ZN10emscripten8internal14raw_destructorIN6fskube9DeRs232orEEEvPT_,0,__ZN10emscripten7wrapperIN6fskube8ReceiverIiEEED0Ev,0,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_6SenderIibEEEEPT0_PT_,0,__ZN10emscripten8internal7InvokerIPN6fskube21doubleReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE,0,__ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_6SenderIibEES3_EEPT0_PT_,0,__ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIiEEEEPKNS0_7_TYPEIDEPT_,0,__ZN6fskube9ModulatorD1Ev,0,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,0,__ZN6fskube21doubleReceiverWrapper7receiveEd,0,__ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIdbEEFvPNS2_8ReceiverIbEEEvPS4_JS7_EE6invokeERKS9_SA_S7_,0,__ZN10__cxxabiv119__pointer_type_infoD0Ev,0,__ZN10emscripten8internal13getActualTypeIN6fskube6SenderIbiEEEEPKNS0_7_TYPEIDEPT_,0,__ZN6fskube7Rs232orD1Ev,0,__ZN10emscripten8internal13getActualTypeIN6fskube11DemodulatorEEEPKNS0_7_TYPEIDEPT_,0,__ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_6SenderIbdEEEEPT0_PT_,0,__ZN10__cxxabiv121__vmi_class_type_infoD0Ev,0,__ZN6fskube19boolReceiverWrapperD1Ev,0,__ZN10emscripten4baseIN6fskube6SenderIibEEE14convertPointerIS3_NS1_7Rs232orEEEPT0_PT_,0,__ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIbEEEEPKNS0_7_TYPEIDEPT_,0,__ZN10emscripten7wrapperIN6fskube8ReceiverIbEEED1Ev,0,__ZN10__cxxabiv120__si_class_type_infoD0Ev,0,__ZN6fskube18intReceiverWrapper7receiveEi,0,__ZN10emscripten8internal11wrapped_newIPN6fskube18intReceiverWrapperES3_JNS_3valEEEET_DpOT1_,0,__ZN10emscripten8internal14raw_destructorIN6fskube9ModulatorEEEvPT_,0,__ZN10emscripten4baseIN6fskube6SenderIdbEEE14convertPointerIS3_NS1_11DemodulatorEEEPT0_PT_,0];

// EMSCRIPTEN_START_FUNCS

function __ZN10emscripten12value_objectIN6fskube9FskParamsEE5fieldIS2_jEERS3_PKcMT_T0_($this,$fieldName,$field){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=_malloc(4); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=($1|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($2){label=3;break;}else{label=2;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $4=$1; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($4)>>2)]=$field; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $5=_malloc(4); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=($5|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($6){label=5;break;}else{label=4;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $8=$5; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($8)>>2)]=$field; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=5;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 5: 
 __embind_register_value_object_field(4304,$fieldName,__ZTIj,920,(4),$1,__ZTIj,712,(34),$5); //@line 752 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $this; //@line 753 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube6SenderIbdE7connectEPNS_8ReceiverIdEE($this,$next){
 var label=0;


 var $1=(($this+4)|0); //@line 27 "src/receiversender.h"
 HEAP32[(($1)>>2)]=$next; //@line 27 "src/receiversender.h"
 return; //@line 28 "src/receiversender.h"
}


function __ZN6fskube6SenderIdbE7connectEPNS_8ReceiverIbEE($this,$next){
 var label=0;


 var $1=(($this+4)|0); //@line 27 "src/receiversender.h"
 HEAP32[(($1)>>2)]=$next; //@line 27 "src/receiversender.h"
 return; //@line 28 "src/receiversender.h"
}


function __ZN6fskube6SenderIibE7connectEPNS_8ReceiverIbEE($this,$next){
 var label=0;


 var $1=(($this+4)|0); //@line 27 "src/receiversender.h"
 HEAP32[(($1)>>2)]=$next; //@line 27 "src/receiversender.h"
 return; //@line 28 "src/receiversender.h"
}


function __ZN6fskube6SenderIbiE7connectEPNS_8ReceiverIiEE($this,$next){
 var label=0;


 var $1=(($this+4)|0); //@line 27 "src/receiversender.h"
 HEAP32[(($1)>>2)]=$next; //@line 27 "src/receiversender.h"
 return; //@line 28 "src/receiversender.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube9DeRs232orEFvvEvPS3_JEE6invokeERKS5_S6_($method,$wireThis){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal12operator_newIN6fskube9DeRs232orEJEEEPT_DpT0_(){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 label=2;break;
 case 2: 
 var $2=_malloc(24);
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=12;break;}
 case 3: 
 var $5=(tempValue=HEAP32[((5208)>>2)],HEAP32[((5208)>>2)]=tempValue+0,tempValue);
 var $6=($5|0)==0;
 if($6){label=9;break;}else{label=4;break;}
 case 4: 
 var $8=$5;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$8]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 5: 
 var $lpad_loopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_loopexit_i$1;var $lpad_phi_i$0=$lpad_loopexit_i$0;label=7;break;
 case 6: 
 var $lpad_nonloopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_nonloopexit_i$1;var $lpad_phi_i$0=$lpad_nonloopexit_i$0;label=7;break;
 case 7: 
 var $lpad_phi_i$0;
 var $lpad_phi_i$1;
 var $10=$lpad_phi_i$1;
 var $11=($10|0)<0;
 if($11){label=8;break;}else{label=10;break;}
 case 8: 
 var $13=$lpad_phi_i$0;
 ___cxa_call_unexpected($13);
 throw "Reached an unreachable!";
 case 9: 
 var $15=___cxa_allocate_exception(4);
 var $16=$15;
 HEAP32[(($16)>>2)]=1288;
 (function() { try { __THREW__ = 0; return ___cxa_throw($15,3744,(100)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=6;break; }
 case 10: 
 ___resumeException($lpad_phi_i$0)
 case 11: 
 throw "Reached an unreachable!";
 case 12: 
 var $20=$2; //@line 15 "src/receiversender.h"
 var $21=(($2+4)|0); //@line 15 "src/receiversender.h"
 var $22=$21; //@line 15 "src/receiversender.h"
 HEAP32[(($22)>>2)]=0; //@line 15 "src/receiversender.h"
 HEAP32[(($20)>>2)]=1352; //@line 222 "src/fskube.h"
 var $23=(($2+8)|0); //@line 227 "src/fskube.h"
 HEAP8[(($23)>>0)]=1; //@line 227 "src/fskube.h"
 var $24=(($2+12)|0); //@line 228 "src/fskube.h"
 var $25=$24; //@line 228 "src/fskube.h"
 HEAP32[(($25)>>2)]=0; //@line 228 "src/fskube.h"
 var $26=(($2+16)|0); //@line 229 "src/fskube.h"
 HEAP8[(($26)>>0)]=0; //@line 229 "src/fskube.h"
 var $27=$2; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $27; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal7InvokerIPN6fskube9DeRs232orEJEE6invokeEPFS4_vE($fn){
 var label=0;


 var $1=FUNCTION_TABLE[$fn](); //@line 291 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 291 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13getActualTypeIN6fskube9DeRs232orEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube9DeRs232orEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube6SenderIbiEEE14convertPointerIS3_NS1_9DeRs232orEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube6SenderIbiEEE14convertPointerINS1_9DeRs232orES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal12operator_newIN6fskube7Rs232orEJEEEPT_DpT0_(){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 label=2;break;
 case 2: 
 var $2=_malloc(8);
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=12;break;}
 case 3: 
 var $5=(tempValue=HEAP32[((5208)>>2)],HEAP32[((5208)>>2)]=tempValue+0,tempValue);
 var $6=($5|0)==0;
 if($6){label=9;break;}else{label=4;break;}
 case 4: 
 var $8=$5;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$8]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 5: 
 var $lpad_loopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_loopexit_i$1;var $lpad_phi_i$0=$lpad_loopexit_i$0;label=7;break;
 case 6: 
 var $lpad_nonloopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_nonloopexit_i$1;var $lpad_phi_i$0=$lpad_nonloopexit_i$0;label=7;break;
 case 7: 
 var $lpad_phi_i$0;
 var $lpad_phi_i$1;
 var $10=$lpad_phi_i$1;
 var $11=($10|0)<0;
 if($11){label=8;break;}else{label=10;break;}
 case 8: 
 var $13=$lpad_phi_i$0;
 ___cxa_call_unexpected($13);
 throw "Reached an unreachable!";
 case 9: 
 var $15=___cxa_allocate_exception(4);
 var $16=$15;
 HEAP32[(($16)>>2)]=1288;
 (function() { try { __THREW__ = 0; return ___cxa_throw($15,3744,(100)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=6;break; }
 case 10: 
 ___resumeException($lpad_phi_i$0)
 case 11: 
 throw "Reached an unreachable!";
 case 12: 
 var $20=$2; //@line 15 "src/receiversender.h"
 var $21=(($2+4)|0); //@line 15 "src/receiversender.h"
 var $22=$21; //@line 15 "src/receiversender.h"
 HEAP32[(($22)>>2)]=0; //@line 15 "src/receiversender.h"
 HEAP32[(($20)>>2)]=1384; //@line 198 "src/fskube.h"
 var $23=$2; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $23; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal7InvokerIPN6fskube7Rs232orEJEE6invokeEPFS4_vE($fn){
 var label=0;


 var $1=FUNCTION_TABLE[$fn](); //@line 291 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 291 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13getActualTypeIN6fskube7Rs232orEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube7Rs232orEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube6SenderIibEEE14convertPointerIS3_NS1_7Rs232orEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube6SenderIibEEE14convertPointerINS1_7Rs232orES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube11DemodulatorEFvvEvPS3_JEE6invokeERKS5_S6_($method,$wireThis){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal12operator_newIN6fskube11DemodulatorEJNS2_9FskParamsEEEEPT_DpT0_($args){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+48)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $args; $args=STACKTOP;STACKTOP = (STACKTOP + 16)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($args)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($args)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];HEAP32[((($args)+(8))>>2)]=HEAP32[(((tempParam)+(8))>>2)];HEAP32[((($args)+(12))>>2)]=HEAP32[(((tempParam)+(12))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=sp;
 var $2=(sp)+(24);
 label=2;break;
 case 2: 
 var $4=_malloc(112);
 var $5=($4|0)==0;
 if($5){label=3;break;}else{label=12;break;}
 case 3: 
 var $7=(tempValue=HEAP32[((5208)>>2)],HEAP32[((5208)>>2)]=tempValue+0,tempValue);
 var $8=($7|0)==0;
 if($8){label=9;break;}else{label=4;break;}
 case 4: 
 var $10=$7;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$10]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 5: 
 var $lpad_loopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_loopexit_i$1;var $lpad_phi_i$0=$lpad_loopexit_i$0;label=7;break;
 case 6: 
 var $lpad_nonloopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_nonloopexit_i$1;var $lpad_phi_i$0=$lpad_nonloopexit_i$0;label=7;break;
 case 7: 
 var $lpad_phi_i$0;
 var $lpad_phi_i$1;
 var $12=$lpad_phi_i$1;
 var $13=($12|0)<0;
 if($13){label=8;break;}else{label=10;break;}
 case 8: 
 var $15=$lpad_phi_i$0;
 ___cxa_call_unexpected($15);
 throw "Reached an unreachable!";
 case 9: 
 var $17=___cxa_allocate_exception(4);
 var $18=$17;
 HEAP32[(($18)>>2)]=1288;
 (function() { try { __THREW__ = 0; return ___cxa_throw($17,3744,(100)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=6;break; }
 case 10: 
 ___resumeException($lpad_phi_i$0)
 case 11: 
 throw "Reached an unreachable!";
 case 12: 
 var $22=$args; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $23=$4; //@line 15 "src/receiversender.h"
 var $24=(($4+4)|0); //@line 15 "src/receiversender.h"
 var $25=$24; //@line 15 "src/receiversender.h"
 HEAP32[(($25)>>2)]=0; //@line 15 "src/receiversender.h"
 HEAP32[(($23)>>2)]=1512; //@line 34 "src/fskube.h"
 var $26=(($4+8)|0); //@line 34 "src/fskube.h"
 assert(16 % 1 === 0);HEAP32[(($26)>>2)]=HEAP32[(($22)>>2)];HEAP32[((($26)+(4))>>2)]=HEAP32[((($22)+(4))>>2)];HEAP32[((($26)+(8))>>2)]=HEAP32[((($22)+(8))>>2)];HEAP32[((($26)+(12))>>2)]=HEAP32[((($22)+(12))>>2)]; //@line 34 "src/fskube.h"
 var $27=(($4+24)|0); //@line 34 "src/fskube.h"
 var $28=$27; //@line 34 "src/fskube.h"
 HEAPF64[(($28)>>3)]=0.4; //@line 34 "src/fskube.h"
 var $29=(($4+32)|0); //@line 34 "src/fskube.h"
 var $30=$29; //@line 34 "src/fskube.h"
 HEAPF64[(($30)>>3)]=-0.4; //@line 34 "src/fskube.h"
 var $31=$1; //@line 38 "src/fskube.h"
 var $$etemp$0$0=24;
 var $$etemp$0$1=0;

 var $32=$2; //@line 38 "src/fskube.h"
 var $$etemp$1$0=24;
 var $$etemp$1$1=0;

 var $33=(($4+40)|0); //@line 39 "src/fskube.h"
 var $34=$33; //@line 39 "src/fskube.h"
 var $$etemp$2$0=0;
 var $$etemp$2$1=0;
 var $st$3$0=(($34)|0);
 HEAP32[(($st$3$0)>>2)]=$$etemp$2$0;
 var $st$4$1=(($34+4)|0);
 HEAP32[(($st$4$1)>>2)]=$$etemp$2$1;
 var $35=(($4+48)|0); //@line 40 "src/fskube.h"
 HEAP32[(($31)>>2)]=0; HEAP32[((($31)+(4))>>2)]=0; HEAP32[((($31)+(8))>>2)]=0; HEAP32[((($31)+(12))>>2)]=0; HEAP32[((($31)+(16))>>2)]=0; HEAP32[((($31)+(20))>>2)]=0; //@line 40 "src/fskube.h"
 assert(24 % 1 === 0);HEAP32[(($35)>>2)]=HEAP32[(($31)>>2)];HEAP32[((($35)+(4))>>2)]=HEAP32[((($31)+(4))>>2)];HEAP32[((($35)+(8))>>2)]=HEAP32[((($31)+(8))>>2)];HEAP32[((($35)+(12))>>2)]=HEAP32[((($31)+(12))>>2)];HEAP32[((($35)+(16))>>2)]=HEAP32[((($31)+(16))>>2)];HEAP32[((($35)+(20))>>2)]=HEAP32[((($31)+(20))>>2)]; //@line 40 "src/fskube.h"
 var $36=(($4+72)|0); //@line 41 "src/fskube.h"
 var $37=$36; //@line 41 "src/fskube.h"
 HEAP32[(($37)>>2)]=0; //@line 41 "src/fskube.h"
 var $38=(($4+80)|0); //@line 42 "src/fskube.h"
 HEAP32[(($32)>>2)]=0; HEAP32[((($32)+(4))>>2)]=0; HEAP32[((($32)+(8))>>2)]=0; HEAP32[((($32)+(12))>>2)]=0; HEAP32[((($32)+(16))>>2)]=0; HEAP32[((($32)+(20))>>2)]=0; //@line 42 "src/fskube.h"
 assert(24 % 1 === 0);HEAP32[(($38)>>2)]=HEAP32[(($32)>>2)];HEAP32[((($38)+(4))>>2)]=HEAP32[((($32)+(4))>>2)];HEAP32[((($38)+(8))>>2)]=HEAP32[((($32)+(8))>>2)];HEAP32[((($38)+(12))>>2)]=HEAP32[((($32)+(12))>>2)];HEAP32[((($38)+(16))>>2)]=HEAP32[((($32)+(16))>>2)];HEAP32[((($38)+(20))>>2)]=HEAP32[((($32)+(20))>>2)]; //@line 42 "src/fskube.h"
 var $39=(($4+104)|0); //@line 44 "src/fskube.h"
 var $40=$39; //@line 44 "src/fskube.h"
 HEAP32[(($40)>>2)]=0; //@line 44 "src/fskube.h"
 var $41=(($4+108)|0); //@line 45 "src/fskube.h"
 var $42=$41; //@line 45 "src/fskube.h"
 HEAP32[(($42)>>2)]=0; //@line 45 "src/fskube.h"
 var $$etemp$5$0=24;
 var $$etemp$5$1=0;

 var $$etemp$6$0=24;
 var $$etemp$6$1=0;

 var $43=$4; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 STACKTOP=sp;return $43; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal7InvokerIPN6fskube11DemodulatorEJNS2_9FskParamsEEE6invokeEPFS4_S5_EPS5_($fn,$args){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1=sp;
 var $2=$1; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $3=$args; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 assert(16 % 1 === 0);HEAP32[(($2)>>2)]=HEAP32[(($3)>>2)];HEAP32[((($2)+(4))>>2)]=HEAP32[((($3)+(4))>>2)];HEAP32[((($2)+(8))>>2)]=HEAP32[((($3)+(8))>>2)];HEAP32[((($2)+(12))>>2)]=HEAP32[((($3)+(12))>>2)]; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=FUNCTION_TABLE[$fn]($1); //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 STACKTOP=sp;return $4; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13getActualTypeIN6fskube11DemodulatorEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube11DemodulatorEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube6SenderIdbEEE14convertPointerIS3_NS1_11DemodulatorEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube6SenderIdbEEE14convertPointerINS1_11DemodulatorES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube9ModulatorEFvvEvPS3_JEE6invokeERKS5_S6_($method,$wireThis){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal12operator_newIN6fskube9ModulatorEJNS2_9FskParamsEEEEPT_DpT0_($args){
 var label=0;
 var sp=STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $args; $args=STACKTOP;STACKTOP = (STACKTOP + 16)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($args)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($args)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];HEAP32[((($args)+(8))>>2)]=HEAP32[(((tempParam)+(8))>>2)];HEAP32[((($args)+(12))>>2)]=HEAP32[(((tempParam)+(12))>>2)];
 label = 1; 
 while(1)switch(label){
 case 1: 
 label=2;break;
 case 2: 
 var $2=_malloc(32);
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=12;break;}
 case 3: 
 var $5=(tempValue=HEAP32[((5208)>>2)],HEAP32[((5208)>>2)]=tempValue+0,tempValue);
 var $6=($5|0)==0;
 if($6){label=9;break;}else{label=4;break;}
 case 4: 
 var $8=$5;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$8]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 5: 
 var $lpad_loopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_loopexit_i$1;var $lpad_phi_i$0=$lpad_loopexit_i$0;label=7;break;
 case 6: 
 var $lpad_nonloopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_nonloopexit_i$1;var $lpad_phi_i$0=$lpad_nonloopexit_i$0;label=7;break;
 case 7: 
 var $lpad_phi_i$0;
 var $lpad_phi_i$1;
 var $10=$lpad_phi_i$1;
 var $11=($10|0)<0;
 if($11){label=8;break;}else{label=10;break;}
 case 8: 
 var $13=$lpad_phi_i$0;
 ___cxa_call_unexpected($13);
 throw "Reached an unreachable!";
 case 9: 
 var $15=___cxa_allocate_exception(4);
 var $16=$15;
 HEAP32[(($16)>>2)]=1288;
 (function() { try { __THREW__ = 0; return ___cxa_throw($15,3744,(100)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=6;break; }
 case 10: 
 ___resumeException($lpad_phi_i$0)
 case 11: 
 throw "Reached an unreachable!";
 case 12: 
 var $19=$2; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $20=$args; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $21=$2; //@line 15 "src/receiversender.h"
 var $22=(($2+4)|0); //@line 15 "src/receiversender.h"
 var $23=$22; //@line 15 "src/receiversender.h"
 HEAP32[(($23)>>2)]=0; //@line 15 "src/receiversender.h"
 HEAP32[(($21)>>2)]=1320; //@line 10 "src/fskube.h"
 var $24=(($2+8)|0); //@line 10 "src/fskube.h"
 assert(16 % 1 === 0);HEAP32[(($24)>>2)]=HEAP32[(($20)>>2)];HEAP32[((($24)+(4))>>2)]=HEAP32[((($20)+(4))>>2)];HEAP32[((($24)+(8))>>2)]=HEAP32[((($20)+(8))>>2)];HEAP32[((($24)+(12))>>2)]=HEAP32[((($20)+(12))>>2)]; //@line 10 "src/fskube.h"
 __ZN6fskube9Modulator5resetEv($19); //@line 11 "src/fskube.h"
 STACKTOP=sp;return $19; //@line 393 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal7InvokerIPN6fskube9ModulatorEJNS2_9FskParamsEEE6invokeEPFS4_S5_EPS5_($fn,$args){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);

 var $1=sp;
 var $2=$1; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $3=$args; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 assert(16 % 1 === 0);HEAP32[(($2)>>2)]=HEAP32[(($3)>>2)];HEAP32[((($2)+(4))>>2)]=HEAP32[((($3)+(4))>>2)];HEAP32[((($2)+(8))>>2)]=HEAP32[((($3)+(8))>>2)];HEAP32[((($2)+(12))>>2)]=HEAP32[((($3)+(12))>>2)]; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=FUNCTION_TABLE[$fn]($1); //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 STACKTOP=sp;return $4; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13getActualTypeIN6fskube9ModulatorEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube9ModulatorEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube6SenderIbdEEE14convertPointerIS3_NS1_9ModulatorEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube6SenderIbdEEE14convertPointerINS1_9ModulatorES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIbiEEFvPNS2_8ReceiverIiEEEvPS4_JS7_EE6invokeERKS9_SA_S7_($method,$wireThis,$args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6,$args); //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderIbiEEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderIbiEEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_6SenderIbiEEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_6SenderIbiEES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIibEEFvPNS2_8ReceiverIbEEEvPS4_JS7_EE6invokeERKS9_SA_S7_($method,$wireThis,$args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6,$args); //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderIibEEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderIibEEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_6SenderIibEEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_6SenderIibEES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIdbEEFvPNS2_8ReceiverIbEEEvPS4_JS7_EE6invokeERKS9_SA_S7_($method,$wireThis,$args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6,$args); //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderIdbEEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderIdbEEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerIS3_NS1_6SenderIdbEEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerINS1_6SenderIdbEES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube6SenderIbdEEFvPNS2_8ReceiverIdEEEvPS4_JS7_EE6invokeERKS9_SA_S7_($method,$wireThis,$args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6,$args); //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube6SenderIbdEEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube6SenderIbdEEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_6SenderIbdEEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_6SenderIbdEES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal11wrapped_newIPN6fskube18intReceiverWrapperES3_JNS_3valEEEET_DpOT1_($args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 label=2;break;
 case 2: 
 var $2=_malloc(8);
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=12;break;}
 case 3: 
 var $5=(tempValue=HEAP32[((5208)>>2)],HEAP32[((5208)>>2)]=tempValue+0,tempValue);
 var $6=($5|0)==0;
 if($6){label=9;break;}else{label=4;break;}
 case 4: 
 var $8=$5;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$8]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 5: 
 var $lpad_loopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_loopexit_i$1;var $lpad_phi_i$0=$lpad_loopexit_i$0;label=7;break;
 case 6: 
 var $lpad_nonloopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_nonloopexit_i$1;var $lpad_phi_i$0=$lpad_nonloopexit_i$0;label=7;break;
 case 7: 
 var $lpad_phi_i$0;
 var $lpad_phi_i$1;
 var $10=$lpad_phi_i$1;
 var $11=($10|0)<0;
 if($11){label=8;break;}else{label=10;break;}
 case 8: 
 var $13=$lpad_phi_i$0;
 ___cxa_call_unexpected($13);
 throw "Reached an unreachable!";
 case 9: 
 var $15=___cxa_allocate_exception(4);
 var $16=$15;
 HEAP32[(($16)>>2)]=1288;
 (function() { try { __THREW__ = 0; return ___cxa_throw($15,3744,(100)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=6;break; }
 case 10: 
 ___resumeException($lpad_phi_i$0)
 case 11: 
 throw "Reached an unreachable!";
 case 12: 
 var $20=$2; //@line 888 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($20)>>2)]=1544; //@line 888 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $21=(($2+4)|0); //@line 888 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $22=$21; //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $23=(($args)|0); //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $24=HEAP32[(($23)>>2)]; //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($22)>>2)]=$24; //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($23)>>2)]=0; //@line 317 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($20)>>2)]=1480; //@line 23 "src/embind.cpp"
 var $25=$2; //@line 398 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $25; //@line 398 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube18intReceiverWrapperD1Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1544; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 return; //@line 22 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube18intReceiverWrapperD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1544; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $7=$this; //@line 22 "src/embind.cpp"
 _free($7);
 return; //@line 22 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube18intReceiverWrapper7receiveEi($this,$b){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+32)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $args_i_i_i_i_i=sp;
 var $argv_i_i_i=(sp)+(16);
 var $destructors_i_i_i=(sp)+(24);
 var $1=(($this+4)|0); //@line 392 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $2=HEAP32[(($1)>>2)]; //@line 392 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=$argv_i_i_i; //@line 230 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $$etemp$0$0=8;
 var $$etemp$0$1=0;

 var $4=$destructors_i_i_i; //@line 230 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $$etemp$1$0=4;
 var $$etemp$1$1=0;

 var $5=HEAP8[((5216)>>0)]; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $6=(($5<<24)>>24)==0; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 if($6){label=2;break;}else{label=6;break;} //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $8=___cxa_guard_acquire(5216); //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $9=($8|0)==0; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 if($9){label=6;break;}else{label=3;break;} //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $11=$args_i_i_i_i_i; //@line 91 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $$etemp$2$0=12;
 var $$etemp$2$1=0;

 var $12=(($args_i_i_i_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($12)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $13=(($args_i_i_i_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($13)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $14=(($args_i_i_i_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($14)>>2)]=__ZTIi; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $15=(function() { try { __THREW__ = 0; return __emval_get_method_caller(2,$13) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=4;break; } else { label=5;break; }
 case 4: 
 var $$etemp$3$0=12;
 var $$etemp$3$1=0;

 HEAP32[((5184)>>2)]=$15; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 label=6;break; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 5: 
 var $17$0 = ___cxa_find_matching_catch(-1, -1); var $17$1 = tempRet0;
 //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 ___resumeException($17$0) //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 6: 
 var $18=HEAP32[((5184)>>2)]; //@line 86 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $19=$argv_i_i_i; //@line 182 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($19)>>2)]=$b; //@line 182 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $20=__emval_call_method($18,$2,96,$destructors_i_i_i,$3); //@line 240 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $21=HEAP32[(($destructors_i_i_i)>>2)]; //@line 241 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_run_destructors($21) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=8;break; } else { label=7;break; } //@line 102 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 7: 
 var $23$0 = ___cxa_find_matching_catch(-1, -1,0); var $23$1 = tempRet0;
 var $24=$23$0;
 ___clang_call_terminate($24); //@line 102 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 102 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 8: 
 var $$etemp$4$0=8;
 var $$etemp$4$1=0;

 var $$etemp$5$0=4;
 var $$etemp$5$1=0;

 STACKTOP=sp;return; //@line 25 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function ___clang_call_terminate($0){
 var label=0;


 var $2=___cxa_begin_catch($0);
 __ZSt9terminatev();
 throw "Reached an unreachable!";
}


function __ZN10emscripten7wrapperIN6fskube8ReceiverIiEEED1Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1544; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 return; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten7wrapperIN6fskube8ReceiverIiEEED0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1544; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $7=$this; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 _free($7);
 return; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal7InvokerIPN6fskube18intReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE($fn,$args){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=sp;
 var $2=(($1)|0); //@line 418 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($2)>>2)]=$args; //@line 418 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=(function() { try { __THREW__ = 0; return FUNCTION_TABLE[$fn]($1) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; } //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $5=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($5) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=4;break; } else { label=3;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $7$0 = ___cxa_find_matching_catch(-1, -1,0); var $7$1 = tempRet0;
 var $8=$7$0;
 ___clang_call_terminate($8); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 4: 
 STACKTOP=sp;return $3; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 5: 
 var $10$0 = ___cxa_find_matching_catch(-1, -1); var $10$1 = tempRet0;
 var $11=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($11) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=7;break; } else { label=6;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 6: 
 var $13$0 = ___cxa_find_matching_catch(-1, -1,0); var $13$1 = tempRet0;
 var $14=$13$0;
 ___clang_call_terminate($14); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 7: 
 ___resumeException($10$0) //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube18intReceiverWrapperEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube18intReceiverWrapperEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerIS3_NS1_18intReceiverWrapperEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube8ReceiverIiEEE14convertPointerINS1_18intReceiverWrapperES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIiEEFviEvPS4_JiEE6invokeERKS6_S7_i($method,$wireThis,$args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6,$args); //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIiEEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIiEEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal11wrapped_newIPN6fskube21doubleReceiverWrapperES3_JNS_3valEEEET_DpOT1_($args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 label=2;break;
 case 2: 
 var $2=_malloc(8);
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=12;break;}
 case 3: 
 var $5=(tempValue=HEAP32[((5208)>>2)],HEAP32[((5208)>>2)]=tempValue+0,tempValue);
 var $6=($5|0)==0;
 if($6){label=9;break;}else{label=4;break;}
 case 4: 
 var $8=$5;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$8]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 5: 
 var $lpad_loopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_loopexit_i$1;var $lpad_phi_i$0=$lpad_loopexit_i$0;label=7;break;
 case 6: 
 var $lpad_nonloopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_nonloopexit_i$1;var $lpad_phi_i$0=$lpad_nonloopexit_i$0;label=7;break;
 case 7: 
 var $lpad_phi_i$0;
 var $lpad_phi_i$1;
 var $10=$lpad_phi_i$1;
 var $11=($10|0)<0;
 if($11){label=8;break;}else{label=10;break;}
 case 8: 
 var $13=$lpad_phi_i$0;
 ___cxa_call_unexpected($13);
 throw "Reached an unreachable!";
 case 9: 
 var $15=___cxa_allocate_exception(4);
 var $16=$15;
 HEAP32[(($16)>>2)]=1288;
 (function() { try { __THREW__ = 0; return ___cxa_throw($15,3744,(100)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=6;break; }
 case 10: 
 ___resumeException($lpad_phi_i$0)
 case 11: 
 throw "Reached an unreachable!";
 case 12: 
 var $20=$2; //@line 888 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($20)>>2)]=1576; //@line 888 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $21=(($2+4)|0); //@line 888 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $22=$21; //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $23=(($args)|0); //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $24=HEAP32[(($23)>>2)]; //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($22)>>2)]=$24; //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($23)>>2)]=0; //@line 317 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($20)>>2)]=1416; //@line 16 "src/embind.cpp"
 var $25=$2; //@line 398 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $25; //@line 398 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube21doubleReceiverWrapperD1Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1576; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 return; //@line 15 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube21doubleReceiverWrapperD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1576; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $7=$this; //@line 15 "src/embind.cpp"
 _free($7);
 return; //@line 15 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube21doubleReceiverWrapper7receiveEd($this,$b){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+32)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $args_i_i_i_i_i=sp;
 var $argv_i_i_i=(sp)+(16);
 var $destructors_i_i_i=(sp)+(24);
 var $1=(($this+4)|0); //@line 392 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $2=HEAP32[(($1)>>2)]; //@line 392 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=$argv_i_i_i; //@line 230 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $$etemp$0$0=8;
 var $$etemp$0$1=0;

 var $4=$destructors_i_i_i; //@line 230 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $$etemp$1$0=4;
 var $$etemp$1$1=0;

 var $5=HEAP8[((5224)>>0)]; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $6=(($5<<24)>>24)==0; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 if($6){label=2;break;}else{label=6;break;} //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $8=___cxa_guard_acquire(5224); //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $9=($8|0)==0; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 if($9){label=6;break;}else{label=3;break;} //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $11=$args_i_i_i_i_i; //@line 91 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $$etemp$2$0=12;
 var $$etemp$2$1=0;

 var $12=(($args_i_i_i_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($12)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $13=(($args_i_i_i_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($13)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $14=(($args_i_i_i_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($14)>>2)]=__ZTId; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $15=(function() { try { __THREW__ = 0; return __emval_get_method_caller(2,$13) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=4;break; } else { label=5;break; }
 case 4: 
 var $$etemp$3$0=12;
 var $$etemp$3$1=0;

 HEAP32[((5192)>>2)]=$15; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 label=6;break; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 5: 
 var $17$0 = ___cxa_find_matching_catch(-1, -1); var $17$1 = tempRet0;
 //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 ___resumeException($17$0) //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 6: 
 var $18=HEAP32[((5192)>>2)]; //@line 86 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $19=(($argv_i_i_i)|0); //@line 163 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAPF64[(($19)>>3)]=$b; //@line 163 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $20=__emval_call_method($18,$2,96,$destructors_i_i_i,$3); //@line 240 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $21=HEAP32[(($destructors_i_i_i)>>2)]; //@line 241 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_run_destructors($21) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=8;break; } else { label=7;break; } //@line 102 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 7: 
 var $23$0 = ___cxa_find_matching_catch(-1, -1,0); var $23$1 = tempRet0;
 var $24=$23$0;
 ___clang_call_terminate($24); //@line 102 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 102 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 8: 
 var $$etemp$4$0=8;
 var $$etemp$4$1=0;

 var $$etemp$5$0=4;
 var $$etemp$5$1=0;

 STACKTOP=sp;return; //@line 18 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten7wrapperIN6fskube8ReceiverIdEEED1Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1576; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 return; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten7wrapperIN6fskube8ReceiverIdEEED0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1576; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $7=$this; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 _free($7);
 return; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal7InvokerIPN6fskube21doubleReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE($fn,$args){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=sp;
 var $2=(($1)|0); //@line 418 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($2)>>2)]=$args; //@line 418 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=(function() { try { __THREW__ = 0; return FUNCTION_TABLE[$fn]($1) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; } //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $5=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($5) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=4;break; } else { label=3;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $7$0 = ___cxa_find_matching_catch(-1, -1,0); var $7$1 = tempRet0;
 var $8=$7$0;
 ___clang_call_terminate($8); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 4: 
 STACKTOP=sp;return $3; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 5: 
 var $10$0 = ___cxa_find_matching_catch(-1, -1); var $10$1 = tempRet0;
 var $11=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($11) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=7;break; } else { label=6;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 6: 
 var $13$0 = ___cxa_find_matching_catch(-1, -1,0); var $13$1 = tempRet0;
 var $14=$13$0;
 ___clang_call_terminate($14); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 7: 
 ___resumeException($10$0) //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube21doubleReceiverWrapperEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube21doubleReceiverWrapperEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerIS3_NS1_21doubleReceiverWrapperEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube8ReceiverIdEEE14convertPointerINS1_21doubleReceiverWrapperES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIdEEFvdEvPS4_JdEE6invokeERKS6_S7_d($method,$wireThis,$args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6,$args); //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIdEEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIdEEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal11wrapped_newIPN6fskube19boolReceiverWrapperES3_JNS_3valEEEET_DpOT1_($args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 label=2;break;
 case 2: 
 var $2=_malloc(8);
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=12;break;}
 case 3: 
 var $5=(tempValue=HEAP32[((5208)>>2)],HEAP32[((5208)>>2)]=tempValue+0,tempValue);
 var $6=($5|0)==0;
 if($6){label=9;break;}else{label=4;break;}
 case 4: 
 var $8=$5;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$8]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 5: 
 var $lpad_loopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_loopexit_i$1;var $lpad_phi_i$0=$lpad_loopexit_i$0;label=7;break;
 case 6: 
 var $lpad_nonloopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_nonloopexit_i$1;var $lpad_phi_i$0=$lpad_nonloopexit_i$0;label=7;break;
 case 7: 
 var $lpad_phi_i$0;
 var $lpad_phi_i$1;
 var $10=$lpad_phi_i$1;
 var $11=($10|0)<0;
 if($11){label=8;break;}else{label=10;break;}
 case 8: 
 var $13=$lpad_phi_i$0;
 ___cxa_call_unexpected($13);
 throw "Reached an unreachable!";
 case 9: 
 var $15=___cxa_allocate_exception(4);
 var $16=$15;
 HEAP32[(($16)>>2)]=1288;
 (function() { try { __THREW__ = 0; return ___cxa_throw($15,3744,(100)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=6;break; }
 case 10: 
 ___resumeException($lpad_phi_i$0)
 case 11: 
 throw "Reached an unreachable!";
 case 12: 
 var $20=$2; //@line 888 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($20)>>2)]=1608; //@line 888 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $21=(($2+4)|0); //@line 888 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $22=$21; //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $23=(($args)|0); //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $24=HEAP32[(($23)>>2)]; //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($22)>>2)]=$24; //@line 316 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($23)>>2)]=0; //@line 317 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($20)>>2)]=1448; //@line 9 "src/embind.cpp"
 var $25=$2; //@line 398 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $25; //@line 398 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube19boolReceiverWrapperD1Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1608; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 return; //@line 8 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube19boolReceiverWrapperD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1608; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $7=$this; //@line 8 "src/embind.cpp"
 _free($7);
 return; //@line 8 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube19boolReceiverWrapper7receiveEb($this,$b){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+32)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $args_i_i_i_i_i=sp;
 var $argv_i_i_i=(sp)+(16);
 var $destructors_i_i_i=(sp)+(24);
 var $1=(($this+4)|0); //@line 392 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $2=HEAP32[(($1)>>2)]; //@line 392 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=$argv_i_i_i; //@line 230 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $$etemp$0$0=8;
 var $$etemp$0$1=0;

 var $4=$destructors_i_i_i; //@line 230 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $$etemp$1$0=4;
 var $$etemp$1$1=0;

 var $5=HEAP8[((5232)>>0)]; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $6=(($5<<24)>>24)==0; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 if($6){label=2;break;}else{label=6;break;} //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $8=___cxa_guard_acquire(5232); //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $9=($8|0)==0; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 if($9){label=6;break;}else{label=3;break;} //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $11=$args_i_i_i_i_i; //@line 91 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $$etemp$2$0=12;
 var $$etemp$2$1=0;

 var $12=(($args_i_i_i_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($12)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $13=(($args_i_i_i_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($13)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $14=(($args_i_i_i_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($14)>>2)]=3728; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $15=(function() { try { __THREW__ = 0; return __emval_get_method_caller(2,$13) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=4;break; } else { label=5;break; }
 case 4: 
 var $$etemp$3$0=12;
 var $$etemp$3$1=0;

 HEAP32[((5200)>>2)]=$15; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 label=6;break; //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 5: 
 var $17$0 = ___cxa_find_matching_catch(-1, -1); var $17$1 = tempRet0;
 //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 ___resumeException($17$0) //@line 85 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 6: 
 var $18=HEAP32[((5200)>>2)]; //@line 86 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $19=($b&1); //@line 182 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $20=$argv_i_i_i; //@line 182 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($20)>>2)]=$19; //@line 182 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $21=__emval_call_method($18,$2,96,$destructors_i_i_i,$3); //@line 240 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $22=HEAP32[(($destructors_i_i_i)>>2)]; //@line 241 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_run_destructors($22) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=8;break; } else { label=7;break; } //@line 102 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 7: 
 var $24$0 = ___cxa_find_matching_catch(-1, -1,0); var $24$1 = tempRet0;
 var $25=$24$0;
 ___clang_call_terminate($25); //@line 102 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 102 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 8: 
 var $$etemp$4$0=8;
 var $$etemp$4$1=0;

 var $$etemp$5$0=4;
 var $$etemp$5$1=0;

 STACKTOP=sp;return; //@line 11 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten7wrapperIN6fskube8ReceiverIbEEED1Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1608; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 return; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten7wrapperIN6fskube8ReceiverIbEEED0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0); //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($1)>>2)]=1608; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=(($this+4)|0); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($3) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=2;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 2: 
 var $5$0 = ___cxa_find_matching_catch(-1, -1,0); var $5$1 = tempRet0;
 var $6=$5$0;
 ___clang_call_terminate($6); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $7=$this; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 _free($7);
 return; //@line 882 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal7InvokerIPN6fskube19boolReceiverWrapperEJONS_3valEEE6invokeEPFS4_S6_EPNS0_7_EM_VALE($fn,$args){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=sp;
 var $2=(($1)|0); //@line 418 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 HEAP32[(($2)>>2)]=$args; //@line 418 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 var $3=(function() { try { __THREW__ = 0; return FUNCTION_TABLE[$fn]($1) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; } //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $5=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($5) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=4;break; } else { label=3;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 3: 
 var $7$0 = ___cxa_find_matching_catch(-1, -1,0); var $7$1 = tempRet0;
 var $8=$7$0;
 ___clang_call_terminate($8); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 4: 
 STACKTOP=sp;return $3; //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 5: 
 var $10$0 = ___cxa_find_matching_catch(-1, -1); var $10$1 = tempRet0;
 var $11=HEAP32[(($2)>>2)]; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 (function() { try { __THREW__ = 0; return __emval_decref($11) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=7;break; } else { label=6;break; } //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 6: 
 var $13$0 = ___cxa_find_matching_catch(-1, -1,0); var $13$1 = tempRet0;
 var $14=$13$0;
 ___clang_call_terminate($14); //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 throw "Reached an unreachable!"; //@line 327 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/val.h"
 case 7: 
 ___resumeException($10$0) //@line 292 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube19boolReceiverWrapperEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube19boolReceiverWrapperEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerIS3_NS1_19boolReceiverWrapperEEEPT0_PT_($ptr){
 var label=0;


 var $1=$ptr; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten4baseIN6fskube8ReceiverIbEEE14convertPointerINS1_19boolReceiverWrapperES3_EEPT0_PT_($ptr){
 var label=0;


 var $1=(($ptr)|0); //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $1; //@line 971 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal13MethodInvokerIMN6fskube8ReceiverIbEEFvbEvPS4_JbEE6invokeERKS6_S7_b($method,$wireThis,$args){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $ld$0$0=(($method)|0);
 var $1$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($method+4)|0);
 var $1$1=HEAP32[(($ld$1$1)>>2)];
 var $2=$1$1;
 var $3=$2>>1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$wireThis; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+$3)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $7=$1$0;
 var $8=$2&1; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $9=($8|0)==0; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($9){label=3;break;}else{label=2;break;} //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $11=$5; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=HEAP32[(($11)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $13=(($12+$7)|0); //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $14=$13; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $15=HEAP32[(($14)>>2)]; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$15;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 var $17=$7; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $19=$17;label=4;break; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 4: 
 var $19; //@line 470 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$19]($6,$args); //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 471 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal13getActualTypeIN6fskube8ReceiverIbEEEEPKNS0_7_TYPEIDEPT_($ptr){
 var label=0;


 var $1=$ptr; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $2=HEAP32[(($1)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $3=((($2)-(4))|0); //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $4=HEAP32[(($3)>>2)]; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $5=$4; //@line 68 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 935 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal14raw_destructorIN6fskube8ReceiverIbEEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $3=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=HEAP32[(($3)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=(($4+4)|0); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $6=HEAP32[(($5)>>2)]; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 FUNCTION_TABLE[$6]($ptr); //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal12MemberAccessIN6fskube9FskParamsEjE7getWireIS3_EEjRKMS3_jRKT_($field,$ptr){
 var label=0;


 var $1=HEAP32[(($field)>>2)]; //@line 487 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=$ptr; //@line 487 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $3=(($2+$1)|0); //@line 487 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$3; //@line 487 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $5=HEAP32[(($4)>>2)]; //@line 188 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 return $5; //@line 487 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal12MemberAccessIN6fskube9FskParamsEjE7setWireIS3_EEvRKMS3_jRT_j($field,$ptr,$value){
 var label=0;


 var $1=HEAP32[(($field)>>2)]; //@line 496 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $2=$ptr; //@line 496 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $3=(($2+$1)|0); //@line 496 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $4=$3; //@line 496 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($4)>>2)]=$value; //@line 496 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return; //@line 497 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
}


function __ZN10emscripten8internal15raw_constructorIN6fskube9FskParamsEJEEEPT_DpNS0_11BindingTypeIT0_E8WireTypeE(){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 label=2;break;
 case 2: 
 var $2=_malloc(16);
 var $3=($2|0)==0;
 if($3){label=3;break;}else{label=12;break;}
 case 3: 
 var $5=(tempValue=HEAP32[((5208)>>2)],HEAP32[((5208)>>2)]=tempValue+0,tempValue);
 var $6=($5|0)==0;
 if($6){label=9;break;}else{label=4;break;}
 case 4: 
 var $8=$5;
 (function() { try { __THREW__ = 0; return FUNCTION_TABLE[$8]() } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=5;break; }
 case 5: 
 var $lpad_loopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_loopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_loopexit_i$1;var $lpad_phi_i$0=$lpad_loopexit_i$0;label=7;break;
 case 6: 
 var $lpad_nonloopexit_i$0 = ___cxa_find_matching_catch(-1, -1); var $lpad_nonloopexit_i$1 = tempRet0;
 var $lpad_phi_i$1=$lpad_nonloopexit_i$1;var $lpad_phi_i$0=$lpad_nonloopexit_i$0;label=7;break;
 case 7: 
 var $lpad_phi_i$0;
 var $lpad_phi_i$1;
 var $10=$lpad_phi_i$1;
 var $11=($10|0)<0;
 if($11){label=8;break;}else{label=10;break;}
 case 8: 
 var $13=$lpad_phi_i$0;
 ___cxa_call_unexpected($13);
 throw "Reached an unreachable!";
 case 9: 
 var $15=___cxa_allocate_exception(4);
 var $16=$15;
 HEAP32[(($16)>>2)]=1288;
 (function() { try { __THREW__ = 0; return ___cxa_throw($15,3744,(100)) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=11;break; } else { label=6;break; }
 case 10: 
 ___resumeException($lpad_phi_i$0)
 case 11: 
 throw "Reached an unreachable!";
 case 12: 
 var $19=$2; //@line 405 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 HEAP32[(($2)>>2)]=0; HEAP32[((($2)+(4))>>2)]=0; HEAP32[((($2)+(8))>>2)]=0; HEAP32[((($2)+(12))>>2)]=0; //@line 405 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 return $19; //@line 405 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10emscripten8internal14raw_destructorIN6fskube9FskParamsEEEvPT_($ptr){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($ptr|0)==0; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($1){label=3;break;}else{label=2;break;} //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 2: 
 var $2=$ptr; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 _free($2);
 label=3;break; //@line 412 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 3: 
 return; //@line 413 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
  default: assert(0, "bad label: " + label);
 }

}


function __GLOBAL__I_a(){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+264)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $args_i_i82_i_i=sp;
 var $args_i_i70_i_i=(sp)+(16);
 var $args_i_i52_i_i=(sp)+(32);
 var $args_i_i45_i_i=(sp)+(48);
 var $args_i_i33_i_i=(sp)+(56);
 var $args_i_i26_i_i=(sp)+(72);
 var $args_i_i_i_i=(sp)+(80);
 var $args_i53_i_i=(sp)+(96);
 var $args_i48_i_i=(sp)+(112);
 var $args_i43_i_i=(sp)+(128);
 var $args_i38_i_i=(sp)+(144);
 var $args_i31_i_i=(sp)+(160);
 var $args_i24_i_i=(sp)+(176);
 var $args_i17_i_i=(sp)+(192);
 var $args_i10_i_i=(sp)+(208);
 var $args_i5_i_i=(sp)+(224);
 var $args_i_i_i=(sp)+(240);
 var $0=(sp)+(256);
 var $1=$args_i53_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$0$0=12;
 var $$etemp$0$1=0;

 var $2=$args_i48_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$1$0=12;
 var $$etemp$1$1=0;

 var $3=$args_i43_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$2$0=12;
 var $$etemp$2$1=0;

 var $4=$args_i38_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$3$0=16;
 var $$etemp$3$1=0;

 var $5=$args_i31_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$4$0=16;
 var $$etemp$4$1=0;

 var $6=$args_i24_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$5$0=16;
 var $$etemp$5$1=0;

 var $7=$args_i17_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$6$0=16;
 var $$etemp$6$1=0;

 var $8=$args_i10_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$7$0=16;
 var $$etemp$7$1=0;

 var $9=$args_i5_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$8$0=16;
 var $$etemp$8$1=0;

 var $10=$args_i_i_i; //@line 84 "src/embind.cpp"
 var $$etemp$9$0=16;
 var $$etemp$9$1=0;

 var $11=(($0)|0); //@line 84 "src/embind.cpp"
 var $$etemp$10$0=1;
 var $$etemp$10$1=0;

 __embind_register_value_object(4304,688,944,(10),800,(134)); //@line 725 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $12=(function() { try { __THREW__ = 0; return __ZN10emscripten12value_objectIN6fskube9FskParamsEE5fieldIS2_jEERS3_PKcMT_T0_($0,664,0) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=2;break; } else { label=27;break; } //@line 30 "src/embind.cpp"
 case 2: 
 var $14=(function() { try { __THREW__ = 0; return __ZN10emscripten12value_objectIN6fskube9FskParamsEE5fieldIS2_jEERS3_PKcMT_T0_($12,288,4) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=3;break; } else { label=27;break; } //@line 30 "src/embind.cpp"
 case 3: 
 var $16=(function() { try { __THREW__ = 0; return __ZN10emscripten12value_objectIN6fskube9FskParamsEE5fieldIS2_jEERS3_PKcMT_T0_($14,192,8) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=4;break; } else { label=27;break; } //@line 30 "src/embind.cpp"
 case 4: 
 var $18=(function() { try { __THREW__ = 0; return __ZN10emscripten12value_objectIN6fskube9FskParamsEE5fieldIS2_jEERS3_PKcMT_T0_($16,144,12) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=5;break; } else { label=27;break; } //@line 30 "src/embind.cpp"
 case 5: 
 (function() { try { __THREW__ = 0; return __embind_finalize_value_object(4304) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=7;break; } else { label=6;break; } //@line 730 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 6: 
 var $21$0 = ___cxa_find_matching_catch(-1, -1,0); var $21$1 = tempRet0;
 __ZSt9terminatev(); //@line 731 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 throw "Reached an unreachable!"; //@line 731 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 7: 
 __embind_register_class(4344,3824,4048,0,1200,(260),912,0,912,0,112,832,(122)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $22=(($args_i_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($22)>>2)]=3; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $23=(($args_i_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($23)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $24=(($args_i_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($24)>>2)]=3824; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $25=(($args_i_i_i+12)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($25)>>2)]=3728; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $26=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $27=($26|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($27){label=9;break;}else{label=8;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 8: 
 var $29=$26; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $st$11$0=(($29)|0);
 HEAP32[(($st$11$0)>>2)]=8;
 var $st$12$1=(($29+4)|0);
 HEAP32[(($st$12$1)>>2)]=1;
 label=9;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 9: 
 __embind_register_class_function(4344,96,3,$23,744,(214),$26); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $30=$args_i_i_i_i; //@line 1099 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$13$0=12;
 var $$etemp$13$1=0;

 __embind_register_class(4448,3936,4160,4344,1256,(18),1016,(72),1120,(96),56,888,(210)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $31=(($args_i_i_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($31)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $32=(($args_i_i_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($32)>>2)]=3936; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $33=(($args_i_i_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($33)>>2)]=4544; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 __embind_register_class_class_function(4344,216,2,$32,1128,(116),(142)); //@line 1257 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$14$0=12;
 var $$etemp$14$1=0;

 __embind_register_class(4336,3808,4032,0,1192,(80),912,0,912,0,16,824,(124)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $34=(($args_i5_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($34)>>2)]=3; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $35=(($args_i5_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($35)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $36=(($args_i5_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($36)>>2)]=3808; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $37=(($args_i5_i_i+12)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($37)>>2)]=__ZTId; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $38=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $39=($38|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($39){label=11;break;}else{label=10;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 10: 
 var $41=$38; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $st$15$0=(($41)|0);
 HEAP32[(($st$15$0)>>2)]=8;
 var $st$16$1=(($41+4)|0);
 HEAP32[(($st$16$1)>>2)]=1;
 label=11;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 11: 
 __embind_register_class_function(4336,96,3,$35,736,(46),$38); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $42=$args_i_i33_i_i; //@line 1099 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$17$0=12;
 var $$etemp$17$1=0;

 __embind_register_class(4432,3920,4144,4336,1248,(186),992,(140),1104,(118),640,880,(12)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $43=(($args_i_i33_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($43)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $44=(($args_i_i33_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($44)>>2)]=3920; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $45=(($args_i_i33_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($45)>>2)]=4544; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 __embind_register_class_class_function(4336,216,2,$44,1112,(230),(66)); //@line 1257 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$18$0=12;
 var $$etemp$18$1=0;

 __embind_register_class(4328,3792,4016,0,1184,(234),912,0,912,0,608,816,(68)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $46=(($args_i10_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($46)>>2)]=3; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $47=(($args_i10_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($47)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $48=(($args_i10_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($48)>>2)]=3792; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $49=(($args_i10_i_i+12)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($49)>>2)]=__ZTIi; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $50=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $51=($50|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($51){label=13;break;}else{label=12;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 12: 
 var $53=$50; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $st$19$0=(($53)|0);
 HEAP32[(($st$19$0)>>2)]=8;
 var $st$20$1=(($53+4)|0);
 HEAP32[(($st$20$1)>>2)]=1;
 label=13;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 13: 
 __embind_register_class_function(4328,96,3,$47,728,(176),$50); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $54=$args_i_i52_i_i; //@line 1099 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$21$0=12;
 var $$etemp$21$1=0;

 __embind_register_class(4464,3952,4176,4328,1264,(192),976,(196),1136,(182),576,896,(6)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $55=(($args_i_i52_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($55)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $56=(($args_i_i52_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($56)>>2)]=3952; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $57=(($args_i_i52_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($57)>>2)]=4544; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 __embind_register_class_class_function(4328,216,2,$56,1144,(188),(268)); //@line 1257 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$22$0=12;
 var $$etemp$22$1=0;

 __embind_register_class(4416,3904,4128,4344,1240,(160),1008,(158),1096,(252),528,872,(64)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $58=(($args_i17_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($58)>>2)]=3; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $59=(($args_i17_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($59)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $60=(($args_i17_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($60)>>2)]=3904; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $61=(($args_i17_i_i+12)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($61)>>2)]=3808; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $62=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $63=($62|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($63){label=15;break;}else{label=14;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 14: 
 var $65=$62; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$23=(126);
 var $st$24$0=(($65)|0);
 HEAP32[(($st$24$0)>>2)]=$$etemp$23;
 var $st$25$1=(($65+4)|0);
 HEAP32[(($st$25$1)>>2)]=0;
 label=15;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 15: 
 __embind_register_class_function(4416,504,3,$59,776,(112),$62); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 __embind_register_class(4384,3872,4096,4336,1224,(90),984,(206),1056,(170),432,856,(104)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $66=(($args_i24_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($66)>>2)]=3; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $67=(($args_i24_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($67)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $68=(($args_i24_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($68)>>2)]=3872; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $69=(($args_i24_i_i+12)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($69)>>2)]=3824; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $70=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $71=($70|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($71){label=17;break;}else{label=16;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 16: 
 var $73=$70; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$26=(30);
 var $st$27$0=(($73)|0);
 HEAP32[(($st$27$0)>>2)]=$$etemp$26;
 var $st$28$1=(($73+4)|0);
 HEAP32[(($st$28$1)>>2)]=0;
 label=17;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 17: 
 __embind_register_class_function(4384,504,3,$67,760,(242),$70); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 __embind_register_class(4368,3856,4080,4328,1216,(76),968,(232),1040,(228),392,848,(204)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $74=(($args_i31_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($74)>>2)]=3; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $75=(($args_i31_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($75)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $76=(($args_i31_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($76)>>2)]=3856; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $77=(($args_i31_i_i+12)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($77)>>2)]=3824; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $78=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $79=($78|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($79){label=19;break;}else{label=18;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 18: 
 var $81=$78; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$29=(136);
 var $st$30$0=(($81)|0);
 HEAP32[(($st$30$0)>>2)]=$$etemp$29;
 var $st$31$1=(($81+4)|0);
 HEAP32[(($st$31$1)>>2)]=0;
 label=19;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 19: 
 __embind_register_class_function(4368,504,3,$75,752,(16),$78); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 __embind_register_class(4400,3888,4112,4344,1232,(246),1000,(172),1080,(74),352,864,(180)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $82=(($args_i38_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($82)>>2)]=3; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $83=(($args_i38_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($83)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $84=(($args_i38_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($84)>>2)]=3888; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $85=(($args_i38_i_i+12)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($85)>>2)]=3792; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $86=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $87=($86|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($87){label=21;break;}else{label=20;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 20: 
 var $89=$86; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$32=(108);
 var $st$33$0=(($89)|0);
 HEAP32[(($st$33$0)>>2)]=$$etemp$32;
 var $st$34$1=(($89+4)|0);
 HEAP32[(($st$34$1)>>2)]=0;
 label=21;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 21: 
 __embind_register_class_function(4400,504,3,$83,768,(178),$86); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 __embind_register_class(4288,3760,3984,4416,1168,(152),1088,(78),928,(14),312,792,(270)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $90=$args_i_i82_i_i; //@line 1064 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$35$0=12;
 var $$etemp$35$1=0;

 var $91=(($args_i_i82_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($91)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $92=(($args_i_i82_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($92)>>2)]=3760; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $93=(($args_i_i82_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($93)>>2)]=4304; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 __embind_register_class_constructor(4288,2,$92,936,(84),(86)); //@line 1074 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$36$0=12;
 var $$etemp$36$1=0;

 var $94=(($args_i43_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($94)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $95=(($args_i43_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($95)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $96=(($args_i43_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($96)>>2)]=3760; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $97=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $98=($97|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($98){label=23;break;}else{label=22;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 22: 
 var $100=$97; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $st$37$0=(($100)|0);
 HEAP32[(($st$37$0)>>2)]=12;
 var $st$38$1=(($100+4)|0);
 HEAP32[(($st$38$1)>>2)]=1;
 label=23;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 23: 
 __embind_register_class_function(4288,304,2,$95,704,(194),$97); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 __embind_register_class(4480,3968,4192,4384,1272,(250),1064,(220),1152,(272),272,904,(54)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $101=$args_i_i70_i_i; //@line 1064 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$39$0=12;
 var $$etemp$39$1=0;

 var $102=(($args_i_i70_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($102)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $103=(($args_i_i70_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($103)>>2)]=3968; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $104=(($args_i_i70_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($104)>>2)]=4304; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 __embind_register_class_constructor(4480,2,$103,1160,(36),(208)); //@line 1074 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$40$0=12;
 var $$etemp$40$1=0;

 var $105=(($args_i48_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($105)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $106=(($args_i48_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($106)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $107=(($args_i48_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($107)>>2)]=3968; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $108=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $109=($108|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($109){label=25;break;}else{label=24;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 24: 
 var $111=$108; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$41=(88);
 var $st$42$0=(($111)|0);
 HEAP32[(($st$42$0)>>2)]=$$etemp$41;
 var $st$43$1=(($111+4)|0);
 HEAP32[(($st$43$1)>>2)]=0;
 label=25;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 25: 
 __embind_register_class_function(4480,264,2,$106,784,(52),$108); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 __embind_register_class(4352,3840,4064,4368,1208,(168),1048,(162),1024,(258),256,840,(154)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $112=$args_i_i45_i_i; //@line 1064 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$44$0=8;
 var $$etemp$44$1=0;

 var $113=(($args_i_i45_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($113)>>2)]=1; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $114=(($args_i_i45_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($114)>>2)]=3840; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 __embind_register_class_constructor(4352,1,$114,1032,(82),(148)); //@line 1074 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$45$0=8;
 var $$etemp$45$1=0;

 __embind_register_class(4312,3776,4000,4400,1176,(42),1072,(156),952,(32),232,808,(224)); //@line 1022 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $115=$args_i_i26_i_i; //@line 1064 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$46$0=8;
 var $$etemp$46$1=0;

 var $116=(($args_i_i26_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($116)>>2)]=1; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $117=(($args_i_i26_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($117)>>2)]=3776; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 __embind_register_class_constructor(4312,1,$117,960,(164),(150)); //@line 1074 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$47$0=8;
 var $$etemp$47$1=0;

 var $118=(($args_i53_i_i)|0); //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($118)>>2)]=2; //@line 156 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $119=(($args_i53_i_i+4)|0); //@line 157 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($119)>>2)]=3720; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $120=(($args_i53_i_i+8)|0); //@line 146 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 HEAP32[(($120)>>2)]=3776; //@line 145 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/wire.h"
 var $121=_malloc(8); //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $122=($121|0)==0; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 if($122){label=30;break;}else{label=26;break;} //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 26: 
 var $124=$121; //@line 504 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$48=(222);
 var $st$49$0=(($124)|0);
 HEAP32[(($st$49$0)>>2)]=$$etemp$48;
 var $st$50$1=(($124+4)|0);
 HEAP32[(($st$50$1)>>2)]=0;
 label=30;break; //@line 505 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 27: 
 var $126$0 = ___cxa_find_matching_catch(-1, -1); var $126$1 = tempRet0;
 (function() { try { __THREW__ = 0; return __embind_finalize_value_object(4304) } catch(e) { if (typeof e != "number") throw e; if (ABORT) throw e; __THREW__ = 1; return null } })();if (!__THREW__) { label=29;break; } else { label=28;break; } //@line 730 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 28: 
 var $128$0 = ___cxa_find_matching_catch(-1, -1,0); var $128$1 = tempRet0;
 __ZSt9terminatev(); //@line 731 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 throw "Reached an unreachable!"; //@line 731 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 case 29: 
 ___resumeException($126$0) //@line 30 "src/embind.cpp"
 case 30: 
 __embind_register_class_function(4312,304,2,$119,720,(128),$121); //@line 1126 "/home/jeremy/thirdrepos/emscripten/system/include/emscripten/bind.h"
 var $$etemp$51$0=12;
 var $$etemp$51$1=0;

 var $$etemp$52$0=12;
 var $$etemp$52$1=0;

 var $$etemp$53$0=12;
 var $$etemp$53$1=0;

 var $$etemp$54$0=16;
 var $$etemp$54$1=0;

 var $$etemp$55$0=16;
 var $$etemp$55$1=0;

 var $$etemp$56$0=16;
 var $$etemp$56$1=0;

 var $$etemp$57$0=16;
 var $$etemp$57$1=0;

 var $$etemp$58$0=16;
 var $$etemp$58$1=0;

 var $$etemp$59$0=16;
 var $$etemp$59$1=0;

 var $$etemp$60$0=16;
 var $$etemp$60$1=0;

 var $$etemp$61$0=1;
 var $$etemp$61$1=0;

 STACKTOP=sp;return; //@line 589 "src/embind.cpp"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube9Modulator5resetEv($this){
 var label=0;


 var $1=(($this+24)|0); //@line 15 "src/fskube.h"
 HEAPF64[(($1)>>3)]=0; //@line 15 "src/fskube.h"
 return; //@line 16 "src/fskube.h"
}


function __ZN6fskube9Modulator7receiveEb($this,$bit){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this+16)|0); //@line 19 "src/fskube.h"
 var $2=(($this+20)|0); //@line 19 "src/fskube.h"
 var $_in=($bit?$1:$2); //@line 19 "src/fskube.h"
 var $3=HEAP32[(($_in)>>2)]; //@line 19 "src/fskube.h"
 var $4=(($this+8)|0); //@line 17 "src/fskube.h"
 var $5=(($this+12)|0); //@line 17 "src/fskube.h"
 var $6=($3>>>0); //@line 22 "src/fskube.h"
 var $7=(($this+24)|0); //@line 22 "src/fskube.h"
 var $8=(($this+4)|0); //@line 18 "src/receiversender.h"
 var $storemerge=0;label=2;break; //@line 20 "src/fskube.h"
 case 2: 
 var $storemerge;
 var $10=HEAP32[(($4)>>2)]; //@line 17 "src/fskube.h"
 var $11=HEAP32[(($5)>>2)]; //@line 17 "src/fskube.h"
 var $12=(((($10>>>0))/(($11>>>0)))&-1); //@line 17 "src/fskube.h"
 var $13=($storemerge>>>0)<($12>>>0); //@line 20 "src/fskube.h"
 if($13){label=3;break;}else{label=6;break;} //@line 20 "src/fskube.h"
 case 3: 
 var $15=HEAP32[(($8)>>2)]; //@line 18 "src/receiversender.h"
 var $16=($15|0)==0; //@line 18 "src/receiversender.h"
 if($16){label=5;break;}else{label=4;break;} //@line 18 "src/receiversender.h"
 case 4: 
 var $18=($10>>>0); //@line 21 "src/fskube.h"
 var $19=($storemerge>>>0); //@line 21 "src/fskube.h"
 var $20=($19)/($18); //@line 21 "src/fskube.h"
 var $21=($20)*(2); //@line 22 "src/fskube.h"
 var $22=($21)*((3.141592653589793)); //@line 22 "src/fskube.h"
 var $23=HEAPF64[(($7)>>3)]; //@line 22 "src/fskube.h"
 var $24=($22)*($6); //@line 22 "src/fskube.h"
 var $25=($24)+($23); //@line 22 "src/fskube.h"
 var $26=Math_sin($25); //@line 23 "src/fskube.h"
 var $27=$15; //@line 19 "src/receiversender.h"
 var $28=HEAP32[(($27)>>2)]; //@line 19 "src/receiversender.h"
 var $29=(($28+8)|0); //@line 19 "src/receiversender.h"
 var $30=HEAP32[(($29)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$30]($15,$26); //@line 19 "src/receiversender.h"
 label=5;break; //@line 20 "src/receiversender.h"
 case 5: 
 var $32=((($storemerge)+(1))|0); //@line 20 "src/fskube.h"
 var $storemerge=$32;label=2;break; //@line 20 "src/fskube.h"
 case 6: 
 var $34=($12>>>0); //@line 26 "src/fskube.h"
 var $35=($10>>>0); //@line 26 "src/fskube.h"
 var $36=($34)/($35); //@line 26 "src/fskube.h"
 var $37=($36)*(2); //@line 27 "src/fskube.h"
 var $38=($37)*((3.141592653589793)); //@line 27 "src/fskube.h"
 var $39=($38)*($6); //@line 27 "src/fskube.h"
 var $40=HEAPF64[(($7)>>3)]; //@line 27 "src/fskube.h"
 var $41=($39)+($40); //@line 27 "src/fskube.h"
 var $42=$41>(6.283185307179586); //@line 28 "src/fskube.h"
 if($42){label=7;break;}else{var $storemerge1=$41;label=8;break;} //@line 28 "src/fskube.h"
 case 7: 
 var $44=($41)+((-6.283185307179586)); //@line 29 "src/fskube.h"
 var $storemerge1=$44;label=8;break; //@line 30 "src/fskube.h"
 case 8: 
 var $storemerge1;
 HEAPF64[(($7)>>3)]=$storemerge1; //@line 27 "src/fskube.h"
 return; //@line 31 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube11Demodulator5flushEv($this){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+48)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=sp;
 var $2=(sp)+(24);
 var $3=(($this+104)|0); //@line 50 "src/fskube.h"
 var $4=HEAP32[(($3)>>2)]; //@line 50 "src/fskube.h"
 var $5=($4|0)==0; //@line 50 "src/fskube.h"
 if($5){label=4;break;}else{label=2;break;} //@line 50 "src/fskube.h"
 case 2: 
 var $7=(($this+4)|0); //@line 18 "src/receiversender.h"
 var $8=HEAP32[(($7)>>2)]; //@line 18 "src/receiversender.h"
 var $9=($8|0)==0; //@line 18 "src/receiversender.h"
 if($9){label=4;break;}else{label=3;break;} //@line 18 "src/receiversender.h"
 case 3: 
 var $11=(($this+16)|0); //@line 26 "src/fskube.h"
 var $12=HEAP32[(($11)>>2)]; //@line 26 "src/fskube.h"
 var $13=($12|0)==($4|0); //@line 26 "src/fskube.h"
 var $14=$8; //@line 19 "src/receiversender.h"
 var $15=HEAP32[(($14)>>2)]; //@line 19 "src/receiversender.h"
 var $16=(($15+8)|0); //@line 19 "src/receiversender.h"
 var $17=HEAP32[(($16)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$17]($8,$13); //@line 19 "src/receiversender.h"
 label=4;break; //@line 20 "src/receiversender.h"
 case 4: 
 var $18=$1; //@line 38 "src/fskube.h"
 var $$etemp$0$0=24;
 var $$etemp$0$1=0;

 var $19=$2; //@line 38 "src/fskube.h"
 var $$etemp$1$0=24;
 var $$etemp$1$1=0;

 var $20=(($this+40)|0); //@line 39 "src/fskube.h"
 var $$etemp$2$0=0;
 var $$etemp$2$1=0;
 var $st$3$0=(($20)|0);
 HEAP32[(($st$3$0)>>2)]=$$etemp$2$0;
 var $st$4$1=(($20+4)|0);
 HEAP32[(($st$4$1)>>2)]=$$etemp$2$1;
 var $21=(($this+48)|0); //@line 40 "src/fskube.h"
 HEAP32[(($18)>>2)]=0; HEAP32[((($18)+(4))>>2)]=0; HEAP32[((($18)+(8))>>2)]=0; HEAP32[((($18)+(12))>>2)]=0; HEAP32[((($18)+(16))>>2)]=0; HEAP32[((($18)+(20))>>2)]=0; //@line 40 "src/fskube.h"
 var $22=$21; //@line 40 "src/fskube.h"
 assert(24 % 1 === 0);HEAP32[(($22)>>2)]=HEAP32[(($18)>>2)];HEAP32[((($22)+(4))>>2)]=HEAP32[((($18)+(4))>>2)];HEAP32[((($22)+(8))>>2)]=HEAP32[((($18)+(8))>>2)];HEAP32[((($22)+(12))>>2)]=HEAP32[((($18)+(12))>>2)];HEAP32[((($22)+(16))>>2)]=HEAP32[((($18)+(16))>>2)];HEAP32[((($22)+(20))>>2)]=HEAP32[((($18)+(20))>>2)]; //@line 40 "src/fskube.h"
 var $23=(($this+72)|0); //@line 41 "src/fskube.h"
 HEAP32[(($23)>>2)]=0; //@line 41 "src/fskube.h"
 var $24=(($this+80)|0); //@line 42 "src/fskube.h"
 HEAP32[(($19)>>2)]=0; HEAP32[((($19)+(4))>>2)]=0; HEAP32[((($19)+(8))>>2)]=0; HEAP32[((($19)+(12))>>2)]=0; HEAP32[((($19)+(16))>>2)]=0; HEAP32[((($19)+(20))>>2)]=0; //@line 42 "src/fskube.h"
 var $25=$24; //@line 42 "src/fskube.h"
 assert(24 % 1 === 0);HEAP32[(($25)>>2)]=HEAP32[(($19)>>2)];HEAP32[((($25)+(4))>>2)]=HEAP32[((($19)+(4))>>2)];HEAP32[((($25)+(8))>>2)]=HEAP32[((($19)+(8))>>2)];HEAP32[((($25)+(12))>>2)]=HEAP32[((($19)+(12))>>2)];HEAP32[((($25)+(16))>>2)]=HEAP32[((($19)+(16))>>2)];HEAP32[((($25)+(20))>>2)]=HEAP32[((($19)+(20))>>2)]; //@line 42 "src/fskube.h"
 HEAP32[(($3)>>2)]=0; //@line 44 "src/fskube.h"
 var $26=(($this+108)|0); //@line 45 "src/fskube.h"
 HEAP32[(($26)>>2)]=0; //@line 45 "src/fskube.h"
 var $$etemp$5$0=24;
 var $$etemp$5$1=0;

 var $$etemp$6$0=24;
 var $$etemp$6$1=0;

 STACKTOP=sp;return; //@line 54 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube11Demodulator7receiveEd($this,$value){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+72)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=sp;
 var $2=(sp)+(24);
 var $_sroa_35=(sp)+(48);
 var $sample_sroa_3=(sp)+(56);
 var $crossingSample_sroa_3=(sp)+(64);
 var $3=(($this+40)|0); //@line 62 "src/fskube.h"
 var $ld$0$0=(($3)|0);
 var $4$0=HEAP32[(($ld$0$0)>>2)];
 var $ld$1$1=(($3+4)|0);
 var $4$1=HEAP32[(($ld$1$1)>>2)];
 var $$etemp$2$0=1;
 var $$etemp$2$1=0;
 var $5$0=_i64Add($4$0,$4$1,$$etemp$2$0,$$etemp$2$1);var $5$1=tempRet0; //@line 62 "src/fskube.h"
 var $st$3$0=(($3)|0);
 HEAP32[(($st$3$0)>>2)]=$5$0;
 var $st$4$1=(($3+4)|0);
 HEAP32[(($st$4$1)>>2)]=$5$1;
 var $6=(($this+24)|0); //@line 70 "src/fskube.h"
 var $7=HEAPF64[(($6)>>3)]; //@line 70 "src/fskube.h"
 var $8=$7>$value; //@line 70 "src/fskube.h"
 if($8){label=2;break;}else{label=10;break;} //@line 72 "src/fskube.h"
 case 2: 
 var $10=(($this+32)|0); //@line 71 "src/fskube.h"
 var $11=HEAPF64[(($10)>>3)]; //@line 71 "src/fskube.h"
 var $12=$11<$value; //@line 71 "src/fskube.h"
 if($12){label=3;break;}else{label=10;break;} //@line 72 "src/fskube.h"
 case 3: 
 var $14=(($this+72)|0); //@line 73 "src/fskube.h"
 var $15=HEAP32[(($14)>>2)]; //@line 73 "src/fskube.h"
 var $16=((($15)+(1))|0); //@line 73 "src/fskube.h"
 HEAP32[(($14)>>2)]=$16; //@line 73 "src/fskube.h"
 var $17=(($this+8)|0); //@line 17 "src/fskube.h"
 var $18=HEAP32[(($17)>>2)]; //@line 17 "src/fskube.h"
 var $19=(($this+12)|0); //@line 17 "src/fskube.h"
 var $20=HEAP32[(($19)>>2)]; //@line 17 "src/fskube.h"
 var $21=(((($18>>>0))/(($20>>>0)))&-1); //@line 17 "src/fskube.h"
 var $22=($16>>>0)>($21>>>0); //@line 74 "src/fskube.h"
 if($22){label=4;break;}else{label=8;break;} //@line 74 "src/fskube.h"
 case 4: 
 var $24=(($this+104)|0); //@line 50 "src/fskube.h"
 var $25=HEAP32[(($24)>>2)]; //@line 50 "src/fskube.h"
 var $26=($25|0)==0; //@line 50 "src/fskube.h"
 if($26){label=7;break;}else{label=5;break;} //@line 50 "src/fskube.h"
 case 5: 
 var $28=(($this+4)|0); //@line 18 "src/receiversender.h"
 var $29=HEAP32[(($28)>>2)]; //@line 18 "src/receiversender.h"
 var $30=($29|0)==0; //@line 18 "src/receiversender.h"
 if($30){label=7;break;}else{label=6;break;} //@line 18 "src/receiversender.h"
 case 6: 
 var $32=(($this+16)|0); //@line 26 "src/fskube.h"
 var $33=HEAP32[(($32)>>2)]; //@line 26 "src/fskube.h"
 var $34=($33|0)==($25|0); //@line 26 "src/fskube.h"
 var $35=$29; //@line 19 "src/receiversender.h"
 var $36=HEAP32[(($35)>>2)]; //@line 19 "src/receiversender.h"
 var $37=(($36+8)|0); //@line 19 "src/receiversender.h"
 var $38=HEAP32[(($37)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$38]($29,$34); //@line 19 "src/receiversender.h"
 label=7;break; //@line 20 "src/receiversender.h"
 case 7: 
 var $39=$1; //@line 38 "src/fskube.h"
 var $$etemp$5$0=24;
 var $$etemp$5$1=0;

 var $40=$2; //@line 38 "src/fskube.h"
 var $$etemp$6$0=24;
 var $$etemp$6$1=0;

 var $$etemp$7$0=0;
 var $$etemp$7$1=0;
 var $st$8$0=(($3)|0);
 HEAP32[(($st$8$0)>>2)]=$$etemp$7$0;
 var $st$9$1=(($3+4)|0);
 HEAP32[(($st$9$1)>>2)]=$$etemp$7$1;
 var $41=(($this+48)|0); //@line 40 "src/fskube.h"
 HEAP32[(($39)>>2)]=0; HEAP32[((($39)+(4))>>2)]=0; HEAP32[((($39)+(8))>>2)]=0; HEAP32[((($39)+(12))>>2)]=0; HEAP32[((($39)+(16))>>2)]=0; HEAP32[((($39)+(20))>>2)]=0; //@line 40 "src/fskube.h"
 var $42=$41; //@line 40 "src/fskube.h"
 assert(24 % 1 === 0);HEAP32[(($42)>>2)]=HEAP32[(($39)>>2)];HEAP32[((($42)+(4))>>2)]=HEAP32[((($39)+(4))>>2)];HEAP32[((($42)+(8))>>2)]=HEAP32[((($39)+(8))>>2)];HEAP32[((($42)+(12))>>2)]=HEAP32[((($39)+(12))>>2)];HEAP32[((($42)+(16))>>2)]=HEAP32[((($39)+(16))>>2)];HEAP32[((($42)+(20))>>2)]=HEAP32[((($39)+(20))>>2)]; //@line 40 "src/fskube.h"
 HEAP32[(($14)>>2)]=0; //@line 41 "src/fskube.h"
 var $43=(($this+80)|0); //@line 42 "src/fskube.h"
 HEAP32[(($40)>>2)]=0; HEAP32[((($40)+(4))>>2)]=0; HEAP32[((($40)+(8))>>2)]=0; HEAP32[((($40)+(12))>>2)]=0; HEAP32[((($40)+(16))>>2)]=0; HEAP32[((($40)+(20))>>2)]=0; //@line 42 "src/fskube.h"
 var $44=$43; //@line 42 "src/fskube.h"
 assert(24 % 1 === 0);HEAP32[(($44)>>2)]=HEAP32[(($40)>>2)];HEAP32[((($44)+(4))>>2)]=HEAP32[((($40)+(4))>>2)];HEAP32[((($44)+(8))>>2)]=HEAP32[((($40)+(8))>>2)];HEAP32[((($44)+(12))>>2)]=HEAP32[((($40)+(12))>>2)];HEAP32[((($44)+(16))>>2)]=HEAP32[((($40)+(16))>>2)];HEAP32[((($44)+(20))>>2)]=HEAP32[((($40)+(20))>>2)]; //@line 42 "src/fskube.h"
 HEAP32[(($24)>>2)]=0; //@line 44 "src/fskube.h"
 var $45=(($this+108)|0); //@line 45 "src/fskube.h"
 HEAP32[(($45)>>2)]=0; //@line 45 "src/fskube.h"
 var $$etemp$10$0=24;
 var $$etemp$10$1=0;

 var $$etemp$11$0=24;
 var $$etemp$11$1=0;

 label=8;break; //@line 78 "src/fskube.h"
 case 8: 
 var $47=(($this+96)|0); //@line 85 "src/fskube.h"
 var $48=HEAP8[(($47)>>0)]; //@line 85 "src/fskube.h"
 var $49=$48&1; //@line 85 "src/fskube.h"
 var $50=(($49<<24)>>24)==0; //@line 85 "src/fskube.h"
 if($50){label=9;break;}else{label=18;break;} //@line 85 "src/fskube.h"
 case 9: 
 var $52=(($this+48)|0); //@line 86 "src/fskube.h"
 var $st$12$0=(($52)|0);
 HEAP32[(($st$12$0)>>2)]=$5$0;
 var $st$13$1=(($52+4)|0);
 HEAP32[(($st$13$1)>>2)]=$5$1;
 var $53=(($this+56)|0); //@line 86 "src/fskube.h"
 HEAPF64[(($53)>>3)]=$value; //@line 86 "src/fskube.h"
 var $54=(($this+64)|0); //@line 86 "src/fskube.h"
 HEAP8[(($54)>>0)]=1; //@line 86 "src/fskube.h"
 var $55=$this; //@line 86 "src/fskube.h"
 var $56=(($55+65)|0); //@line 86 "src/fskube.h"
 var $57=(($sample_sroa_3)|0); //@line 86 "src/fskube.h"
 assert(7 % 1 === 0);HEAP8[(($56)>>0)]=HEAP8[(($57)>>0)];HEAP8[((($56)+(1))>>0)]=HEAP8[((($57)+(1))>>0)];HEAP8[((($56)+(2))>>0)]=HEAP8[((($57)+(2))>>0)];HEAP8[((($56)+(3))>>0)]=HEAP8[((($57)+(3))>>0)];HEAP8[((($56)+(4))>>0)]=HEAP8[((($57)+(4))>>0)];HEAP8[((($56)+(5))>>0)]=HEAP8[((($57)+(5))>>0)];HEAP8[((($56)+(6))>>0)]=HEAP8[((($57)+(6))>>0)]; //@line 86 "src/fskube.h"
 label=18;break; //@line 87 "src/fskube.h"
 case 10: 
 var $59=(($this+72)|0); //@line 91 "src/fskube.h"
 HEAP32[(($59)>>2)]=0; //@line 91 "src/fskube.h"
 var $60=(($this+96)|0); //@line 92 "src/fskube.h"
 var $61=HEAP8[(($60)>>0)]; //@line 92 "src/fskube.h"
 var $62=$61&1; //@line 92 "src/fskube.h"
 var $63=(($62<<24)>>24)==0; //@line 92 "src/fskube.h"
 var $_pre=(($this+80)|0); //@line 119 "src/fskube.h"
 var $_pre6=(($this+88)|0); //@line 119 "src/fskube.h"
 if($63){var $_pre_phi=$_pre;var $_pre_phi7=$_pre6;label=17;break;}else{label=11;break;} //@line 92 "src/fskube.h"
 case 11: 
 var $65=HEAPF64[(($_pre6)>>3)]; //@line 95 "src/fskube.h"
 var $66=$65>0; //@line undefined "src/fskube.cpp"
 var $67=($66&1); //@line undefined "src/fskube.cpp"
 var $68=$65<0; //@line undefined "src/fskube.cpp"
 var $69=($68&1); //@line undefined "src/fskube.cpp"
 var $70=((($67)-($69))|0); //@line undefined "src/fskube.cpp"
 var $71=$value>0; //@line undefined "src/fskube.cpp"
 var $72=($71&1); //@line undefined "src/fskube.cpp"
 var $73=$value<0; //@line undefined "src/fskube.cpp"
 var $74=($73&1); //@line undefined "src/fskube.cpp"
 var $75=((($72)-($74))|0); //@line undefined "src/fskube.cpp"
 var $76=($70|0)==($75|0); //@line 96 "src/fskube.h"
 if($76){var $_pre_phi=$_pre;var $_pre_phi7=$_pre6;label=17;break;}else{label=12;break;} //@line 96 "src/fskube.h"
 case 12: 
 var $ld$14$0=(($_pre)|0);
 var $78$0=HEAP32[(($ld$14$0)>>2)];
 var $ld$15$1=(($_pre+4)|0);
 var $78$1=HEAP32[(($ld$15$1)>>2)];
 var $79=(($78$0>>>0)+(($78$1>>>0)*4294967296)); //@line 110 "src/fskube.h"
 var $80=($79)*($value); //@line 110 "src/fskube.h"
 var $81=(($5$0>>>0)+(($5$1>>>0)*4294967296)); //@line 110 "src/fskube.h"
 var $82=($65)*($81); //@line 110 "src/fskube.h"
 var $83=($80)-($82); //@line 110 "src/fskube.h"
 var $84=($value)-($65); //@line 110 "src/fskube.h"
 var $85=($83)/($84); //@line 110 "src/fskube.h"
 var $86$0=$85>>>0;var $86$1=(Math_abs($85) >= 1 ? ($85 > 0 ? Math_min(Math_floor(($85)/4294967296), 4294967295)>>>0 : (~~(Math_ceil(($85 - +(((~~($85)))>>>0))/4294967296)))>>>0) : 0); //@line 110 "src/fskube.h"
 var $87=(($crossingSample_sroa_3)|0); //@line 116 "src/fskube.h"
 var $_sroa_3510=(($_sroa_35)|0);
 assert(7 % 1 === 0);HEAP8[(($_sroa_3510)>>0)]=HEAP8[(($87)>>0)];HEAP8[((($_sroa_3510)+(1))>>0)]=HEAP8[((($87)+(1))>>0)];HEAP8[((($_sroa_3510)+(2))>>0)]=HEAP8[((($87)+(2))>>0)];HEAP8[((($_sroa_3510)+(3))>>0)]=HEAP8[((($87)+(3))>>0)];HEAP8[((($_sroa_3510)+(4))>>0)]=HEAP8[((($87)+(4))>>0)];HEAP8[((($_sroa_3510)+(5))>>0)]=HEAP8[((($87)+(5))>>0)];HEAP8[((($_sroa_3510)+(6))>>0)]=HEAP8[((($87)+(6))>>0)]; //@line 116 "src/fskube.h"
 var $88=(($_sroa_35)|0); //@line 116 "src/fskube.h"
 var $89=(($this+64)|0); //@line 132 "src/fskube.h"
 var $90=HEAP8[(($89)>>0)]; //@line 132 "src/fskube.h"
 var $91=$90&1; //@line 132 "src/fskube.h"
 var $92=(($91<<24)>>24)==0; //@line 132 "src/fskube.h"
 var $_pre8=(($this+48)|0); //@line 151 "src/fskube.h"
 if($92){var $_pre_phi9=$_pre8;label=16;break;}else{label=13;break;} //@line 132 "src/fskube.h"
 case 13: 
 var $ld$16$0=(($_pre8)|0);
 var $94$0=HEAP32[(($ld$16$0)>>2)];
 var $ld$17$1=(($_pre8+4)|0);
 var $94$1=HEAP32[(($ld$17$1)>>2)];
 var $95$0=_i64Subtract($86$0,$86$1,$94$0,$94$1);var $95$1=tempRet0; //@line 133 "src/fskube.h"
 var $96$0=$95$0;
 var $96=$96$0;
 var $97=($96>>>0); //@line 23 "src/fskube.h"
 var $98=(($this+8)|0); //@line 23 "src/fskube.h"
 var $99=HEAP32[(($98)>>2)]; //@line 23 "src/fskube.h"
 var $100=($99>>>0); //@line 23 "src/fskube.h"
 var $101=($97)/($100); //@line 23 "src/fskube.h"
 var $102=(($this+16)|0); //@line 136 "src/fskube.h"
 var $103=HEAP32[(($102)>>2)]; //@line 136 "src/fskube.h"
 var $104=($103>>>0); //@line 136 "src/fskube.h"
 var $105=((0.5))/($104); //@line 136 "src/fskube.h"
 var $106=(($this+20)|0); //@line 137 "src/fskube.h"
 var $107=HEAP32[(($106)>>2)]; //@line 137 "src/fskube.h"
 var $108=($107>>>0); //@line 137 "src/fskube.h"
 var $109=((0.5))/($108); //@line 137 "src/fskube.h"
 var $110=($101)/($105); //@line 138 "src/fskube.h"
 var $111=($101)/($109); //@line 139 "src/fskube.h"
 var $112=($110)-(1); //@line 140 "src/fskube.h"
 var $113=Math_abs($112); //@line 664 "/home/jeremy/thirdrepos/emscripten/system/include/libcxx/cmath"
 var $114=($111)-(1); //@line 141 "src/fskube.h"
 var $115=Math_abs($114); //@line 664 "/home/jeremy/thirdrepos/emscripten/system/include/libcxx/cmath"
 var $116=$113<$115; //@line 145 "src/fskube.h"
 if($116){label=14;break;}else{label=15;break;} //@line 145 "src/fskube.h"
 case 14: 
 __ZN6fskube11Demodulator20addFrequencyHalfSeenEj($this,$103); //@line 146 "src/fskube.h"
 var $_pre_phi9=$_pre8;label=16;break; //@line 147 "src/fskube.h"
 case 15: 
 __ZN6fskube11Demodulator20addFrequencyHalfSeenEj($this,$107); //@line 148 "src/fskube.h"
 var $_pre_phi9=$_pre8;label=16;break;
 case 16: 
 var $_pre_phi9; //@line 151 "src/fskube.h"
 var $st$18$0=(($_pre_phi9)|0);
 HEAP32[(($st$18$0)>>2)]=$86$0;
 var $st$19$1=(($_pre_phi9+4)|0);
 HEAP32[(($st$19$1)>>2)]=$86$1;
 var $119=(($this+56)|0); //@line 151 "src/fskube.h"
 HEAPF64[(($119)>>3)]=0; //@line 151 "src/fskube.h"
 HEAP8[(($89)>>0)]=1; //@line 151 "src/fskube.h"
 var $120=$this; //@line 151 "src/fskube.h"
 var $121=(($120+65)|0); //@line 151 "src/fskube.h"
 assert(7 % 1 === 0);HEAP8[(($121)>>0)]=HEAP8[(($88)>>0)];HEAP8[((($121)+(1))>>0)]=HEAP8[((($88)+(1))>>0)];HEAP8[((($121)+(2))>>0)]=HEAP8[((($88)+(2))>>0)];HEAP8[((($121)+(3))>>0)]=HEAP8[((($88)+(3))>>0)];HEAP8[((($121)+(4))>>0)]=HEAP8[((($88)+(4))>>0)];HEAP8[((($121)+(5))>>0)]=HEAP8[((($88)+(5))>>0)];HEAP8[((($121)+(6))>>0)]=HEAP8[((($88)+(6))>>0)]; //@line 151 "src/fskube.h"
 var $_pre_phi=$_pre;var $_pre_phi7=$_pre6;label=17;break; //@line 117 "src/fskube.h"
 case 17: 
 var $_pre_phi7; //@line 119 "src/fskube.h"
 var $_pre_phi; //@line 119 "src/fskube.h"
 var $st$20$0=(($_pre_phi)|0);
 HEAP32[(($st$20$0)>>2)]=$5$0;
 var $st$21$1=(($_pre_phi+4)|0);
 HEAP32[(($st$21$1)>>2)]=$5$1;
 HEAPF64[(($_pre_phi7)>>3)]=$value; //@line 119 "src/fskube.h"
 HEAP8[(($60)>>0)]=1; //@line 119 "src/fskube.h"
 var $122=$this; //@line 119 "src/fskube.h"
 var $123=(($122+97)|0); //@line 119 "src/fskube.h"
 var $124=(($sample_sroa_3)|0); //@line 119 "src/fskube.h"
 assert(7 % 1 === 0);HEAP8[(($123)>>0)]=HEAP8[(($124)>>0)];HEAP8[((($123)+(1))>>0)]=HEAP8[((($124)+(1))>>0)];HEAP8[((($123)+(2))>>0)]=HEAP8[((($124)+(2))>>0)];HEAP8[((($123)+(3))>>0)]=HEAP8[((($124)+(3))>>0)];HEAP8[((($123)+(4))>>0)]=HEAP8[((($124)+(4))>>0)];HEAP8[((($123)+(5))>>0)]=HEAP8[((($124)+(5))>>0)];HEAP8[((($123)+(6))>>0)]=HEAP8[((($124)+(6))>>0)]; //@line 119 "src/fskube.h"
 label=18;break; //@line 119 "src/fskube.h"
 case 18: 
 STACKTOP=sp;return; //@line 119 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube11Demodulator20addFrequencyHalfSeenEj($this,$frequency){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this+104)|0); //@line 157 "src/fskube.h"
 var $2=HEAP32[(($1)>>2)]; //@line 157 "src/fskube.h"
 var $3=($2|0)==0; //@line 157 "src/fskube.h"
 if($3){label=2;break;}else{var $6=$2;label=3;break;} //@line 157 "src/fskube.h"
 case 2: 
 HEAP32[(($1)>>2)]=$frequency; //@line 158 "src/fskube.h"
 var $4=(($this+108)|0); //@line 159 "src/fskube.h"
 HEAP32[(($4)>>2)]=0; //@line 159 "src/fskube.h"
 var $9=$frequency;label=4;break; //@line 166 "src/fskube.h"
 case 3: 
 var $6;
 var $7=($6|0)==($frequency|0); //@line 166 "src/fskube.h"
 if($7){var $9=$6;label=4;break;}else{label=8;break;} //@line 166 "src/fskube.h"
 case 4: 
 var $9;
 var $10=(($this+12)|0); //@line 20 "src/fskube.h"
 var $11=HEAP32[(($10)>>2)]; //@line 20 "src/fskube.h"
 var $12=($11>>>0); //@line 20 "src/fskube.h"
 var $13=(1)/($12); //@line 20 "src/fskube.h"
 var $14=($9>>>0); //@line 163 "src/fskube.h"
 var $15=($13)*($14); //@line 164 "src/fskube.h"
 var $16=($15)*(2); //@line 165 "src/fskube.h"
 var $17=_rint($16); //@line 165 "src/fskube.h"
 var $18=($17>=0 ? Math_floor($17) : Math_ceil($17)); //@line 165 "src/fskube.h"
 var $19=(($this+108)|0); //@line 167 "src/fskube.h"
 var $20=HEAP32[(($19)>>2)]; //@line 167 "src/fskube.h"
 var $21=((($20)+(1))|0); //@line 167 "src/fskube.h"
 HEAP32[(($19)>>2)]=$21; //@line 167 "src/fskube.h"
 var $22=($21>>>0)<($18>>>0); //@line 168 "src/fskube.h"
 if($22){label=13;break;}else{label=5;break;} //@line 168 "src/fskube.h"
 case 5: 
 var $24=(($this+4)|0); //@line 18 "src/receiversender.h"
 var $25=HEAP32[(($24)>>2)]; //@line 18 "src/receiversender.h"
 var $26=($25|0)==0; //@line 18 "src/receiversender.h"
 if($26){label=7;break;}else{label=6;break;} //@line 18 "src/receiversender.h"
 case 6: 
 var $28=(($this+16)|0); //@line 26 "src/fskube.h"
 var $29=HEAP32[(($28)>>2)]; //@line 26 "src/fskube.h"
 var $30=($29|0)==($frequency|0); //@line 26 "src/fskube.h"
 var $31=$25; //@line 19 "src/receiversender.h"
 var $32=HEAP32[(($31)>>2)]; //@line 19 "src/receiversender.h"
 var $33=(($32+8)|0); //@line 19 "src/receiversender.h"
 var $34=HEAP32[(($33)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$34]($25,$30); //@line 19 "src/receiversender.h"
 label=7;break; //@line 20 "src/receiversender.h"
 case 7: 
 HEAP32[(($19)>>2)]=0; //@line 171 "src/fskube.h"
 label=13;break; //@line 172 "src/fskube.h"
 case 8: 
 var $36=(($this+108)|0); //@line 175 "src/fskube.h"
 var $37=HEAP32[(($36)>>2)]; //@line 175 "src/fskube.h"
 var $38=($37|0)==0; //@line 175 "src/fskube.h"
 if($38){label=9;break;}else{label=10;break;} //@line 175 "src/fskube.h"
 case 9: 
 HEAP32[(($1)>>2)]=$frequency; //@line 176 "src/fskube.h"
 HEAP32[(($36)>>2)]=1; //@line 177 "src/fskube.h"
 label=13;break; //@line 179 "src/fskube.h"
 case 10: 
 var $41=(($this+4)|0); //@line 18 "src/receiversender.h"
 var $42=HEAP32[(($41)>>2)]; //@line 18 "src/receiversender.h"
 var $43=($42|0)==0; //@line 18 "src/receiversender.h"
 if($43){label=12;break;}else{label=11;break;} //@line 18 "src/receiversender.h"
 case 11: 
 var $45=(($this+16)|0); //@line 26 "src/fskube.h"
 var $46=HEAP32[(($45)>>2)]; //@line 26 "src/fskube.h"
 var $47=($46|0)==($6|0); //@line 26 "src/fskube.h"
 var $48=$42; //@line 19 "src/receiversender.h"
 var $49=HEAP32[(($48)>>2)]; //@line 19 "src/receiversender.h"
 var $50=(($49+8)|0); //@line 19 "src/receiversender.h"
 var $51=HEAP32[(($50)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$51]($42,$47); //@line 19 "src/receiversender.h"
 label=12;break; //@line 20 "src/receiversender.h"
 case 12: 
 HEAP32[(($1)>>2)]=$frequency; //@line 187 "src/fskube.h"
 HEAP32[(($36)>>2)]=0; //@line 188 "src/fskube.h"
 label=13;break; //@line 189 "src/fskube.h"
 case 13: 
 return; //@line 196 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube7Rs232or7receiveEi($this,$data){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($data|0)<0; //@line 201 "src/fskube.h"
 var $2=(($this+4)|0); //@line 18 "src/receiversender.h"
 if($1){var $storemerge1=0;label=2;break;}else{label=6;break;} //@line 201 "src/fskube.h"
 case 2: 
 var $storemerge1;
 var $3=($storemerge1|0)<24; //@line 203 "src/fskube.h"
 if($3){label=3;break;}else{label=14;break;} //@line 203 "src/fskube.h"
 case 3: 
 var $5=HEAP32[(($2)>>2)]; //@line 18 "src/receiversender.h"
 var $6=($5|0)==0; //@line 18 "src/receiversender.h"
 if($6){label=5;break;}else{label=4;break;} //@line 18 "src/receiversender.h"
 case 4: 
 var $8=$5; //@line 19 "src/receiversender.h"
 var $9=HEAP32[(($8)>>2)]; //@line 19 "src/receiversender.h"
 var $10=(($9+8)|0); //@line 19 "src/receiversender.h"
 var $11=HEAP32[(($10)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$11]($5,0); //@line 19 "src/receiversender.h"
 label=5;break; //@line 20 "src/receiversender.h"
 case 5: 
 var $13=((($storemerge1)+(1))|0); //@line 203 "src/fskube.h"
 var $storemerge1=$13;label=2;break; //@line 203 "src/fskube.h"
 case 6: 
 var $15=HEAP32[(($2)>>2)]; //@line 18 "src/receiversender.h"
 var $16=($15|0)==0; //@line 18 "src/receiversender.h"
 if($16){var $storemerge=0;label=8;break;}else{label=7;break;} //@line 18 "src/receiversender.h"
 case 7: 
 var $18=$15; //@line 19 "src/receiversender.h"
 var $19=HEAP32[(($18)>>2)]; //@line 19 "src/receiversender.h"
 var $20=(($19+8)|0); //@line 19 "src/receiversender.h"
 var $21=HEAP32[(($20)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$21]($15,1); //@line 19 "src/receiversender.h"
 var $storemerge=0;label=8;break; //@line 20 "src/receiversender.h"
 case 8: 
 var $storemerge;
 var $22=($storemerge|0)<8; //@line 212 "src/fskube.h"
 var $23=HEAP32[(($2)>>2)]; //@line 18 "src/receiversender.h"
 var $24=($23|0)==0; //@line 18 "src/receiversender.h"
 if($22){label=9;break;}else{label=12;break;} //@line 212 "src/fskube.h"
 case 9: 
 if($24){label=11;break;}else{label=10;break;} //@line 18 "src/receiversender.h"
 case 10: 
 var $27=1<<$storemerge; //@line 213 "src/fskube.h"
 var $28=$27&$data; //@line 213 "src/fskube.h"
 var $29=($28|0)!=0; //@line 213 "src/fskube.h"
 var $30=$23; //@line 19 "src/receiversender.h"
 var $31=HEAP32[(($30)>>2)]; //@line 19 "src/receiversender.h"
 var $32=(($31+8)|0); //@line 19 "src/receiversender.h"
 var $33=HEAP32[(($32)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$33]($23,$29); //@line 19 "src/receiversender.h"
 label=11;break; //@line 20 "src/receiversender.h"
 case 11: 
 var $35=((($storemerge)+(1))|0); //@line 212 "src/fskube.h"
 var $storemerge=$35;label=8;break; //@line 212 "src/fskube.h"
 case 12: 
 if($24){label=14;break;}else{label=13;break;} //@line 18 "src/receiversender.h"
 case 13: 
 var $38=$23; //@line 19 "src/receiversender.h"
 var $39=HEAP32[(($38)>>2)]; //@line 19 "src/receiversender.h"
 var $40=(($39+8)|0); //@line 19 "src/receiversender.h"
 var $41=HEAP32[(($40)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$41]($23,0); //@line 19 "src/receiversender.h"
 label=14;break; //@line 20 "src/receiversender.h"
 case 14: 
 return; //@line 218 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube9DeRs232or5resetEv($this){
 var label=0;


 var $1=(($this+8)|0); //@line 227 "src/fskube.h"
 HEAP8[(($1)>>0)]=1; //@line 227 "src/fskube.h"
 var $2=(($this+12)|0); //@line 228 "src/fskube.h"
 HEAP32[(($2)>>2)]=0; //@line 228 "src/fskube.h"
 var $3=(($this+16)|0); //@line 229 "src/fskube.h"
 HEAP8[(($3)>>0)]=0; //@line 229 "src/fskube.h"
 return; //@line 230 "src/fskube.h"
}


function __ZN6fskube9DeRs232or7receiveEb($this,$b){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this+8)|0); //@line 233 "src/fskube.h"
 var $2=HEAP8[(($1)>>0)]; //@line 233 "src/fskube.h"
 var $3=$2&1; //@line 233 "src/fskube.h"
 var $4=(($3<<24)>>24)==0; //@line 233 "src/fskube.h"
 if($4){label=6;break;}else{label=2;break;} //@line 233 "src/fskube.h"
 case 2: 
 if($b){label=3;break;}else{label=4;break;} //@line 234 "src/fskube.h"
 case 3: 
 HEAP8[(($1)>>0)]=0; //@line 235 "src/fskube.h"
 var $7=(($this+20)|0); //@line 236 "src/fskube.h"
 HEAP32[(($7)>>2)]=0; //@line 236 "src/fskube.h"
 label=13;break; //@line 237 "src/fskube.h"
 case 4: 
 var $9=(($this+12)|0); //@line 238 "src/fskube.h"
 var $10=HEAP32[(($9)>>2)]; //@line 238 "src/fskube.h"
 var $11=((($10)+(1))|0); //@line 238 "src/fskube.h"
 HEAP32[(($9)>>2)]=$11; //@line 238 "src/fskube.h"
 var $12=(($this+4)|0); //@line 18 "src/receiversender.h"
 var $13=HEAP32[(($12)>>2)]; //@line 18 "src/receiversender.h"
 var $14=($13|0)==0; //@line 18 "src/receiversender.h"
 if($14){label=13;break;}else{label=5;break;} //@line 18 "src/receiversender.h"
 case 5: 
 var $16=$13; //@line 19 "src/receiversender.h"
 var $17=HEAP32[(($16)>>2)]; //@line 19 "src/receiversender.h"
 var $18=(($17+8)|0); //@line 19 "src/receiversender.h"
 var $19=HEAP32[(($18)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$19]($13,-1); //@line 19 "src/receiversender.h"
 label=13;break; //@line 20 "src/receiversender.h"
 case 6: 
 var $21=(($this+20)|0); //@line 244 "src/fskube.h"
 var $22=HEAP32[(($21)>>2)]; //@line 244 "src/fskube.h"
 var $23=($22|0)==8; //@line 244 "src/fskube.h"
 var $_pre7=(($this+16)|0); //@line 252 "src/fskube.h"
 if($23){label=8;break;}else{label=7;break;} //@line 244 "src/fskube.h"
 case 7: 
 var $_pre3=HEAP8[(($_pre7)>>0)]; //@line 255 "src/fskube.h"
 var $phitmp=($_pre3&255); //@line 244 "src/fskube.h"
 var $39=$22;var $38=$phitmp;label=12;break; //@line 244 "src/fskube.h"
 case 8: 
 if($b){var $_pre=8;var $_pre_phi8=$_pre7;label=11;break;}else{label=9;break;} //@line 247 "src/fskube.h"
 case 9: 
 var $26=(($this+4)|0); //@line 18 "src/receiversender.h"
 var $27=HEAP32[(($26)>>2)]; //@line 18 "src/receiversender.h"
 var $28=($27|0)==0; //@line 18 "src/receiversender.h"
 if($28){var $_pre=8;var $_pre_phi8=$_pre7;label=11;break;}else{label=10;break;} //@line 18 "src/receiversender.h"
 case 10: 
 var $30=HEAP8[(($_pre7)>>0)]; //@line 248 "src/fskube.h"
 var $31=($30&255); //@line 248 "src/fskube.h"
 var $32=$27; //@line 19 "src/receiversender.h"
 var $33=HEAP32[(($32)>>2)]; //@line 19 "src/receiversender.h"
 var $34=(($33+8)|0); //@line 19 "src/receiversender.h"
 var $35=HEAP32[(($34)>>2)]; //@line 19 "src/receiversender.h"
 FUNCTION_TABLE[$35]($27,$31); //@line 19 "src/receiversender.h"
 var $_pre_pre_pre=HEAP32[(($21)>>2)]; //@line 255 "src/fskube.h"
 var $_pre=$_pre_pre_pre;var $_pre_phi8=$_pre7;label=11;break; //@line 20 "src/receiversender.h"
 case 11: 
 var $_pre_phi8; //@line 252 "src/fskube.h"
 var $_pre;
 HEAP8[(($1)>>0)]=1; //@line 250 "src/fskube.h"
 var $36=(($this+12)|0); //@line 251 "src/fskube.h"
 HEAP32[(($36)>>2)]=0; //@line 251 "src/fskube.h"
 HEAP8[(($_pre_phi8)>>0)]=0; //@line 252 "src/fskube.h"
 var $39=$_pre;var $38=0;label=12;break; //@line 253 "src/fskube.h"
 case 12: 
 var $38;
 var $39;
 var $40=($b&1); //@line 255 "src/fskube.h"
 var $41=$40<<$39; //@line 255 "src/fskube.h"
 var $42=(($this+16)|0); //@line 255 "src/fskube.h"
 var $43=$38|$41; //@line 255 "src/fskube.h"
 var $44=(($43)&255); //@line 255 "src/fskube.h"
 HEAP8[(($42)>>0)]=$44; //@line 255 "src/fskube.h"
 var $45=((($39)+(1))|0); //@line 256 "src/fskube.h"
 HEAP32[(($21)>>2)]=$45; //@line 256 "src/fskube.h"
 label=13;break; //@line 256 "src/fskube.h"
 case 13: 
 return; //@line 256 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube9ModulatorD1Ev($this){
 var label=0;


 return; //@line 30 "src/fskube.h"
}


function __ZN6fskube9ModulatorD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this; //@line 30 "src/fskube.h"
 _free($3);
 label=3;break;
 case 3: 
 return; //@line 30 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube11DemodulatorD1Ev($this){
 var label=0;


 return; //@line 46 "src/fskube.h"
}


function __ZN6fskube11DemodulatorD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this; //@line 46 "src/fskube.h"
 _free($3);
 label=3;break;
 case 3: 
 return; //@line 46 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube7Rs232orD1Ev($this){
 var label=0;


 return; //@line 72 "src/fskube.h"
}


function __ZN6fskube7Rs232orD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this; //@line 72 "src/fskube.h"
 _free($3);
 label=3;break;
 case 3: 
 return; //@line 72 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function __ZN6fskube9DeRs232orD1Ev($this){
 var label=0;


 return; //@line 78 "src/fskube.h"
}


function __ZN6fskube9DeRs232orD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this; //@line 78 "src/fskube.h"
 _free($3);
 label=3;break;
 case 3: 
 return; //@line 78 "src/fskube.h"
  default: assert(0, "bad label: " + label);
 }

}


function ___getTypeName($ti){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($ti+4)|0); //@line 86 "/home/jeremy/thirdrepos/emscripten/system/include/libcxx/typeinfo"
 var $2=HEAP32[(($1)>>2)]; //@line 86 "/home/jeremy/thirdrepos/emscripten/system/include/libcxx/typeinfo"
 var $3=_strlen($2);
 var $4=((($3)+(1))|0);
 var $5=_malloc($4);
 var $6=($5|0)==0;
 if($6){var $_0_i=0;label=3;break;}else{label=2;break;}
 case 2: 
 assert($4 % 1 === 0);(_memcpy($5, $2, $4)|0);
 var $_0_i=$5;label=3;break;
 case 3: 
 var $_0_i;
 return $_0_i; //@line 36 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
  default: assert(0, "bad label: " + label);
 }

}
Module["___getTypeName"] = ___getTypeName;

function __GLOBAL__I_a45(){
 var label=0;


 __embind_register_void(3720,208); //@line 63 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_bool(3728,560,1,1,0); //@line 65 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_integer(__ZTIc,248,1,-128,127); //@line 50 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_integer(__ZTIa,160,1,-128,127); //@line 50 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_integer(__ZTIh,128,1,0,255); //@line 50 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_integer(__ZTIs,104,2,-32768,32767); //@line 50 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_integer(__ZTIt,80,2,0,65535); //@line 50 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_integer(__ZTIi,48,4,-2147483648,2147483647); //@line 50 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_integer(__ZTIj,32,4,0,-1); //@line 50 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_integer(__ZTIl,8,4,-2147483648,2147483647); //@line 50 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_integer(__ZTIm,624,4,0,-1); //@line 50 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_float(__ZTIf,600,4); //@line 56 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_float(__ZTId,568,8); //@line 56 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_std_string(4264,512); //@line 80 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_std_string(4240,464); //@line 81 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_std_wstring(4216,4,416); //@line 82 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_emval(4544,376); //@line 83 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 __embind_register_memory_view(4552,328); //@line 84 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
 return; //@line 86 "/home/jeremy/thirdrepos/emscripten/system/lib/embind/bind.cpp"
}


function __ZN10__cxxabiv116__shim_type_infoD2Ev($this){
 var label=0;


 return;
}


function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($this){
 var label=0;


 return;
}


function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($this){
 var label=0;


 return;
}


function __ZN10__cxxabiv123__fundamental_type_infoD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10__cxxabiv117__class_type_infoD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10__cxxabiv120__si_class_type_infoD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZN10__cxxabiv119__pointer_type_infoD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($this|0)==0;
 if($1){label=3;break;}else{label=2;break;}
 case 2: 
 var $3=$this;
 _free($3);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$0){
 var label=0;


 var $2=(($this)|0);
 var $3=(($thrown_type)|0);
 var $4=($2|0)==($3|0);
 return $4;
}


function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$adjustedPtr){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $info=sp;
 var $1=(($this)|0);
 var $2=(($thrown_type)|0);
 var $3=($1|0)==($2|0);
 if($3){var $_1=1;label=6;break;}else{label=2;break;}
 case 2: 
 var $5=($thrown_type|0)==0;
 if($5){var $_1=0;label=6;break;}else{label=3;break;}
 case 3: 
 var $7=$thrown_type;
 var $8=___dynamic_cast($7,4640);
 var $9=$8;
 var $10=($8|0)==0;
 if($10){var $_1=0;label=6;break;}else{label=4;break;}
 case 4: 
 var $12=$info;
 var $$etemp$0$0=56;
 var $$etemp$0$1=0;

 _memset($12, 0, 56)|0;
 var $13=(($info)|0);
 HEAP32[(($13)>>2)]=$9;
 var $14=(($info+8)|0);
 HEAP32[(($14)>>2)]=$this;
 var $15=(($info+12)|0);
 HEAP32[(($15)>>2)]=-1;
 var $16=(($info+48)|0);
 HEAP32[(($16)>>2)]=1;
 var $17=$8;
 var $18=HEAP32[(($17)>>2)];
 var $19=(($18+28)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=HEAP32[(($adjustedPtr)>>2)];
 FUNCTION_TABLE[$20]($9,$info,$21,1);
 var $22=(($info+24)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=($23|0)==1;
 if($24){label=5;break;}else{var $_1=0;label=6;break;}
 case 5: 
 var $26=(($info+16)|0);
 var $27=HEAP32[(($26)>>2)];
 HEAP32[(($adjustedPtr)>>2)]=$27;
 var $_1=1;label=6;break;
 case 6: 
 var $_1;
 STACKTOP=sp;return $_1;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==($this|0);
 if($3){label=2;break;}else{label=8;break;}
 case 2: 
 var $5=(($info+16)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=($6|0)==0;
 if($7){label=3;break;}else{label=4;break;}
 case 3: 
 HEAP32[(($5)>>2)]=$adjustedPtr;
 var $9=(($info+24)|0);
 HEAP32[(($9)>>2)]=$path_below;
 var $10=(($info+36)|0);
 HEAP32[(($10)>>2)]=1;
 label=8;break;
 case 4: 
 var $12=($6|0)==($adjustedPtr|0);
 if($12){label=5;break;}else{label=7;break;}
 case 5: 
 var $14=(($info+24)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=($15|0)==2;
 if($16){label=6;break;}else{label=8;break;}
 case 6: 
 HEAP32[(($14)>>2)]=$path_below;
 label=8;break;
 case 7: 
 var $19=(($info+36)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=((($20)+(1))|0);
 HEAP32[(($19)>>2)]=$21;
 var $22=(($info+24)|0);
 HEAP32[(($22)>>2)]=2;
 var $23=(($info+54)|0);
 HEAP8[(($23)>>0)]=1;
 label=8;break;
 case 8: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=8;break;}
 case 2: 
 var $7=(($info+16)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 HEAP32[(($7)>>2)]=$adjustedPtr;
 var $11=(($info+24)|0);
 HEAP32[(($11)>>2)]=$path_below;
 var $12=(($info+36)|0);
 HEAP32[(($12)>>2)]=1;
 label=9;break;
 case 4: 
 var $14=($8|0)==($adjustedPtr|0);
 if($14){label=5;break;}else{label=7;break;}
 case 5: 
 var $16=(($info+24)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=($17|0)==2;
 if($18){label=6;break;}else{label=9;break;}
 case 6: 
 HEAP32[(($16)>>2)]=$path_below;
 label=9;break;
 case 7: 
 var $21=(($info+36)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=((($22)+(1))|0);
 HEAP32[(($21)>>2)]=$23;
 var $24=(($info+24)|0);
 HEAP32[(($24)>>2)]=2;
 var $25=(($info+54)|0);
 HEAP8[(($25)>>0)]=1;
 label=9;break;
 case 8: 
 var $27=(($this+8)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=$28;
 var $30=HEAP32[(($29)>>2)];
 var $31=(($30+28)|0);
 var $32=HEAP32[(($31)>>2)];
 FUNCTION_TABLE[$32]($28,$info,$adjustedPtr,$path_below);
 label=9;break;
 case 9: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=8;break;}
 case 2: 
 var $7=(($info+16)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==0;
 if($9){label=3;break;}else{label=4;break;}
 case 3: 
 HEAP32[(($7)>>2)]=$adjustedPtr;
 var $11=(($info+24)|0);
 HEAP32[(($11)>>2)]=$path_below;
 var $12=(($info+36)|0);
 HEAP32[(($12)>>2)]=1;
 label=16;break;
 case 4: 
 var $14=($8|0)==($adjustedPtr|0);
 if($14){label=5;break;}else{label=7;break;}
 case 5: 
 var $16=(($info+24)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=($17|0)==2;
 if($18){label=6;break;}else{label=16;break;}
 case 6: 
 HEAP32[(($16)>>2)]=$path_below;
 label=16;break;
 case 7: 
 var $21=(($info+36)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=((($22)+(1))|0);
 HEAP32[(($21)>>2)]=$23;
 var $24=(($info+24)|0);
 HEAP32[(($24)>>2)]=2;
 var $25=(($info+54)|0);
 HEAP8[(($25)>>0)]=1;
 label=16;break;
 case 8: 
 var $27=(($this+12)|0);
 var $28=HEAP32[(($27)>>2)];
 var $29=(($this+16+($28<<3))|0);
 var $30=(($this+20)|0);
 var $31=HEAP32[(($30)>>2)];
 var $32=$31>>8;
 var $33=$31&1;
 var $34=($33|0)==0;
 if($34){var $offset_to_base_0_i1=$32;label=10;break;}else{label=9;break;}
 case 9: 
 var $36=$adjustedPtr;
 var $37=HEAP32[(($36)>>2)];
 var $38=(($37+$32)|0);
 var $39=$38;
 var $40=HEAP32[(($39)>>2)];
 var $offset_to_base_0_i1=$40;label=10;break;
 case 10: 
 var $offset_to_base_0_i1;
 var $41=(($this+16)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=$42;
 var $44=HEAP32[(($43)>>2)];
 var $45=(($44+28)|0);
 var $46=HEAP32[(($45)>>2)];
 var $47=(($adjustedPtr+$offset_to_base_0_i1)|0);
 var $48=$31&2;
 var $49=($48|0)!=0;
 var $50=($49?$path_below:2);
 FUNCTION_TABLE[$46]($42,$info,$47,$50);
 var $51=($28|0)>1;
 if($51){label=11;break;}else{label=16;break;}
 case 11: 
 var $52=(($this+24)|0);
 var $53=(($info+54)|0);
 var $54=$adjustedPtr;
 var $p_0=$52;label=12;break;
 case 12: 
 var $p_0;
 var $56=(($p_0+4)|0);
 var $57=HEAP32[(($56)>>2)];
 var $58=$57>>8;
 var $59=$57&1;
 var $60=($59|0)==0;
 if($60){var $offset_to_base_0_i=$58;label=14;break;}else{label=13;break;}
 case 13: 
 var $62=HEAP32[(($54)>>2)];
 var $63=(($62+$58)|0);
 var $64=$63;
 var $65=HEAP32[(($64)>>2)];
 var $offset_to_base_0_i=$65;label=14;break;
 case 14: 
 var $offset_to_base_0_i;
 var $66=(($p_0)|0);
 var $67=HEAP32[(($66)>>2)];
 var $68=$67;
 var $69=HEAP32[(($68)>>2)];
 var $70=(($69+28)|0);
 var $71=HEAP32[(($70)>>2)];
 var $72=(($adjustedPtr+$offset_to_base_0_i)|0);
 var $73=$57&2;
 var $74=($73|0)!=0;
 var $75=($74?$path_below:2);
 FUNCTION_TABLE[$71]($67,$info,$72,$75);
 var $76=HEAP8[(($53)>>0)];
 var $77=(($76<<24)>>24)==0;
 if($77){label=15;break;}else{label=16;break;}
 case 15: 
 var $79=(($p_0+8)|0);
 var $80=($79>>>0)<($29>>>0);
 if($80){var $p_0=$79;label=12;break;}else{label=16;break;}
 case 16: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv119__pointer_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$adjustedPtr){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $info=sp;
 var $1=HEAP32[(($adjustedPtr)>>2)];
 var $2=$1;
 var $3=HEAP32[(($2)>>2)];
 HEAP32[(($adjustedPtr)>>2)]=$3;
 var $4=(($this)|0);
 var $5=(($thrown_type)|0);
 var $6=($4|0)==($5|0);
 var $7=($5|0)==4672;
 var $__i=$6|$7;
 if($__i){var $_1=1;label=12;break;}else{label=2;break;}
 case 2: 
 var $9=($thrown_type|0)==0;
 if($9){var $_1=0;label=12;break;}else{label=3;break;}
 case 3: 
 var $11=$thrown_type;
 var $12=___dynamic_cast($11,4608);
 var $13=($12|0)==0;
 if($13){var $_1=0;label=12;break;}else{label=4;break;}
 case 4: 
 var $15=(($12+8)|0);
 var $16=$15;
 var $17=HEAP32[(($16)>>2)];
 var $18=(($this+8)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=$19^-1;
 var $21=$17&$20;
 var $22=($21|0)==0;
 if($22){label=5;break;}else{var $_1=0;label=12;break;}
 case 5: 
 var $24=(($this+12)|0);
 var $25=HEAP32[(($24)>>2)];
 var $26=(($25)|0);
 var $27=(($12+12)|0);
 var $28=$27;
 var $29=HEAP32[(($28)>>2)];
 var $30=($25|0)==($29|0);
 var $31=($26|0)==3720;
 var $or_cond=$30|$31;
 if($or_cond){var $_1=1;label=12;break;}else{label=6;break;}
 case 6: 
 var $33=($25|0)==0;
 if($33){var $_1=0;label=12;break;}else{label=7;break;}
 case 7: 
 var $35=$25;
 var $36=___dynamic_cast($35,4640);
 var $37=$36;
 var $38=($36|0)==0;
 if($38){var $_1=0;label=12;break;}else{label=8;break;}
 case 8: 
 var $40=HEAP32[(($28)>>2)];
 var $41=($40|0)==0;
 if($41){var $_1=0;label=12;break;}else{label=9;break;}
 case 9: 
 var $43=$40;
 var $44=___dynamic_cast($43,4640);
 var $45=$44;
 var $46=($44|0)==0;
 if($46){var $_1=0;label=12;break;}else{label=10;break;}
 case 10: 
 var $48=$info;
 var $$etemp$0$0=56;
 var $$etemp$0$1=0;

 _memset($48, 0, 56)|0;
 var $49=(($info)|0);
 HEAP32[(($49)>>2)]=$45;
 var $50=(($info+8)|0);
 HEAP32[(($50)>>2)]=$37;
 var $51=(($info+12)|0);
 HEAP32[(($51)>>2)]=-1;
 var $52=(($info+48)|0);
 HEAP32[(($52)>>2)]=1;
 var $53=$44;
 var $54=HEAP32[(($53)>>2)];
 var $55=(($54+28)|0);
 var $56=HEAP32[(($55)>>2)];
 var $57=HEAP32[(($adjustedPtr)>>2)];
 FUNCTION_TABLE[$56]($45,$info,$57,1);
 var $58=(($info+24)|0);
 var $59=HEAP32[(($58)>>2)];
 var $60=($59|0)==1;
 if($60){label=11;break;}else{var $_1=0;label=12;break;}
 case 11: 
 var $62=(($info+16)|0);
 var $63=HEAP32[(($62)>>2)];
 HEAP32[(($adjustedPtr)>>2)]=$63;
 var $_1=1;label=12;break;
 case 12: 
 var $_1;
 STACKTOP=sp;return $_1;
  default: assert(0, "bad label: " + label);
 }

}


function ___dynamic_cast($static_ptr,$dst_type){
 var label=0;
 var sp=STACKTOP;STACKTOP=(STACKTOP+56)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1)switch(label){
 case 1: 
 var $info=sp;
 var $1=$static_ptr;
 var $2=HEAP32[(($1)>>2)];
 var $3=((($2)-(8))|0);
 var $4=HEAP32[(($3)>>2)];
 var $5=$4;
 var $6=(($static_ptr+$5)|0);
 var $7=((($2)-(4))|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=$8;
 var $10=$info;
 var $$etemp$0$0=56;
 var $$etemp$0$1=0;

 var $11=(($info)|0);
 HEAP32[(($11)>>2)]=$dst_type;
 var $12=(($info+4)|0);
 HEAP32[(($12)>>2)]=$static_ptr;
 var $13=(($info+8)|0);
 HEAP32[(($13)>>2)]=4656;
 var $14=(($info+12)|0);
 var $15=(($info+16)|0);
 var $16=(($info+20)|0);
 var $17=(($info+24)|0);
 var $18=(($info+28)|0);
 var $19=(($info+32)|0);
 var $20=(($info+40)|0);
 var $21=$8;
 var $22=(($dst_type)|0);
 var $23=($21|0)==($22|0);
 var $24=$14;
 _memset($24, 0, 43)|0;
 if($23){label=2;break;}else{label=3;break;}
 case 2: 
 var $26=(($info+48)|0);
 HEAP32[(($26)>>2)]=1;
 var $27=$8;
 var $28=HEAP32[(($27)>>2)];
 var $29=(($28+20)|0);
 var $30=HEAP32[(($29)>>2)];
 FUNCTION_TABLE[$30]($9,$info,$6,$6,1,0);
 var $31=HEAP32[(($17)>>2)];
 var $32=($31|0)==1;
 var $_=($32?$6:0);
 var $dst_ptr_0=$_;label=12;break;
 case 3: 
 var $34=(($info+36)|0);
 var $35=$8;
 var $36=HEAP32[(($35)>>2)];
 var $37=(($36+24)|0);
 var $38=HEAP32[(($37)>>2)];
 FUNCTION_TABLE[$38]($9,$info,$6,1,0);
 var $39=HEAP32[(($34)>>2)];
 if(($39|0)==0){ label=4;break;}else if(($39|0)==1){ label=7;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 4: 
 var $41=HEAP32[(($20)>>2)];
 var $42=($41|0)==1;
 if($42){label=5;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 5: 
 var $44=HEAP32[(($18)>>2)];
 var $45=($44|0)==1;
 if($45){label=6;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 6: 
 var $47=HEAP32[(($19)>>2)];
 var $48=($47|0)==1;
 var $49=HEAP32[(($16)>>2)];
 var $_1=($48?$49:0);
 var $dst_ptr_0=$_1;label=12;break;
 case 7: 
 var $51=HEAP32[(($17)>>2)];
 var $52=($51|0)==1;
 if($52){label=11;break;}else{label=8;break;}
 case 8: 
 var $54=HEAP32[(($20)>>2)];
 var $55=($54|0)==0;
 if($55){label=9;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 9: 
 var $57=HEAP32[(($18)>>2)];
 var $58=($57|0)==1;
 if($58){label=10;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 10: 
 var $60=HEAP32[(($19)>>2)];
 var $61=($60|0)==1;
 if($61){label=11;break;}else{var $dst_ptr_0=0;label=12;break;}
 case 11: 
 var $63=HEAP32[(($15)>>2)];
 var $dst_ptr_0=$63;label=12;break;
 case 12: 
 var $dst_ptr_0;
 var $$etemp$1$0=56;
 var $$etemp$1$1=0;

 STACKTOP=sp;return $dst_ptr_0;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=5;break;}
 case 2: 
 var $7=(($info+4)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==($current_ptr|0);
 if($9){label=3;break;}else{label=53;break;}
 case 3: 
 var $11=(($info+28)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)==1;
 if($13){label=53;break;}else{label=4;break;}
 case 4: 
 HEAP32[(($11)>>2)]=$path_below;
 label=53;break;
 case 5: 
 var $16=(($info)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17)|0);
 var $19=($1|0)==($18|0);
 if($19){label=6;break;}else{label=29;break;}
 case 6: 
 var $21=(($info+16)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=($22|0)==($current_ptr|0);
 if($23){label=8;break;}else{label=7;break;}
 case 7: 
 var $25=(($info+20)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=($26|0)==($current_ptr|0);
 if($27){label=8;break;}else{label=10;break;}
 case 8: 
 var $29=($path_below|0)==1;
 if($29){label=9;break;}else{label=53;break;}
 case 9: 
 var $31=(($info+32)|0);
 HEAP32[(($31)>>2)]=1;
 label=53;break;
 case 10: 
 var $33=(($info+32)|0);
 HEAP32[(($33)>>2)]=$path_below;
 var $34=(($info+44)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==4;
 if($36){label=53;break;}else{label=11;break;}
 case 11: 
 var $38=(($this+12)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=(($this+16+($39<<3))|0);
 var $41=($39|0)>0;
 if($41){label=12;break;}else{var $is_dst_type_derived_from_static_type_2_off030=0;label=23;break;}
 case 12: 
 var $42=(($this+16)|0);
 var $43=(($info+52)|0);
 var $44=(($info+53)|0);
 var $45=(($info+54)|0);
 var $46=(($this+8)|0);
 var $47=(($info+24)|0);
 var $48=$current_ptr;
 var $does_dst_type_point_to_our_static_type_0_off019=0;var $p_020=$42;var $is_dst_type_derived_from_static_type_0_off021=0;label=13;break;
 case 13: 
 var $is_dst_type_derived_from_static_type_0_off021;
 var $p_020;
 var $does_dst_type_point_to_our_static_type_0_off019;
 HEAP8[(($43)>>0)]=0;
 HEAP8[(($44)>>0)]=0;
 var $50=(($p_020+4)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=$51>>8;
 var $53=$51&1;
 var $54=($53|0)==0;
 if($54){var $offset_to_base_0_i13=$52;label=15;break;}else{label=14;break;}
 case 14: 
 var $56=HEAP32[(($48)>>2)];
 var $57=(($56+$52)|0);
 var $58=$57;
 var $59=HEAP32[(($58)>>2)];
 var $offset_to_base_0_i13=$59;label=15;break;
 case 15: 
 var $offset_to_base_0_i13;
 var $60=(($p_020)|0);
 var $61=HEAP32[(($60)>>2)];
 var $62=$61;
 var $63=HEAP32[(($62)>>2)];
 var $64=(($63+20)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=(($current_ptr+$offset_to_base_0_i13)|0);
 var $67=$51>>>1;
 var $68=$67&1;
 var $69=(((2)-($68))|0);
 FUNCTION_TABLE[$65]($61,$info,$current_ptr,$66,$69,$use_strcmp);
 var $70=HEAP8[(($45)>>0)];
 var $71=(($70<<24)>>24)==0;
 if($71){label=16;break;}else{var $is_dst_type_derived_from_static_type_2_off0=$is_dst_type_derived_from_static_type_0_off021;var $does_dst_type_point_to_our_static_type_0_off0_lcssa=$does_dst_type_point_to_our_static_type_0_off019;label=22;break;}
 case 16: 
 var $73=HEAP8[(($44)>>0)];
 var $74=(($73<<24)>>24)==0;
 if($74){var $is_dst_type_derived_from_static_type_1_off0=$is_dst_type_derived_from_static_type_0_off021;var $does_dst_type_point_to_our_static_type_1_off0=$does_dst_type_point_to_our_static_type_0_off019;label=21;break;}else{label=17;break;}
 case 17: 
 var $76=HEAP8[(($43)>>0)];
 var $77=(($76<<24)>>24)==0;
 if($77){label=20;break;}else{label=18;break;}
 case 18: 
 var $79=HEAP32[(($47)>>2)];
 var $80=($79|0)==1;
 if($80){label=27;break;}else{label=19;break;}
 case 19: 
 var $82=HEAP32[(($46)>>2)];
 var $83=$82&2;
 var $84=($83|0)==0;
 if($84){label=27;break;}else{var $is_dst_type_derived_from_static_type_1_off0=1;var $does_dst_type_point_to_our_static_type_1_off0=1;label=21;break;}
 case 20: 
 var $86=HEAP32[(($46)>>2)];
 var $87=$86&1;
 var $88=($87|0)==0;
 if($88){var $is_dst_type_derived_from_static_type_2_off0=1;var $does_dst_type_point_to_our_static_type_0_off0_lcssa=$does_dst_type_point_to_our_static_type_0_off019;label=22;break;}else{var $is_dst_type_derived_from_static_type_1_off0=1;var $does_dst_type_point_to_our_static_type_1_off0=$does_dst_type_point_to_our_static_type_0_off019;label=21;break;}
 case 21: 
 var $does_dst_type_point_to_our_static_type_1_off0;
 var $is_dst_type_derived_from_static_type_1_off0;
 var $90=(($p_020+8)|0);
 var $91=($90>>>0)<($40>>>0);
 if($91){var $does_dst_type_point_to_our_static_type_0_off019=$does_dst_type_point_to_our_static_type_1_off0;var $p_020=$90;var $is_dst_type_derived_from_static_type_0_off021=$is_dst_type_derived_from_static_type_1_off0;label=13;break;}else{var $is_dst_type_derived_from_static_type_2_off0=$is_dst_type_derived_from_static_type_1_off0;var $does_dst_type_point_to_our_static_type_0_off0_lcssa=$does_dst_type_point_to_our_static_type_1_off0;label=22;break;}
 case 22: 
 var $does_dst_type_point_to_our_static_type_0_off0_lcssa;
 var $is_dst_type_derived_from_static_type_2_off0;
 if($does_dst_type_point_to_our_static_type_0_off0_lcssa){var $is_dst_type_derived_from_static_type_2_off031=$is_dst_type_derived_from_static_type_2_off0;label=26;break;}else{var $is_dst_type_derived_from_static_type_2_off030=$is_dst_type_derived_from_static_type_2_off0;label=23;break;}
 case 23: 
 var $is_dst_type_derived_from_static_type_2_off030;
 HEAP32[(($25)>>2)]=$current_ptr;
 var $92=(($info+40)|0);
 var $93=HEAP32[(($92)>>2)];
 var $94=((($93)+(1))|0);
 HEAP32[(($92)>>2)]=$94;
 var $95=(($info+36)|0);
 var $96=HEAP32[(($95)>>2)];
 var $97=($96|0)==1;
 if($97){label=24;break;}else{var $is_dst_type_derived_from_static_type_2_off031=$is_dst_type_derived_from_static_type_2_off030;label=26;break;}
 case 24: 
 var $99=(($info+24)|0);
 var $100=HEAP32[(($99)>>2)];
 var $101=($100|0)==2;
 if($101){label=25;break;}else{var $is_dst_type_derived_from_static_type_2_off031=$is_dst_type_derived_from_static_type_2_off030;label=26;break;}
 case 25: 
 var $103=(($info+54)|0);
 HEAP8[(($103)>>0)]=1;
 if($is_dst_type_derived_from_static_type_2_off030){label=27;break;}else{label=28;break;}
 case 26: 
 var $is_dst_type_derived_from_static_type_2_off031;
 if($is_dst_type_derived_from_static_type_2_off031){label=27;break;}else{label=28;break;}
 case 27: 
 HEAP32[(($34)>>2)]=3;
 label=53;break;
 case 28: 
 HEAP32[(($34)>>2)]=4;
 label=53;break;
 case 29: 
 var $107=(($this+12)|0);
 var $108=HEAP32[(($107)>>2)];
 var $109=(($this+16+($108<<3))|0);
 var $110=(($this+20)|0);
 var $111=HEAP32[(($110)>>2)];
 var $112=$111>>8;
 var $113=$111&1;
 var $114=($113|0)==0;
 if($114){var $offset_to_base_0_i14=$112;label=31;break;}else{label=30;break;}
 case 30: 
 var $116=$current_ptr;
 var $117=HEAP32[(($116)>>2)];
 var $118=(($117+$112)|0);
 var $119=$118;
 var $120=HEAP32[(($119)>>2)];
 var $offset_to_base_0_i14=$120;label=31;break;
 case 31: 
 var $offset_to_base_0_i14;
 var $121=(($this+16)|0);
 var $122=HEAP32[(($121)>>2)];
 var $123=$122;
 var $124=HEAP32[(($123)>>2)];
 var $125=(($124+24)|0);
 var $126=HEAP32[(($125)>>2)];
 var $127=(($current_ptr+$offset_to_base_0_i14)|0);
 var $128=$111&2;
 var $129=($128|0)!=0;
 var $130=($129?$path_below:2);
 FUNCTION_TABLE[$126]($122,$info,$127,$130,$use_strcmp);
 var $131=(($this+24)|0);
 var $132=($108|0)>1;
 if($132){label=32;break;}else{label=53;break;}
 case 32: 
 var $134=(($this+8)|0);
 var $135=HEAP32[(($134)>>2)];
 var $136=$135&2;
 var $137=($136|0)==0;
 if($137){label=33;break;}else{label=34;break;}
 case 33: 
 var $139=(($info+36)|0);
 var $140=HEAP32[(($139)>>2)];
 var $141=($140|0)==1;
 if($141){label=34;break;}else{label=39;break;}
 case 34: 
 var $142=(($info+54)|0);
 var $143=$current_ptr;
 var $p2_0=$131;label=35;break;
 case 35: 
 var $p2_0;
 var $145=HEAP8[(($142)>>0)];
 var $146=(($145<<24)>>24)==0;
 if($146){label=36;break;}else{label=53;break;}
 case 36: 
 var $148=(($p2_0+4)|0);
 var $149=HEAP32[(($148)>>2)];
 var $150=$149>>8;
 var $151=$149&1;
 var $152=($151|0)==0;
 if($152){var $offset_to_base_0_i11=$150;label=38;break;}else{label=37;break;}
 case 37: 
 var $154=HEAP32[(($143)>>2)];
 var $155=(($154+$150)|0);
 var $156=$155;
 var $157=HEAP32[(($156)>>2)];
 var $offset_to_base_0_i11=$157;label=38;break;
 case 38: 
 var $offset_to_base_0_i11;
 var $158=(($p2_0)|0);
 var $159=HEAP32[(($158)>>2)];
 var $160=$159;
 var $161=HEAP32[(($160)>>2)];
 var $162=(($161+24)|0);
 var $163=HEAP32[(($162)>>2)];
 var $164=(($current_ptr+$offset_to_base_0_i11)|0);
 var $165=$149&2;
 var $166=($165|0)!=0;
 var $167=($166?$path_below:2);
 FUNCTION_TABLE[$163]($159,$info,$164,$167,$use_strcmp);
 var $168=(($p2_0+8)|0);
 var $169=($168>>>0)<($109>>>0);
 if($169){var $p2_0=$168;label=35;break;}else{label=53;break;}
 case 39: 
 var $171=$135&1;
 var $172=($171|0)==0;
 if($172){label=41;break;}else{label=40;break;}
 case 40: 
 var $173=(($info+24)|0);
 var $174=(($info+54)|0);
 var $175=$current_ptr;
 var $p2_1=$131;label=42;break;
 case 41: 
 var $176=(($info+54)|0);
 var $177=$current_ptr;
 var $p2_2=$131;label=48;break;
 case 42: 
 var $p2_1;
 var $179=HEAP8[(($174)>>0)];
 var $180=(($179<<24)>>24)==0;
 if($180){label=43;break;}else{label=53;break;}
 case 43: 
 var $182=HEAP32[(($139)>>2)];
 var $183=($182|0)==1;
 if($183){label=44;break;}else{label=45;break;}
 case 44: 
 var $185=HEAP32[(($173)>>2)];
 var $186=($185|0)==1;
 if($186){label=53;break;}else{label=45;break;}
 case 45: 
 var $188=(($p2_1+4)|0);
 var $189=HEAP32[(($188)>>2)];
 var $190=$189>>8;
 var $191=$189&1;
 var $192=($191|0)==0;
 if($192){var $offset_to_base_0_i9=$190;label=47;break;}else{label=46;break;}
 case 46: 
 var $194=HEAP32[(($175)>>2)];
 var $195=(($194+$190)|0);
 var $196=$195;
 var $197=HEAP32[(($196)>>2)];
 var $offset_to_base_0_i9=$197;label=47;break;
 case 47: 
 var $offset_to_base_0_i9;
 var $198=(($p2_1)|0);
 var $199=HEAP32[(($198)>>2)];
 var $200=$199;
 var $201=HEAP32[(($200)>>2)];
 var $202=(($201+24)|0);
 var $203=HEAP32[(($202)>>2)];
 var $204=(($current_ptr+$offset_to_base_0_i9)|0);
 var $205=$189&2;
 var $206=($205|0)!=0;
 var $207=($206?$path_below:2);
 FUNCTION_TABLE[$203]($199,$info,$204,$207,$use_strcmp);
 var $208=(($p2_1+8)|0);
 var $209=($208>>>0)<($109>>>0);
 if($209){var $p2_1=$208;label=42;break;}else{label=53;break;}
 case 48: 
 var $p2_2;
 var $211=HEAP8[(($176)>>0)];
 var $212=(($211<<24)>>24)==0;
 if($212){label=49;break;}else{label=53;break;}
 case 49: 
 var $214=HEAP32[(($139)>>2)];
 var $215=($214|0)==1;
 if($215){label=53;break;}else{label=50;break;}
 case 50: 
 var $217=(($p2_2+4)|0);
 var $218=HEAP32[(($217)>>2)];
 var $219=$218>>8;
 var $220=$218&1;
 var $221=($220|0)==0;
 if($221){var $offset_to_base_0_i=$219;label=52;break;}else{label=51;break;}
 case 51: 
 var $223=HEAP32[(($177)>>2)];
 var $224=(($223+$219)|0);
 var $225=$224;
 var $226=HEAP32[(($225)>>2)];
 var $offset_to_base_0_i=$226;label=52;break;
 case 52: 
 var $offset_to_base_0_i;
 var $227=(($p2_2)|0);
 var $228=HEAP32[(($227)>>2)];
 var $229=$228;
 var $230=HEAP32[(($229)>>2)];
 var $231=(($230+24)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=(($current_ptr+$offset_to_base_0_i)|0);
 var $234=$218&2;
 var $235=($234|0)!=0;
 var $236=($235?$path_below:2);
 FUNCTION_TABLE[$232]($228,$info,$233,$236,$use_strcmp);
 var $237=(($p2_2+8)|0);
 var $238=($237>>>0)<($109>>>0);
 if($238){var $p2_2=$237;label=48;break;}else{label=53;break;}
 case 53: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=5;break;}
 case 2: 
 var $7=(($info+4)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=($8|0)==($current_ptr|0);
 if($9){label=3;break;}else{label=20;break;}
 case 3: 
 var $11=(($info+28)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)==1;
 if($13){label=20;break;}else{label=4;break;}
 case 4: 
 HEAP32[(($11)>>2)]=$path_below;
 label=20;break;
 case 5: 
 var $16=(($info)|0);
 var $17=HEAP32[(($16)>>2)];
 var $18=(($17)|0);
 var $19=($1|0)==($18|0);
 if($19){label=6;break;}else{label=19;break;}
 case 6: 
 var $21=(($info+16)|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=($22|0)==($current_ptr|0);
 if($23){label=8;break;}else{label=7;break;}
 case 7: 
 var $25=(($info+20)|0);
 var $26=HEAP32[(($25)>>2)];
 var $27=($26|0)==($current_ptr|0);
 if($27){label=8;break;}else{label=10;break;}
 case 8: 
 var $29=($path_below|0)==1;
 if($29){label=9;break;}else{label=20;break;}
 case 9: 
 var $31=(($info+32)|0);
 HEAP32[(($31)>>2)]=1;
 label=20;break;
 case 10: 
 var $33=(($info+32)|0);
 HEAP32[(($33)>>2)]=$path_below;
 var $34=(($info+44)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==4;
 if($36){label=20;break;}else{label=11;break;}
 case 11: 
 var $38=(($info+52)|0);
 HEAP8[(($38)>>0)]=0;
 var $39=(($info+53)|0);
 HEAP8[(($39)>>0)]=0;
 var $40=(($this+8)|0);
 var $41=HEAP32[(($40)>>2)];
 var $42=$41;
 var $43=HEAP32[(($42)>>2)];
 var $44=(($43+20)|0);
 var $45=HEAP32[(($44)>>2)];
 FUNCTION_TABLE[$45]($41,$info,$current_ptr,$current_ptr,1,$use_strcmp);
 var $46=HEAP8[(($39)>>0)];
 var $47=(($46<<24)>>24)==0;
 if($47){var $is_dst_type_derived_from_static_type_0_off01=0;label=13;break;}else{label=12;break;}
 case 12: 
 var $49=HEAP8[(($38)>>0)];
 var $not_=(($49<<24)>>24)==0;
 if($not_){var $is_dst_type_derived_from_static_type_0_off01=1;label=13;break;}else{label=17;break;}
 case 13: 
 var $is_dst_type_derived_from_static_type_0_off01;
 HEAP32[(($25)>>2)]=$current_ptr;
 var $50=(($info+40)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=((($51)+(1))|0);
 HEAP32[(($50)>>2)]=$52;
 var $53=(($info+36)|0);
 var $54=HEAP32[(($53)>>2)];
 var $55=($54|0)==1;
 if($55){label=14;break;}else{label=16;break;}
 case 14: 
 var $57=(($info+24)|0);
 var $58=HEAP32[(($57)>>2)];
 var $59=($58|0)==2;
 if($59){label=15;break;}else{label=16;break;}
 case 15: 
 var $61=(($info+54)|0);
 HEAP8[(($61)>>0)]=1;
 if($is_dst_type_derived_from_static_type_0_off01){label=17;break;}else{label=18;break;}
 case 16: 
 if($is_dst_type_derived_from_static_type_0_off01){label=17;break;}else{label=18;break;}
 case 17: 
 HEAP32[(($34)>>2)]=3;
 label=20;break;
 case 18: 
 HEAP32[(($34)>>2)]=4;
 label=20;break;
 case 19: 
 var $65=(($this+8)|0);
 var $66=HEAP32[(($65)>>2)];
 var $67=$66;
 var $68=HEAP32[(($67)>>2)];
 var $69=(($68+24)|0);
 var $70=HEAP32[(($69)>>2)];
 FUNCTION_TABLE[$70]($66,$info,$current_ptr,$path_below,$use_strcmp);
 label=20;break;
 case 20: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==($this|0);
 if($3){label=2;break;}else{label=5;break;}
 case 2: 
 var $5=(($info+4)|0);
 var $6=HEAP32[(($5)>>2)];
 var $7=($6|0)==($current_ptr|0);
 if($7){label=3;break;}else{label=14;break;}
 case 3: 
 var $9=(($info+28)|0);
 var $10=HEAP32[(($9)>>2)];
 var $11=($10|0)==1;
 if($11){label=14;break;}else{label=4;break;}
 case 4: 
 HEAP32[(($9)>>2)]=$path_below;
 label=14;break;
 case 5: 
 var $14=(($info)|0);
 var $15=HEAP32[(($14)>>2)];
 var $16=($15|0)==($this|0);
 if($16){label=6;break;}else{label=14;break;}
 case 6: 
 var $18=(($info+16)|0);
 var $19=HEAP32[(($18)>>2)];
 var $20=($19|0)==($current_ptr|0);
 if($20){label=8;break;}else{label=7;break;}
 case 7: 
 var $22=(($info+20)|0);
 var $23=HEAP32[(($22)>>2)];
 var $24=($23|0)==($current_ptr|0);
 if($24){label=8;break;}else{label=10;break;}
 case 8: 
 var $26=($path_below|0)==1;
 if($26){label=9;break;}else{label=14;break;}
 case 9: 
 var $28=(($info+32)|0);
 HEAP32[(($28)>>2)]=1;
 label=14;break;
 case 10: 
 var $30=(($info+32)|0);
 HEAP32[(($30)>>2)]=$path_below;
 HEAP32[(($22)>>2)]=$current_ptr;
 var $31=(($info+40)|0);
 var $32=HEAP32[(($31)>>2)];
 var $33=((($32)+(1))|0);
 HEAP32[(($31)>>2)]=$33;
 var $34=(($info+36)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==1;
 if($36){label=11;break;}else{label=13;break;}
 case 11: 
 var $38=(($info+24)|0);
 var $39=HEAP32[(($38)>>2)];
 var $40=($39|0)==2;
 if($40){label=12;break;}else{label=13;break;}
 case 12: 
 var $42=(($info+54)|0);
 HEAP8[(($42)>>0)]=1;
 label=13;break;
 case 13: 
 var $44=(($info+44)|0);
 HEAP32[(($44)>>2)]=4;
 label=14;break;
 case 14: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=12;break;}
 case 2: 
 var $7=(($info+53)|0);
 HEAP8[(($7)>>0)]=1;
 var $8=(($info+4)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=($9|0)==($current_ptr|0);
 if($10){label=3;break;}else{label=26;break;}
 case 3: 
 var $12=(($info+52)|0);
 HEAP8[(($12)>>0)]=1;
 var $13=(($info+16)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=($14|0)==0;
 if($15){label=4;break;}else{label=6;break;}
 case 4: 
 HEAP32[(($13)>>2)]=$dst_ptr;
 var $17=(($info+24)|0);
 HEAP32[(($17)>>2)]=$path_below;
 var $18=(($info+36)|0);
 HEAP32[(($18)>>2)]=1;
 var $19=(($info+48)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=($20|0)==1;
 var $22=($path_below|0)==1;
 var $or_cond_i=$21&$22;
 if($or_cond_i){label=5;break;}else{label=26;break;}
 case 5: 
 var $24=(($info+54)|0);
 HEAP8[(($24)>>0)]=1;
 label=26;break;
 case 6: 
 var $26=($14|0)==($dst_ptr|0);
 if($26){label=7;break;}else{label=11;break;}
 case 7: 
 var $28=(($info+24)|0);
 var $29=HEAP32[(($28)>>2)];
 var $30=($29|0)==2;
 if($30){label=8;break;}else{var $33=$29;label=9;break;}
 case 8: 
 HEAP32[(($28)>>2)]=$path_below;
 var $33=$path_below;label=9;break;
 case 9: 
 var $33;
 var $34=(($info+48)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==1;
 var $37=($33|0)==1;
 var $or_cond1_i=$36&$37;
 if($or_cond1_i){label=10;break;}else{label=26;break;}
 case 10: 
 var $39=(($info+54)|0);
 HEAP8[(($39)>>0)]=1;
 label=26;break;
 case 11: 
 var $41=(($info+36)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=((($42)+(1))|0);
 HEAP32[(($41)>>2)]=$43;
 var $44=(($info+54)|0);
 HEAP8[(($44)>>0)]=1;
 label=26;break;
 case 12: 
 var $46=(($info+52)|0);
 var $47=HEAP8[(($46)>>0)];
 var $48=(($info+53)|0);
 var $49=HEAP8[(($48)>>0)];
 var $50=(($this+12)|0);
 var $51=HEAP32[(($50)>>2)];
 var $52=(($this+16+($51<<3))|0);
 HEAP8[(($46)>>0)]=0;
 HEAP8[(($48)>>0)]=0;
 var $53=(($this+20)|0);
 var $54=HEAP32[(($53)>>2)];
 var $55=$54>>8;
 var $56=$54&1;
 var $57=($56|0)==0;
 if($57){var $offset_to_base_0_i1=$55;label=14;break;}else{label=13;break;}
 case 13: 
 var $59=$current_ptr;
 var $60=HEAP32[(($59)>>2)];
 var $61=(($60+$55)|0);
 var $62=$61;
 var $63=HEAP32[(($62)>>2)];
 var $offset_to_base_0_i1=$63;label=14;break;
 case 14: 
 var $offset_to_base_0_i1;
 var $64=(($this+16)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=$65;
 var $67=HEAP32[(($66)>>2)];
 var $68=(($67+20)|0);
 var $69=HEAP32[(($68)>>2)];
 var $70=(($current_ptr+$offset_to_base_0_i1)|0);
 var $71=$54&2;
 var $72=($71|0)!=0;
 var $73=($72?$path_below:2);
 FUNCTION_TABLE[$69]($65,$info,$dst_ptr,$70,$73,$use_strcmp);
 var $74=($51|0)>1;
 if($74){label=15;break;}else{label=25;break;}
 case 15: 
 var $75=(($this+24)|0);
 var $76=(($info+24)|0);
 var $77=(($this+8)|0);
 var $78=(($info+54)|0);
 var $79=$current_ptr;
 var $p_0=$75;label=16;break;
 case 16: 
 var $p_0;
 var $81=HEAP8[(($78)>>0)];
 var $82=(($81<<24)>>24)==0;
 if($82){label=17;break;}else{label=25;break;}
 case 17: 
 var $84=HEAP8[(($46)>>0)];
 var $85=(($84<<24)>>24)==0;
 if($85){label=20;break;}else{label=18;break;}
 case 18: 
 var $87=HEAP32[(($76)>>2)];
 var $88=($87|0)==1;
 if($88){label=25;break;}else{label=19;break;}
 case 19: 
 var $90=HEAP32[(($77)>>2)];
 var $91=$90&2;
 var $92=($91|0)==0;
 if($92){label=25;break;}else{label=22;break;}
 case 20: 
 var $94=HEAP8[(($48)>>0)];
 var $95=(($94<<24)>>24)==0;
 if($95){label=22;break;}else{label=21;break;}
 case 21: 
 var $97=HEAP32[(($77)>>2)];
 var $98=$97&1;
 var $99=($98|0)==0;
 if($99){label=25;break;}else{label=22;break;}
 case 22: 
 HEAP8[(($46)>>0)]=0;
 HEAP8[(($48)>>0)]=0;
 var $101=(($p_0+4)|0);
 var $102=HEAP32[(($101)>>2)];
 var $103=$102>>8;
 var $104=$102&1;
 var $105=($104|0)==0;
 if($105){var $offset_to_base_0_i=$103;label=24;break;}else{label=23;break;}
 case 23: 
 var $107=HEAP32[(($79)>>2)];
 var $108=(($107+$103)|0);
 var $109=$108;
 var $110=HEAP32[(($109)>>2)];
 var $offset_to_base_0_i=$110;label=24;break;
 case 24: 
 var $offset_to_base_0_i;
 var $111=(($p_0)|0);
 var $112=HEAP32[(($111)>>2)];
 var $113=$112;
 var $114=HEAP32[(($113)>>2)];
 var $115=(($114+20)|0);
 var $116=HEAP32[(($115)>>2)];
 var $117=(($current_ptr+$offset_to_base_0_i)|0);
 var $118=$102&2;
 var $119=($118|0)!=0;
 var $120=($119?$path_below:2);
 FUNCTION_TABLE[$116]($112,$info,$dst_ptr,$117,$120,$use_strcmp);
 var $121=(($p_0+8)|0);
 var $122=($121>>>0)<($52>>>0);
 if($122){var $p_0=$121;label=16;break;}else{label=25;break;}
 case 25: 
 HEAP8[(($46)>>0)]=$47;
 HEAP8[(($48)>>0)]=$49;
 label=26;break;
 case 26: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);
 var $2=(($info+8)|0);
 var $3=HEAP32[(($2)>>2)];
 var $4=(($3)|0);
 var $5=($1|0)==($4|0);
 if($5){label=2;break;}else{label=12;break;}
 case 2: 
 var $7=(($info+53)|0);
 HEAP8[(($7)>>0)]=1;
 var $8=(($info+4)|0);
 var $9=HEAP32[(($8)>>2)];
 var $10=($9|0)==($current_ptr|0);
 if($10){label=3;break;}else{label=13;break;}
 case 3: 
 var $12=(($info+52)|0);
 HEAP8[(($12)>>0)]=1;
 var $13=(($info+16)|0);
 var $14=HEAP32[(($13)>>2)];
 var $15=($14|0)==0;
 if($15){label=4;break;}else{label=6;break;}
 case 4: 
 HEAP32[(($13)>>2)]=$dst_ptr;
 var $17=(($info+24)|0);
 HEAP32[(($17)>>2)]=$path_below;
 var $18=(($info+36)|0);
 HEAP32[(($18)>>2)]=1;
 var $19=(($info+48)|0);
 var $20=HEAP32[(($19)>>2)];
 var $21=($20|0)==1;
 var $22=($path_below|0)==1;
 var $or_cond_i=$21&$22;
 if($or_cond_i){label=5;break;}else{label=13;break;}
 case 5: 
 var $24=(($info+54)|0);
 HEAP8[(($24)>>0)]=1;
 label=13;break;
 case 6: 
 var $26=($14|0)==($dst_ptr|0);
 if($26){label=7;break;}else{label=11;break;}
 case 7: 
 var $28=(($info+24)|0);
 var $29=HEAP32[(($28)>>2)];
 var $30=($29|0)==2;
 if($30){label=8;break;}else{var $33=$29;label=9;break;}
 case 8: 
 HEAP32[(($28)>>2)]=$path_below;
 var $33=$path_below;label=9;break;
 case 9: 
 var $33;
 var $34=(($info+48)|0);
 var $35=HEAP32[(($34)>>2)];
 var $36=($35|0)==1;
 var $37=($33|0)==1;
 var $or_cond1_i=$36&$37;
 if($or_cond1_i){label=10;break;}else{label=13;break;}
 case 10: 
 var $39=(($info+54)|0);
 HEAP8[(($39)>>0)]=1;
 label=13;break;
 case 11: 
 var $41=(($info+36)|0);
 var $42=HEAP32[(($41)>>2)];
 var $43=((($42)+(1))|0);
 HEAP32[(($41)>>2)]=$43;
 var $44=(($info+54)|0);
 HEAP8[(($44)>>0)]=1;
 label=13;break;
 case 12: 
 var $46=(($this+8)|0);
 var $47=HEAP32[(($46)>>2)];
 var $48=$47;
 var $49=HEAP32[(($48)>>2)];
 var $50=(($49+20)|0);
 var $51=HEAP32[(($50)>>2)];
 FUNCTION_TABLE[$51]($47,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp);
 label=13;break;
 case 13: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($info+8)|0);
 var $2=HEAP32[(($1)>>2)];
 var $3=($2|0)==($this|0);
 if($3){label=2;break;}else{label=12;break;}
 case 2: 
 var $5=(($info+53)|0);
 HEAP8[(($5)>>0)]=1;
 var $6=(($info+4)|0);
 var $7=HEAP32[(($6)>>2)];
 var $8=($7|0)==($current_ptr|0);
 if($8){label=3;break;}else{label=12;break;}
 case 3: 
 var $10=(($info+52)|0);
 HEAP8[(($10)>>0)]=1;
 var $11=(($info+16)|0);
 var $12=HEAP32[(($11)>>2)];
 var $13=($12|0)==0;
 if($13){label=4;break;}else{label=6;break;}
 case 4: 
 HEAP32[(($11)>>2)]=$dst_ptr;
 var $15=(($info+24)|0);
 HEAP32[(($15)>>2)]=$path_below;
 var $16=(($info+36)|0);
 HEAP32[(($16)>>2)]=1;
 var $17=(($info+48)|0);
 var $18=HEAP32[(($17)>>2)];
 var $19=($18|0)==1;
 var $20=($path_below|0)==1;
 var $or_cond_i=$19&$20;
 if($or_cond_i){label=5;break;}else{label=12;break;}
 case 5: 
 var $22=(($info+54)|0);
 HEAP8[(($22)>>0)]=1;
 label=12;break;
 case 6: 
 var $24=($12|0)==($dst_ptr|0);
 if($24){label=7;break;}else{label=11;break;}
 case 7: 
 var $26=(($info+24)|0);
 var $27=HEAP32[(($26)>>2)];
 var $28=($27|0)==2;
 if($28){label=8;break;}else{var $31=$27;label=9;break;}
 case 8: 
 HEAP32[(($26)>>2)]=$path_below;
 var $31=$path_below;label=9;break;
 case 9: 
 var $31;
 var $32=(($info+48)|0);
 var $33=HEAP32[(($32)>>2)];
 var $34=($33|0)==1;
 var $35=($31|0)==1;
 var $or_cond1_i=$34&$35;
 if($or_cond1_i){label=10;break;}else{label=12;break;}
 case 10: 
 var $37=(($info+54)|0);
 HEAP8[(($37)>>0)]=1;
 label=12;break;
 case 11: 
 var $39=(($info+36)|0);
 var $40=HEAP32[(($39)>>2)];
 var $41=((($40)+(1))|0);
 HEAP32[(($39)>>2)]=$41;
 var $42=(($info+54)|0);
 HEAP8[(($42)>>0)]=1;
 label=12;break;
 case 12: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function _malloc($bytes){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($bytes>>>0)<245;
 if($1){label=2;break;}else{label=78;break;}
 case 2: 
 var $3=($bytes>>>0)<11;
 if($3){var $8=16;label=4;break;}else{label=3;break;}
 case 3: 
 var $5=((($bytes)+(11))|0);
 var $6=$5&-8;
 var $8=$6;label=4;break;
 case 4: 
 var $8;
 var $9=$8>>>3;
 var $10=HEAP32[((4712)>>2)];
 var $11=$10>>>($9>>>0);
 var $12=$11&3;
 var $13=($12|0)==0;
 if($13){label=12;break;}else{label=5;break;}
 case 5: 
 var $15=$11&1;
 var $16=$15^1;
 var $17=((($16)+($9))|0);
 var $18=$17<<1;
 var $19=((4752+($18<<2))|0);
 var $20=$19;
 var $_sum11=((($18)+(2))|0);
 var $21=((4752+($_sum11<<2))|0);
 var $22=HEAP32[(($21)>>2)];
 var $23=(($22+8)|0);
 var $24=HEAP32[(($23)>>2)];
 var $25=($20|0)==($24|0);
 if($25){label=6;break;}else{label=7;break;}
 case 6: 
 var $27=1<<$17;
 var $28=$27^-1;
 var $29=$10&$28;
 HEAP32[((4712)>>2)]=$29;
 label=11;break;
 case 7: 
 var $31=$24;
 var $32=HEAP32[((4728)>>2)];
 var $33=($31>>>0)<($32>>>0);
 if($33){label=10;break;}else{label=8;break;}
 case 8: 
 var $35=(($24+12)|0);
 var $36=HEAP32[(($35)>>2)];
 var $37=($36|0)==($22|0);
 if($37){label=9;break;}else{label=10;break;}
 case 9: 
 HEAP32[(($35)>>2)]=$20;
 HEAP32[(($21)>>2)]=$24;
 label=11;break;
 case 10: 
 _abort();
 throw "Reached an unreachable!";
 case 11: 
 var $40=$17<<3;
 var $41=$40|3;
 var $42=(($22+4)|0);
 HEAP32[(($42)>>2)]=$41;
 var $43=$22;
 var $_sum1314=$40|4;
 var $44=(($43+$_sum1314)|0);
 var $45=$44;
 var $46=HEAP32[(($45)>>2)];
 var $47=$46|1;
 HEAP32[(($45)>>2)]=$47;
 var $48=$23;
 var $mem_0=$48;label=344;break;
 case 12: 
 var $50=HEAP32[((4720)>>2)];
 var $51=($8>>>0)>($50>>>0);
 if($51){label=13;break;}else{var $nb_0=$8;label=161;break;}
 case 13: 
 var $53=($11|0)==0;
 if($53){label=27;break;}else{label=14;break;}
 case 14: 
 var $55=$11<<$9;
 var $56=2<<$9;
 var $57=(((-$56))|0);
 var $58=$56|$57;
 var $59=$55&$58;
 var $60=(((-$59))|0);
 var $61=$59&$60;
 var $62=((($61)-(1))|0);
 var $63=$62>>>12;
 var $64=$63&16;
 var $65=$62>>>($64>>>0);
 var $66=$65>>>5;
 var $67=$66&8;
 var $68=$67|$64;
 var $69=$65>>>($67>>>0);
 var $70=$69>>>2;
 var $71=$70&4;
 var $72=$68|$71;
 var $73=$69>>>($71>>>0);
 var $74=$73>>>1;
 var $75=$74&2;
 var $76=$72|$75;
 var $77=$73>>>($75>>>0);
 var $78=$77>>>1;
 var $79=$78&1;
 var $80=$76|$79;
 var $81=$77>>>($79>>>0);
 var $82=((($80)+($81))|0);
 var $83=$82<<1;
 var $84=((4752+($83<<2))|0);
 var $85=$84;
 var $_sum4=((($83)+(2))|0);
 var $86=((4752+($_sum4<<2))|0);
 var $87=HEAP32[(($86)>>2)];
 var $88=(($87+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($85|0)==($89|0);
 if($90){label=15;break;}else{label=16;break;}
 case 15: 
 var $92=1<<$82;
 var $93=$92^-1;
 var $94=$10&$93;
 HEAP32[((4712)>>2)]=$94;
 label=20;break;
 case 16: 
 var $96=$89;
 var $97=HEAP32[((4728)>>2)];
 var $98=($96>>>0)<($97>>>0);
 if($98){label=19;break;}else{label=17;break;}
 case 17: 
 var $100=(($89+12)|0);
 var $101=HEAP32[(($100)>>2)];
 var $102=($101|0)==($87|0);
 if($102){label=18;break;}else{label=19;break;}
 case 18: 
 HEAP32[(($100)>>2)]=$85;
 HEAP32[(($86)>>2)]=$89;
 label=20;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 var $105=$82<<3;
 var $106=((($105)-($8))|0);
 var $107=$8|3;
 var $108=(($87+4)|0);
 HEAP32[(($108)>>2)]=$107;
 var $109=$87;
 var $110=(($109+$8)|0);
 var $111=$110;
 var $112=$106|1;
 var $_sum67=$8|4;
 var $113=(($109+$_sum67)|0);
 var $114=$113;
 HEAP32[(($114)>>2)]=$112;
 var $115=(($109+$105)|0);
 var $116=$115;
 HEAP32[(($116)>>2)]=$106;
 var $117=HEAP32[((4720)>>2)];
 var $118=($117|0)==0;
 if($118){label=26;break;}else{label=21;break;}
 case 21: 
 var $120=HEAP32[((4732)>>2)];
 var $121=$117>>>3;
 var $122=$121<<1;
 var $123=((4752+($122<<2))|0);
 var $124=$123;
 var $125=HEAP32[((4712)>>2)];
 var $126=1<<$121;
 var $127=$125&$126;
 var $128=($127|0)==0;
 if($128){label=22;break;}else{label=23;break;}
 case 22: 
 var $130=$125|$126;
 HEAP32[((4712)>>2)]=$130;
 var $_sum9_pre=((($122)+(2))|0);
 var $_pre=((4752+($_sum9_pre<<2))|0);
 var $F4_0=$124;var $_pre_phi=$_pre;label=25;break;
 case 23: 
 var $_sum10=((($122)+(2))|0);
 var $132=((4752+($_sum10<<2))|0);
 var $133=HEAP32[(($132)>>2)];
 var $134=$133;
 var $135=HEAP32[((4728)>>2)];
 var $136=($134>>>0)<($135>>>0);
 if($136){label=24;break;}else{var $F4_0=$133;var $_pre_phi=$132;label=25;break;}
 case 24: 
 _abort();
 throw "Reached an unreachable!";
 case 25: 
 var $_pre_phi;
 var $F4_0;
 HEAP32[(($_pre_phi)>>2)]=$120;
 var $139=(($F4_0+12)|0);
 HEAP32[(($139)>>2)]=$120;
 var $140=(($120+8)|0);
 HEAP32[(($140)>>2)]=$F4_0;
 var $141=(($120+12)|0);
 HEAP32[(($141)>>2)]=$124;
 label=26;break;
 case 26: 
 HEAP32[((4720)>>2)]=$106;
 HEAP32[((4732)>>2)]=$111;
 var $143=$88;
 var $mem_0=$143;label=344;break;
 case 27: 
 var $145=HEAP32[((4716)>>2)];
 var $146=($145|0)==0;
 if($146){var $nb_0=$8;label=161;break;}else{label=28;break;}
 case 28: 
 var $148=(((-$145))|0);
 var $149=$145&$148;
 var $150=((($149)-(1))|0);
 var $151=$150>>>12;
 var $152=$151&16;
 var $153=$150>>>($152>>>0);
 var $154=$153>>>5;
 var $155=$154&8;
 var $156=$155|$152;
 var $157=$153>>>($155>>>0);
 var $158=$157>>>2;
 var $159=$158&4;
 var $160=$156|$159;
 var $161=$157>>>($159>>>0);
 var $162=$161>>>1;
 var $163=$162&2;
 var $164=$160|$163;
 var $165=$161>>>($163>>>0);
 var $166=$165>>>1;
 var $167=$166&1;
 var $168=$164|$167;
 var $169=$165>>>($167>>>0);
 var $170=((($168)+($169))|0);
 var $171=((5016+($170<<2))|0);
 var $172=HEAP32[(($171)>>2)];
 var $173=(($172+4)|0);
 var $174=HEAP32[(($173)>>2)];
 var $175=$174&-8;
 var $176=((($175)-($8))|0);
 var $t_0_i=$172;var $v_0_i=$172;var $rsize_0_i=$176;label=29;break;
 case 29: 
 var $rsize_0_i;
 var $v_0_i;
 var $t_0_i;
 var $178=(($t_0_i+16)|0);
 var $179=HEAP32[(($178)>>2)];
 var $180=($179|0)==0;
 if($180){label=30;break;}else{var $185=$179;label=31;break;}
 case 30: 
 var $182=(($t_0_i+20)|0);
 var $183=HEAP32[(($182)>>2)];
 var $184=($183|0)==0;
 if($184){label=32;break;}else{var $185=$183;label=31;break;}
 case 31: 
 var $185;
 var $186=(($185+4)|0);
 var $187=HEAP32[(($186)>>2)];
 var $188=$187&-8;
 var $189=((($188)-($8))|0);
 var $190=($189>>>0)<($rsize_0_i>>>0);
 var $_rsize_0_i=($190?$189:$rsize_0_i);
 var $_v_0_i=($190?$185:$v_0_i);
 var $t_0_i=$185;var $v_0_i=$_v_0_i;var $rsize_0_i=$_rsize_0_i;label=29;break;
 case 32: 
 var $192=$v_0_i;
 var $193=HEAP32[((4728)>>2)];
 var $194=($192>>>0)<($193>>>0);
 if($194){label=76;break;}else{label=33;break;}
 case 33: 
 var $196=(($192+$8)|0);
 var $197=$196;
 var $198=($192>>>0)<($196>>>0);
 if($198){label=34;break;}else{label=76;break;}
 case 34: 
 var $200=(($v_0_i+24)|0);
 var $201=HEAP32[(($200)>>2)];
 var $202=(($v_0_i+12)|0);
 var $203=HEAP32[(($202)>>2)];
 var $204=($203|0)==($v_0_i|0);
 if($204){label=40;break;}else{label=35;break;}
 case 35: 
 var $206=(($v_0_i+8)|0);
 var $207=HEAP32[(($206)>>2)];
 var $208=$207;
 var $209=($208>>>0)<($193>>>0);
 if($209){label=39;break;}else{label=36;break;}
 case 36: 
 var $211=(($207+12)|0);
 var $212=HEAP32[(($211)>>2)];
 var $213=($212|0)==($v_0_i|0);
 if($213){label=37;break;}else{label=39;break;}
 case 37: 
 var $215=(($203+8)|0);
 var $216=HEAP32[(($215)>>2)];
 var $217=($216|0)==($v_0_i|0);
 if($217){label=38;break;}else{label=39;break;}
 case 38: 
 HEAP32[(($211)>>2)]=$203;
 HEAP32[(($215)>>2)]=$207;
 var $R_1_i=$203;label=47;break;
 case 39: 
 _abort();
 throw "Reached an unreachable!";
 case 40: 
 var $220=(($v_0_i+20)|0);
 var $221=HEAP32[(($220)>>2)];
 var $222=($221|0)==0;
 if($222){label=41;break;}else{var $R_0_i=$221;var $RP_0_i=$220;label=42;break;}
 case 41: 
 var $224=(($v_0_i+16)|0);
 var $225=HEAP32[(($224)>>2)];
 var $226=($225|0)==0;
 if($226){var $R_1_i=0;label=47;break;}else{var $R_0_i=$225;var $RP_0_i=$224;label=42;break;}
 case 42: 
 var $RP_0_i;
 var $R_0_i;
 var $227=(($R_0_i+20)|0);
 var $228=HEAP32[(($227)>>2)];
 var $229=($228|0)==0;
 if($229){label=43;break;}else{var $R_0_i=$228;var $RP_0_i=$227;label=42;break;}
 case 43: 
 var $231=(($R_0_i+16)|0);
 var $232=HEAP32[(($231)>>2)];
 var $233=($232|0)==0;
 if($233){label=44;break;}else{var $R_0_i=$232;var $RP_0_i=$231;label=42;break;}
 case 44: 
 var $235=$RP_0_i;
 var $236=($235>>>0)<($193>>>0);
 if($236){label=46;break;}else{label=45;break;}
 case 45: 
 HEAP32[(($RP_0_i)>>2)]=0;
 var $R_1_i=$R_0_i;label=47;break;
 case 46: 
 _abort();
 throw "Reached an unreachable!";
 case 47: 
 var $R_1_i;
 var $240=($201|0)==0;
 if($240){label=67;break;}else{label=48;break;}
 case 48: 
 var $242=(($v_0_i+28)|0);
 var $243=HEAP32[(($242)>>2)];
 var $244=((5016+($243<<2))|0);
 var $245=HEAP32[(($244)>>2)];
 var $246=($v_0_i|0)==($245|0);
 if($246){label=49;break;}else{label=51;break;}
 case 49: 
 HEAP32[(($244)>>2)]=$R_1_i;
 var $cond_i=($R_1_i|0)==0;
 if($cond_i){label=50;break;}else{label=57;break;}
 case 50: 
 var $248=1<<$243;
 var $249=$248^-1;
 var $250=HEAP32[((4716)>>2)];
 var $251=$250&$249;
 HEAP32[((4716)>>2)]=$251;
 label=67;break;
 case 51: 
 var $253=$201;
 var $254=HEAP32[((4728)>>2)];
 var $255=($253>>>0)<($254>>>0);
 if($255){label=55;break;}else{label=52;break;}
 case 52: 
 var $257=(($201+16)|0);
 var $258=HEAP32[(($257)>>2)];
 var $259=($258|0)==($v_0_i|0);
 if($259){label=53;break;}else{label=54;break;}
 case 53: 
 HEAP32[(($257)>>2)]=$R_1_i;
 label=56;break;
 case 54: 
 var $262=(($201+20)|0);
 HEAP32[(($262)>>2)]=$R_1_i;
 label=56;break;
 case 55: 
 _abort();
 throw "Reached an unreachable!";
 case 56: 
 var $265=($R_1_i|0)==0;
 if($265){label=67;break;}else{label=57;break;}
 case 57: 
 var $267=$R_1_i;
 var $268=HEAP32[((4728)>>2)];
 var $269=($267>>>0)<($268>>>0);
 if($269){label=66;break;}else{label=58;break;}
 case 58: 
 var $271=(($R_1_i+24)|0);
 HEAP32[(($271)>>2)]=$201;
 var $272=(($v_0_i+16)|0);
 var $273=HEAP32[(($272)>>2)];
 var $274=($273|0)==0;
 if($274){label=62;break;}else{label=59;break;}
 case 59: 
 var $276=$273;
 var $277=HEAP32[((4728)>>2)];
 var $278=($276>>>0)<($277>>>0);
 if($278){label=61;break;}else{label=60;break;}
 case 60: 
 var $280=(($R_1_i+16)|0);
 HEAP32[(($280)>>2)]=$273;
 var $281=(($273+24)|0);
 HEAP32[(($281)>>2)]=$R_1_i;
 label=62;break;
 case 61: 
 _abort();
 throw "Reached an unreachable!";
 case 62: 
 var $284=(($v_0_i+20)|0);
 var $285=HEAP32[(($284)>>2)];
 var $286=($285|0)==0;
 if($286){label=67;break;}else{label=63;break;}
 case 63: 
 var $288=$285;
 var $289=HEAP32[((4728)>>2)];
 var $290=($288>>>0)<($289>>>0);
 if($290){label=65;break;}else{label=64;break;}
 case 64: 
 var $292=(($R_1_i+20)|0);
 HEAP32[(($292)>>2)]=$285;
 var $293=(($285+24)|0);
 HEAP32[(($293)>>2)]=$R_1_i;
 label=67;break;
 case 65: 
 _abort();
 throw "Reached an unreachable!";
 case 66: 
 _abort();
 throw "Reached an unreachable!";
 case 67: 
 var $297=($rsize_0_i>>>0)<16;
 if($297){label=68;break;}else{label=69;break;}
 case 68: 
 var $299=((($rsize_0_i)+($8))|0);
 var $300=$299|3;
 var $301=(($v_0_i+4)|0);
 HEAP32[(($301)>>2)]=$300;
 var $_sum4_i=((($299)+(4))|0);
 var $302=(($192+$_sum4_i)|0);
 var $303=$302;
 var $304=HEAP32[(($303)>>2)];
 var $305=$304|1;
 HEAP32[(($303)>>2)]=$305;
 label=77;break;
 case 69: 
 var $307=$8|3;
 var $308=(($v_0_i+4)|0);
 HEAP32[(($308)>>2)]=$307;
 var $309=$rsize_0_i|1;
 var $_sum_i37=$8|4;
 var $310=(($192+$_sum_i37)|0);
 var $311=$310;
 HEAP32[(($311)>>2)]=$309;
 var $_sum1_i=((($rsize_0_i)+($8))|0);
 var $312=(($192+$_sum1_i)|0);
 var $313=$312;
 HEAP32[(($313)>>2)]=$rsize_0_i;
 var $314=HEAP32[((4720)>>2)];
 var $315=($314|0)==0;
 if($315){label=75;break;}else{label=70;break;}
 case 70: 
 var $317=HEAP32[((4732)>>2)];
 var $318=$314>>>3;
 var $319=$318<<1;
 var $320=((4752+($319<<2))|0);
 var $321=$320;
 var $322=HEAP32[((4712)>>2)];
 var $323=1<<$318;
 var $324=$322&$323;
 var $325=($324|0)==0;
 if($325){label=71;break;}else{label=72;break;}
 case 71: 
 var $327=$322|$323;
 HEAP32[((4712)>>2)]=$327;
 var $_sum2_pre_i=((($319)+(2))|0);
 var $_pre_i=((4752+($_sum2_pre_i<<2))|0);
 var $F1_0_i=$321;var $_pre_phi_i=$_pre_i;label=74;break;
 case 72: 
 var $_sum3_i=((($319)+(2))|0);
 var $329=((4752+($_sum3_i<<2))|0);
 var $330=HEAP32[(($329)>>2)];
 var $331=$330;
 var $332=HEAP32[((4728)>>2)];
 var $333=($331>>>0)<($332>>>0);
 if($333){label=73;break;}else{var $F1_0_i=$330;var $_pre_phi_i=$329;label=74;break;}
 case 73: 
 _abort();
 throw "Reached an unreachable!";
 case 74: 
 var $_pre_phi_i;
 var $F1_0_i;
 HEAP32[(($_pre_phi_i)>>2)]=$317;
 var $336=(($F1_0_i+12)|0);
 HEAP32[(($336)>>2)]=$317;
 var $337=(($317+8)|0);
 HEAP32[(($337)>>2)]=$F1_0_i;
 var $338=(($317+12)|0);
 HEAP32[(($338)>>2)]=$321;
 label=75;break;
 case 75: 
 HEAP32[((4720)>>2)]=$rsize_0_i;
 HEAP32[((4732)>>2)]=$197;
 label=77;break;
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $341=(($v_0_i+8)|0);
 var $342=$341;
 var $mem_0=$342;label=344;break;
 case 78: 
 var $344=($bytes>>>0)>4294967231;
 if($344){var $nb_0=-1;label=161;break;}else{label=79;break;}
 case 79: 
 var $346=((($bytes)+(11))|0);
 var $347=$346&-8;
 var $348=HEAP32[((4716)>>2)];
 var $349=($348|0)==0;
 if($349){var $nb_0=$347;label=161;break;}else{label=80;break;}
 case 80: 
 var $351=(((-$347))|0);
 var $352=$346>>>8;
 var $353=($352|0)==0;
 if($353){var $idx_0_i=0;label=83;break;}else{label=81;break;}
 case 81: 
 var $355=($347>>>0)>16777215;
 if($355){var $idx_0_i=31;label=83;break;}else{label=82;break;}
 case 82: 
 var $357=((($352)+(1048320))|0);
 var $358=$357>>>16;
 var $359=$358&8;
 var $360=$352<<$359;
 var $361=((($360)+(520192))|0);
 var $362=$361>>>16;
 var $363=$362&4;
 var $364=$363|$359;
 var $365=$360<<$363;
 var $366=((($365)+(245760))|0);
 var $367=$366>>>16;
 var $368=$367&2;
 var $369=$364|$368;
 var $370=(((14)-($369))|0);
 var $371=$365<<$368;
 var $372=$371>>>15;
 var $373=((($370)+($372))|0);
 var $374=$373<<1;
 var $375=((($373)+(7))|0);
 var $376=$347>>>($375>>>0);
 var $377=$376&1;
 var $378=$377|$374;
 var $idx_0_i=$378;label=83;break;
 case 83: 
 var $idx_0_i;
 var $380=((5016+($idx_0_i<<2))|0);
 var $381=HEAP32[(($380)>>2)];
 var $382=($381|0)==0;
 if($382){var $v_2_i=0;var $rsize_2_i=$351;var $t_1_i=0;label=90;break;}else{label=84;break;}
 case 84: 
 var $384=($idx_0_i|0)==31;
 if($384){var $389=0;label=86;break;}else{label=85;break;}
 case 85: 
 var $386=$idx_0_i>>>1;
 var $387=(((25)-($386))|0);
 var $389=$387;label=86;break;
 case 86: 
 var $389;
 var $390=$347<<$389;
 var $v_0_i18=0;var $rsize_0_i17=$351;var $t_0_i16=$381;var $sizebits_0_i=$390;var $rst_0_i=0;label=87;break;
 case 87: 
 var $rst_0_i;
 var $sizebits_0_i;
 var $t_0_i16;
 var $rsize_0_i17;
 var $v_0_i18;
 var $392=(($t_0_i16+4)|0);
 var $393=HEAP32[(($392)>>2)];
 var $394=$393&-8;
 var $395=((($394)-($347))|0);
 var $396=($395>>>0)<($rsize_0_i17>>>0);
 if($396){label=88;break;}else{var $v_1_i=$v_0_i18;var $rsize_1_i=$rsize_0_i17;label=89;break;}
 case 88: 
 var $398=($394|0)==($347|0);
 if($398){var $v_2_i=$t_0_i16;var $rsize_2_i=$395;var $t_1_i=$t_0_i16;label=90;break;}else{var $v_1_i=$t_0_i16;var $rsize_1_i=$395;label=89;break;}
 case 89: 
 var $rsize_1_i;
 var $v_1_i;
 var $400=(($t_0_i16+20)|0);
 var $401=HEAP32[(($400)>>2)];
 var $402=$sizebits_0_i>>>31;
 var $403=(($t_0_i16+16+($402<<2))|0);
 var $404=HEAP32[(($403)>>2)];
 var $405=($401|0)==0;
 var $406=($401|0)==($404|0);
 var $or_cond_i=$405|$406;
 var $rst_1_i=($or_cond_i?$rst_0_i:$401);
 var $407=($404|0)==0;
 var $408=$sizebits_0_i<<1;
 if($407){var $v_2_i=$v_1_i;var $rsize_2_i=$rsize_1_i;var $t_1_i=$rst_1_i;label=90;break;}else{var $v_0_i18=$v_1_i;var $rsize_0_i17=$rsize_1_i;var $t_0_i16=$404;var $sizebits_0_i=$408;var $rst_0_i=$rst_1_i;label=87;break;}
 case 90: 
 var $t_1_i;
 var $rsize_2_i;
 var $v_2_i;
 var $409=($t_1_i|0)==0;
 var $410=($v_2_i|0)==0;
 var $or_cond21_i=$409&$410;
 if($or_cond21_i){label=91;break;}else{var $t_2_ph_i=$t_1_i;label=93;break;}
 case 91: 
 var $412=2<<$idx_0_i;
 var $413=(((-$412))|0);
 var $414=$412|$413;
 var $415=$348&$414;
 var $416=($415|0)==0;
 if($416){var $nb_0=$347;label=161;break;}else{label=92;break;}
 case 92: 
 var $418=(((-$415))|0);
 var $419=$415&$418;
 var $420=((($419)-(1))|0);
 var $421=$420>>>12;
 var $422=$421&16;
 var $423=$420>>>($422>>>0);
 var $424=$423>>>5;
 var $425=$424&8;
 var $426=$425|$422;
 var $427=$423>>>($425>>>0);
 var $428=$427>>>2;
 var $429=$428&4;
 var $430=$426|$429;
 var $431=$427>>>($429>>>0);
 var $432=$431>>>1;
 var $433=$432&2;
 var $434=$430|$433;
 var $435=$431>>>($433>>>0);
 var $436=$435>>>1;
 var $437=$436&1;
 var $438=$434|$437;
 var $439=$435>>>($437>>>0);
 var $440=((($438)+($439))|0);
 var $441=((5016+($440<<2))|0);
 var $442=HEAP32[(($441)>>2)];
 var $t_2_ph_i=$442;label=93;break;
 case 93: 
 var $t_2_ph_i;
 var $443=($t_2_ph_i|0)==0;
 if($443){var $rsize_3_lcssa_i=$rsize_2_i;var $v_3_lcssa_i=$v_2_i;label=96;break;}else{var $t_230_i=$t_2_ph_i;var $rsize_331_i=$rsize_2_i;var $v_332_i=$v_2_i;label=94;break;}
 case 94: 
 var $v_332_i;
 var $rsize_331_i;
 var $t_230_i;
 var $444=(($t_230_i+4)|0);
 var $445=HEAP32[(($444)>>2)];
 var $446=$445&-8;
 var $447=((($446)-($347))|0);
 var $448=($447>>>0)<($rsize_331_i>>>0);
 var $_rsize_3_i=($448?$447:$rsize_331_i);
 var $t_2_v_3_i=($448?$t_230_i:$v_332_i);
 var $449=(($t_230_i+16)|0);
 var $450=HEAP32[(($449)>>2)];
 var $451=($450|0)==0;
 if($451){label=95;break;}else{var $t_230_i=$450;var $rsize_331_i=$_rsize_3_i;var $v_332_i=$t_2_v_3_i;label=94;break;}
 case 95: 
 var $452=(($t_230_i+20)|0);
 var $453=HEAP32[(($452)>>2)];
 var $454=($453|0)==0;
 if($454){var $rsize_3_lcssa_i=$_rsize_3_i;var $v_3_lcssa_i=$t_2_v_3_i;label=96;break;}else{var $t_230_i=$453;var $rsize_331_i=$_rsize_3_i;var $v_332_i=$t_2_v_3_i;label=94;break;}
 case 96: 
 var $v_3_lcssa_i;
 var $rsize_3_lcssa_i;
 var $455=($v_3_lcssa_i|0)==0;
 if($455){var $nb_0=$347;label=161;break;}else{label=97;break;}
 case 97: 
 var $457=HEAP32[((4720)>>2)];
 var $458=((($457)-($347))|0);
 var $459=($rsize_3_lcssa_i>>>0)<($458>>>0);
 if($459){label=98;break;}else{var $nb_0=$347;label=161;break;}
 case 98: 
 var $461=$v_3_lcssa_i;
 var $462=HEAP32[((4728)>>2)];
 var $463=($461>>>0)<($462>>>0);
 if($463){label=159;break;}else{label=99;break;}
 case 99: 
 var $465=(($461+$347)|0);
 var $466=$465;
 var $467=($461>>>0)<($465>>>0);
 if($467){label=100;break;}else{label=159;break;}
 case 100: 
 var $469=(($v_3_lcssa_i+24)|0);
 var $470=HEAP32[(($469)>>2)];
 var $471=(($v_3_lcssa_i+12)|0);
 var $472=HEAP32[(($471)>>2)];
 var $473=($472|0)==($v_3_lcssa_i|0);
 if($473){label=106;break;}else{label=101;break;}
 case 101: 
 var $475=(($v_3_lcssa_i+8)|0);
 var $476=HEAP32[(($475)>>2)];
 var $477=$476;
 var $478=($477>>>0)<($462>>>0);
 if($478){label=105;break;}else{label=102;break;}
 case 102: 
 var $480=(($476+12)|0);
 var $481=HEAP32[(($480)>>2)];
 var $482=($481|0)==($v_3_lcssa_i|0);
 if($482){label=103;break;}else{label=105;break;}
 case 103: 
 var $484=(($472+8)|0);
 var $485=HEAP32[(($484)>>2)];
 var $486=($485|0)==($v_3_lcssa_i|0);
 if($486){label=104;break;}else{label=105;break;}
 case 104: 
 HEAP32[(($480)>>2)]=$472;
 HEAP32[(($484)>>2)]=$476;
 var $R_1_i22=$472;label=113;break;
 case 105: 
 _abort();
 throw "Reached an unreachable!";
 case 106: 
 var $489=(($v_3_lcssa_i+20)|0);
 var $490=HEAP32[(($489)>>2)];
 var $491=($490|0)==0;
 if($491){label=107;break;}else{var $R_0_i20=$490;var $RP_0_i19=$489;label=108;break;}
 case 107: 
 var $493=(($v_3_lcssa_i+16)|0);
 var $494=HEAP32[(($493)>>2)];
 var $495=($494|0)==0;
 if($495){var $R_1_i22=0;label=113;break;}else{var $R_0_i20=$494;var $RP_0_i19=$493;label=108;break;}
 case 108: 
 var $RP_0_i19;
 var $R_0_i20;
 var $496=(($R_0_i20+20)|0);
 var $497=HEAP32[(($496)>>2)];
 var $498=($497|0)==0;
 if($498){label=109;break;}else{var $R_0_i20=$497;var $RP_0_i19=$496;label=108;break;}
 case 109: 
 var $500=(($R_0_i20+16)|0);
 var $501=HEAP32[(($500)>>2)];
 var $502=($501|0)==0;
 if($502){label=110;break;}else{var $R_0_i20=$501;var $RP_0_i19=$500;label=108;break;}
 case 110: 
 var $504=$RP_0_i19;
 var $505=($504>>>0)<($462>>>0);
 if($505){label=112;break;}else{label=111;break;}
 case 111: 
 HEAP32[(($RP_0_i19)>>2)]=0;
 var $R_1_i22=$R_0_i20;label=113;break;
 case 112: 
 _abort();
 throw "Reached an unreachable!";
 case 113: 
 var $R_1_i22;
 var $509=($470|0)==0;
 if($509){label=133;break;}else{label=114;break;}
 case 114: 
 var $511=(($v_3_lcssa_i+28)|0);
 var $512=HEAP32[(($511)>>2)];
 var $513=((5016+($512<<2))|0);
 var $514=HEAP32[(($513)>>2)];
 var $515=($v_3_lcssa_i|0)==($514|0);
 if($515){label=115;break;}else{label=117;break;}
 case 115: 
 HEAP32[(($513)>>2)]=$R_1_i22;
 var $cond_i23=($R_1_i22|0)==0;
 if($cond_i23){label=116;break;}else{label=123;break;}
 case 116: 
 var $517=1<<$512;
 var $518=$517^-1;
 var $519=HEAP32[((4716)>>2)];
 var $520=$519&$518;
 HEAP32[((4716)>>2)]=$520;
 label=133;break;
 case 117: 
 var $522=$470;
 var $523=HEAP32[((4728)>>2)];
 var $524=($522>>>0)<($523>>>0);
 if($524){label=121;break;}else{label=118;break;}
 case 118: 
 var $526=(($470+16)|0);
 var $527=HEAP32[(($526)>>2)];
 var $528=($527|0)==($v_3_lcssa_i|0);
 if($528){label=119;break;}else{label=120;break;}
 case 119: 
 HEAP32[(($526)>>2)]=$R_1_i22;
 label=122;break;
 case 120: 
 var $531=(($470+20)|0);
 HEAP32[(($531)>>2)]=$R_1_i22;
 label=122;break;
 case 121: 
 _abort();
 throw "Reached an unreachable!";
 case 122: 
 var $534=($R_1_i22|0)==0;
 if($534){label=133;break;}else{label=123;break;}
 case 123: 
 var $536=$R_1_i22;
 var $537=HEAP32[((4728)>>2)];
 var $538=($536>>>0)<($537>>>0);
 if($538){label=132;break;}else{label=124;break;}
 case 124: 
 var $540=(($R_1_i22+24)|0);
 HEAP32[(($540)>>2)]=$470;
 var $541=(($v_3_lcssa_i+16)|0);
 var $542=HEAP32[(($541)>>2)];
 var $543=($542|0)==0;
 if($543){label=128;break;}else{label=125;break;}
 case 125: 
 var $545=$542;
 var $546=HEAP32[((4728)>>2)];
 var $547=($545>>>0)<($546>>>0);
 if($547){label=127;break;}else{label=126;break;}
 case 126: 
 var $549=(($R_1_i22+16)|0);
 HEAP32[(($549)>>2)]=$542;
 var $550=(($542+24)|0);
 HEAP32[(($550)>>2)]=$R_1_i22;
 label=128;break;
 case 127: 
 _abort();
 throw "Reached an unreachable!";
 case 128: 
 var $553=(($v_3_lcssa_i+20)|0);
 var $554=HEAP32[(($553)>>2)];
 var $555=($554|0)==0;
 if($555){label=133;break;}else{label=129;break;}
 case 129: 
 var $557=$554;
 var $558=HEAP32[((4728)>>2)];
 var $559=($557>>>0)<($558>>>0);
 if($559){label=131;break;}else{label=130;break;}
 case 130: 
 var $561=(($R_1_i22+20)|0);
 HEAP32[(($561)>>2)]=$554;
 var $562=(($554+24)|0);
 HEAP32[(($562)>>2)]=$R_1_i22;
 label=133;break;
 case 131: 
 _abort();
 throw "Reached an unreachable!";
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 var $566=($rsize_3_lcssa_i>>>0)<16;
 if($566){label=134;break;}else{label=135;break;}
 case 134: 
 var $568=((($rsize_3_lcssa_i)+($347))|0);
 var $569=$568|3;
 var $570=(($v_3_lcssa_i+4)|0);
 HEAP32[(($570)>>2)]=$569;
 var $_sum19_i=((($568)+(4))|0);
 var $571=(($461+$_sum19_i)|0);
 var $572=$571;
 var $573=HEAP32[(($572)>>2)];
 var $574=$573|1;
 HEAP32[(($572)>>2)]=$574;
 label=160;break;
 case 135: 
 var $576=$347|3;
 var $577=(($v_3_lcssa_i+4)|0);
 HEAP32[(($577)>>2)]=$576;
 var $578=$rsize_3_lcssa_i|1;
 var $_sum_i2536=$347|4;
 var $579=(($461+$_sum_i2536)|0);
 var $580=$579;
 HEAP32[(($580)>>2)]=$578;
 var $_sum1_i26=((($rsize_3_lcssa_i)+($347))|0);
 var $581=(($461+$_sum1_i26)|0);
 var $582=$581;
 HEAP32[(($582)>>2)]=$rsize_3_lcssa_i;
 var $583=$rsize_3_lcssa_i>>>3;
 var $584=($rsize_3_lcssa_i>>>0)<256;
 if($584){label=136;break;}else{label=141;break;}
 case 136: 
 var $586=$583<<1;
 var $587=((4752+($586<<2))|0);
 var $588=$587;
 var $589=HEAP32[((4712)>>2)];
 var $590=1<<$583;
 var $591=$589&$590;
 var $592=($591|0)==0;
 if($592){label=137;break;}else{label=138;break;}
 case 137: 
 var $594=$589|$590;
 HEAP32[((4712)>>2)]=$594;
 var $_sum15_pre_i=((($586)+(2))|0);
 var $_pre_i27=((4752+($_sum15_pre_i<<2))|0);
 var $F5_0_i=$588;var $_pre_phi_i28=$_pre_i27;label=140;break;
 case 138: 
 var $_sum18_i=((($586)+(2))|0);
 var $596=((4752+($_sum18_i<<2))|0);
 var $597=HEAP32[(($596)>>2)];
 var $598=$597;
 var $599=HEAP32[((4728)>>2)];
 var $600=($598>>>0)<($599>>>0);
 if($600){label=139;break;}else{var $F5_0_i=$597;var $_pre_phi_i28=$596;label=140;break;}
 case 139: 
 _abort();
 throw "Reached an unreachable!";
 case 140: 
 var $_pre_phi_i28;
 var $F5_0_i;
 HEAP32[(($_pre_phi_i28)>>2)]=$466;
 var $603=(($F5_0_i+12)|0);
 HEAP32[(($603)>>2)]=$466;
 var $_sum16_i=((($347)+(8))|0);
 var $604=(($461+$_sum16_i)|0);
 var $605=$604;
 HEAP32[(($605)>>2)]=$F5_0_i;
 var $_sum17_i=((($347)+(12))|0);
 var $606=(($461+$_sum17_i)|0);
 var $607=$606;
 HEAP32[(($607)>>2)]=$588;
 label=160;break;
 case 141: 
 var $609=$465;
 var $610=$rsize_3_lcssa_i>>>8;
 var $611=($610|0)==0;
 if($611){var $I7_0_i=0;label=144;break;}else{label=142;break;}
 case 142: 
 var $613=($rsize_3_lcssa_i>>>0)>16777215;
 if($613){var $I7_0_i=31;label=144;break;}else{label=143;break;}
 case 143: 
 var $615=((($610)+(1048320))|0);
 var $616=$615>>>16;
 var $617=$616&8;
 var $618=$610<<$617;
 var $619=((($618)+(520192))|0);
 var $620=$619>>>16;
 var $621=$620&4;
 var $622=$621|$617;
 var $623=$618<<$621;
 var $624=((($623)+(245760))|0);
 var $625=$624>>>16;
 var $626=$625&2;
 var $627=$622|$626;
 var $628=(((14)-($627))|0);
 var $629=$623<<$626;
 var $630=$629>>>15;
 var $631=((($628)+($630))|0);
 var $632=$631<<1;
 var $633=((($631)+(7))|0);
 var $634=$rsize_3_lcssa_i>>>($633>>>0);
 var $635=$634&1;
 var $636=$635|$632;
 var $I7_0_i=$636;label=144;break;
 case 144: 
 var $I7_0_i;
 var $638=((5016+($I7_0_i<<2))|0);
 var $_sum2_i=((($347)+(28))|0);
 var $639=(($461+$_sum2_i)|0);
 var $640=$639;
 HEAP32[(($640)>>2)]=$I7_0_i;
 var $_sum3_i29=((($347)+(16))|0);
 var $641=(($461+$_sum3_i29)|0);
 var $_sum4_i30=((($347)+(20))|0);
 var $642=(($461+$_sum4_i30)|0);
 var $643=$642;
 HEAP32[(($643)>>2)]=0;
 var $644=$641;
 HEAP32[(($644)>>2)]=0;
 var $645=HEAP32[((4716)>>2)];
 var $646=1<<$I7_0_i;
 var $647=$645&$646;
 var $648=($647|0)==0;
 if($648){label=145;break;}else{label=146;break;}
 case 145: 
 var $650=$645|$646;
 HEAP32[((4716)>>2)]=$650;
 HEAP32[(($638)>>2)]=$609;
 var $651=$638;
 var $_sum5_i=((($347)+(24))|0);
 var $652=(($461+$_sum5_i)|0);
 var $653=$652;
 HEAP32[(($653)>>2)]=$651;
 var $_sum6_i=((($347)+(12))|0);
 var $654=(($461+$_sum6_i)|0);
 var $655=$654;
 HEAP32[(($655)>>2)]=$609;
 var $_sum7_i=((($347)+(8))|0);
 var $656=(($461+$_sum7_i)|0);
 var $657=$656;
 HEAP32[(($657)>>2)]=$609;
 label=160;break;
 case 146: 
 var $659=HEAP32[(($638)>>2)];
 var $660=($I7_0_i|0)==31;
 if($660){var $665=0;label=148;break;}else{label=147;break;}
 case 147: 
 var $662=$I7_0_i>>>1;
 var $663=(((25)-($662))|0);
 var $665=$663;label=148;break;
 case 148: 
 var $665;
 var $666=(($659+4)|0);
 var $667=HEAP32[(($666)>>2)];
 var $668=$667&-8;
 var $669=($668|0)==($rsize_3_lcssa_i|0);
 if($669){var $T_0_lcssa_i=$659;label=155;break;}else{label=149;break;}
 case 149: 
 var $670=$rsize_3_lcssa_i<<$665;
 var $T_026_i=$659;var $K12_027_i=$670;label=151;break;
 case 150: 
 var $672=$K12_027_i<<1;
 var $673=(($680+4)|0);
 var $674=HEAP32[(($673)>>2)];
 var $675=$674&-8;
 var $676=($675|0)==($rsize_3_lcssa_i|0);
 if($676){var $T_0_lcssa_i=$680;label=155;break;}else{var $T_026_i=$680;var $K12_027_i=$672;label=151;break;}
 case 151: 
 var $K12_027_i;
 var $T_026_i;
 var $678=$K12_027_i>>>31;
 var $679=(($T_026_i+16+($678<<2))|0);
 var $680=HEAP32[(($679)>>2)];
 var $681=($680|0)==0;
 if($681){label=152;break;}else{label=150;break;}
 case 152: 
 var $683=$679;
 var $684=HEAP32[((4728)>>2)];
 var $685=($683>>>0)<($684>>>0);
 if($685){label=154;break;}else{label=153;break;}
 case 153: 
 HEAP32[(($679)>>2)]=$609;
 var $_sum12_i=((($347)+(24))|0);
 var $687=(($461+$_sum12_i)|0);
 var $688=$687;
 HEAP32[(($688)>>2)]=$T_026_i;
 var $_sum13_i=((($347)+(12))|0);
 var $689=(($461+$_sum13_i)|0);
 var $690=$689;
 HEAP32[(($690)>>2)]=$609;
 var $_sum14_i=((($347)+(8))|0);
 var $691=(($461+$_sum14_i)|0);
 var $692=$691;
 HEAP32[(($692)>>2)]=$609;
 label=160;break;
 case 154: 
 _abort();
 throw "Reached an unreachable!";
 case 155: 
 var $T_0_lcssa_i;
 var $694=(($T_0_lcssa_i+8)|0);
 var $695=HEAP32[(($694)>>2)];
 var $696=$T_0_lcssa_i;
 var $697=HEAP32[((4728)>>2)];
 var $698=($696>>>0)<($697>>>0);
 if($698){label=158;break;}else{label=156;break;}
 case 156: 
 var $700=$695;
 var $701=($700>>>0)<($697>>>0);
 if($701){label=158;break;}else{label=157;break;}
 case 157: 
 var $703=(($695+12)|0);
 HEAP32[(($703)>>2)]=$609;
 HEAP32[(($694)>>2)]=$609;
 var $_sum9_i=((($347)+(8))|0);
 var $704=(($461+$_sum9_i)|0);
 var $705=$704;
 HEAP32[(($705)>>2)]=$695;
 var $_sum10_i=((($347)+(12))|0);
 var $706=(($461+$_sum10_i)|0);
 var $707=$706;
 HEAP32[(($707)>>2)]=$T_0_lcssa_i;
 var $_sum11_i=((($347)+(24))|0);
 var $708=(($461+$_sum11_i)|0);
 var $709=$708;
 HEAP32[(($709)>>2)]=0;
 label=160;break;
 case 158: 
 _abort();
 throw "Reached an unreachable!";
 case 159: 
 _abort();
 throw "Reached an unreachable!";
 case 160: 
 var $711=(($v_3_lcssa_i+8)|0);
 var $712=$711;
 var $mem_0=$712;label=344;break;
 case 161: 
 var $nb_0;
 var $713=HEAP32[((4720)>>2)];
 var $714=($nb_0>>>0)>($713>>>0);
 if($714){label=166;break;}else{label=162;break;}
 case 162: 
 var $716=((($713)-($nb_0))|0);
 var $717=HEAP32[((4732)>>2)];
 var $718=($716>>>0)>15;
 if($718){label=163;break;}else{label=164;break;}
 case 163: 
 var $720=$717;
 var $721=(($720+$nb_0)|0);
 var $722=$721;
 HEAP32[((4732)>>2)]=$722;
 HEAP32[((4720)>>2)]=$716;
 var $723=$716|1;
 var $_sum2=((($nb_0)+(4))|0);
 var $724=(($720+$_sum2)|0);
 var $725=$724;
 HEAP32[(($725)>>2)]=$723;
 var $726=(($720+$713)|0);
 var $727=$726;
 HEAP32[(($727)>>2)]=$716;
 var $728=$nb_0|3;
 var $729=(($717+4)|0);
 HEAP32[(($729)>>2)]=$728;
 label=165;break;
 case 164: 
 HEAP32[((4720)>>2)]=0;
 HEAP32[((4732)>>2)]=0;
 var $731=$713|3;
 var $732=(($717+4)|0);
 HEAP32[(($732)>>2)]=$731;
 var $733=$717;
 var $_sum1=((($713)+(4))|0);
 var $734=(($733+$_sum1)|0);
 var $735=$734;
 var $736=HEAP32[(($735)>>2)];
 var $737=$736|1;
 HEAP32[(($735)>>2)]=$737;
 label=165;break;
 case 165: 
 var $739=(($717+8)|0);
 var $740=$739;
 var $mem_0=$740;label=344;break;
 case 166: 
 var $742=HEAP32[((4724)>>2)];
 var $743=($nb_0>>>0)<($742>>>0);
 if($743){label=167;break;}else{label=168;break;}
 case 167: 
 var $745=((($742)-($nb_0))|0);
 HEAP32[((4724)>>2)]=$745;
 var $746=HEAP32[((4736)>>2)];
 var $747=$746;
 var $748=(($747+$nb_0)|0);
 var $749=$748;
 HEAP32[((4736)>>2)]=$749;
 var $750=$745|1;
 var $_sum=((($nb_0)+(4))|0);
 var $751=(($747+$_sum)|0);
 var $752=$751;
 HEAP32[(($752)>>2)]=$750;
 var $753=$nb_0|3;
 var $754=(($746+4)|0);
 HEAP32[(($754)>>2)]=$753;
 var $755=(($746+8)|0);
 var $756=$755;
 var $mem_0=$756;label=344;break;
 case 168: 
 var $758=HEAP32[((4680)>>2)];
 var $759=($758|0)==0;
 if($759){label=169;break;}else{label=172;break;}
 case 169: 
 var $761=_sysconf(30);
 var $762=((($761)-(1))|0);
 var $763=$762&$761;
 var $764=($763|0)==0;
 if($764){label=171;break;}else{label=170;break;}
 case 170: 
 _abort();
 throw "Reached an unreachable!";
 case 171: 
 HEAP32[((4688)>>2)]=$761;
 HEAP32[((4684)>>2)]=$761;
 HEAP32[((4692)>>2)]=-1;
 HEAP32[((4696)>>2)]=-1;
 HEAP32[((4700)>>2)]=0;
 HEAP32[((5156)>>2)]=0;
 var $766=_time(0);
 var $767=$766&-16;
 var $768=$767^1431655768;
 HEAP32[((4680)>>2)]=$768;
 label=172;break;
 case 172: 
 var $770=((($nb_0)+(48))|0);
 var $771=HEAP32[((4688)>>2)];
 var $772=((($nb_0)+(47))|0);
 var $773=((($771)+($772))|0);
 var $774=(((-$771))|0);
 var $775=$773&$774;
 var $776=($775>>>0)>($nb_0>>>0);
 if($776){label=173;break;}else{var $mem_0=0;label=344;break;}
 case 173: 
 var $778=HEAP32[((5152)>>2)];
 var $779=($778|0)==0;
 if($779){label=175;break;}else{label=174;break;}
 case 174: 
 var $781=HEAP32[((5144)>>2)];
 var $782=((($781)+($775))|0);
 var $783=($782>>>0)<=($781>>>0);
 var $784=($782>>>0)>($778>>>0);
 var $or_cond1_i=$783|$784;
 if($or_cond1_i){var $mem_0=0;label=344;break;}else{label=175;break;}
 case 175: 
 var $786=HEAP32[((5156)>>2)];
 var $787=$786&4;
 var $788=($787|0)==0;
 if($788){label=176;break;}else{var $tsize_1_i=0;label=199;break;}
 case 176: 
 var $790=HEAP32[((4736)>>2)];
 var $791=($790|0)==0;
 if($791){label=182;break;}else{label=177;break;}
 case 177: 
 var $793=$790;
 var $sp_0_i_i=5160;label=178;break;
 case 178: 
 var $sp_0_i_i;
 var $795=(($sp_0_i_i)|0);
 var $796=HEAP32[(($795)>>2)];
 var $797=($796>>>0)>($793>>>0);
 if($797){label=180;break;}else{label=179;break;}
 case 179: 
 var $799=(($sp_0_i_i+4)|0);
 var $800=HEAP32[(($799)>>2)];
 var $801=(($796+$800)|0);
 var $802=($801>>>0)>($793>>>0);
 if($802){label=181;break;}else{label=180;break;}
 case 180: 
 var $804=(($sp_0_i_i+8)|0);
 var $805=HEAP32[(($804)>>2)];
 var $806=($805|0)==0;
 if($806){label=182;break;}else{var $sp_0_i_i=$805;label=178;break;}
 case 181: 
 var $807=($sp_0_i_i|0)==0;
 if($807){label=182;break;}else{label=189;break;}
 case 182: 
 var $808=_sbrk(0);
 var $809=($808|0)==-1;
 if($809){var $tsize_0323841_i=0;label=198;break;}else{label=183;break;}
 case 183: 
 var $811=$808;
 var $812=HEAP32[((4684)>>2)];
 var $813=((($812)-(1))|0);
 var $814=$813&$811;
 var $815=($814|0)==0;
 if($815){var $ssize_0_i=$775;label=185;break;}else{label=184;break;}
 case 184: 
 var $817=((($813)+($811))|0);
 var $818=(((-$812))|0);
 var $819=$817&$818;
 var $820=((($775)-($811))|0);
 var $821=((($820)+($819))|0);
 var $ssize_0_i=$821;label=185;break;
 case 185: 
 var $ssize_0_i;
 var $823=HEAP32[((5144)>>2)];
 var $824=((($823)+($ssize_0_i))|0);
 var $825=($ssize_0_i>>>0)>($nb_0>>>0);
 var $826=($ssize_0_i>>>0)<2147483647;
 var $or_cond_i31=$825&$826;
 if($or_cond_i31){label=186;break;}else{var $tsize_0323841_i=0;label=198;break;}
 case 186: 
 var $828=HEAP32[((5152)>>2)];
 var $829=($828|0)==0;
 if($829){label=188;break;}else{label=187;break;}
 case 187: 
 var $831=($824>>>0)<=($823>>>0);
 var $832=($824>>>0)>($828>>>0);
 var $or_cond2_i=$831|$832;
 if($or_cond2_i){var $tsize_0323841_i=0;label=198;break;}else{label=188;break;}
 case 188: 
 var $834=_sbrk($ssize_0_i);
 var $835=($834|0)==($808|0);
 var $ssize_0__i=($835?$ssize_0_i:0);
 var $__i=($835?$808:-1);
 var $tbase_0_i=$__i;var $tsize_0_i=$ssize_0__i;var $br_0_i=$834;var $ssize_1_i=$ssize_0_i;label=191;break;
 case 189: 
 var $837=HEAP32[((4724)>>2)];
 var $838=((($773)-($837))|0);
 var $839=$838&$774;
 var $840=($839>>>0)<2147483647;
 if($840){label=190;break;}else{var $tsize_0323841_i=0;label=198;break;}
 case 190: 
 var $842=_sbrk($839);
 var $843=HEAP32[(($795)>>2)];
 var $844=HEAP32[(($799)>>2)];
 var $845=(($843+$844)|0);
 var $846=($842|0)==($845|0);
 var $_3_i=($846?$839:0);
 var $_4_i=($846?$842:-1);
 var $tbase_0_i=$_4_i;var $tsize_0_i=$_3_i;var $br_0_i=$842;var $ssize_1_i=$839;label=191;break;
 case 191: 
 var $ssize_1_i;
 var $br_0_i;
 var $tsize_0_i;
 var $tbase_0_i;
 var $848=(((-$ssize_1_i))|0);
 var $849=($tbase_0_i|0)==-1;
 if($849){label=192;break;}else{var $tsize_246_i=$tsize_0_i;var $tbase_247_i=$tbase_0_i;label=202;break;}
 case 192: 
 var $851=($br_0_i|0)!=-1;
 var $852=($ssize_1_i>>>0)<2147483647;
 var $or_cond5_i=$851&$852;
 var $853=($ssize_1_i>>>0)<($770>>>0);
 var $or_cond6_i=$or_cond5_i&$853;
 if($or_cond6_i){label=193;break;}else{var $ssize_2_i=$ssize_1_i;label=197;break;}
 case 193: 
 var $855=HEAP32[((4688)>>2)];
 var $856=((($772)-($ssize_1_i))|0);
 var $857=((($856)+($855))|0);
 var $858=(((-$855))|0);
 var $859=$857&$858;
 var $860=($859>>>0)<2147483647;
 if($860){label=194;break;}else{var $ssize_2_i=$ssize_1_i;label=197;break;}
 case 194: 
 var $862=_sbrk($859);
 var $863=($862|0)==-1;
 if($863){label=196;break;}else{label=195;break;}
 case 195: 
 var $865=((($859)+($ssize_1_i))|0);
 var $ssize_2_i=$865;label=197;break;
 case 196: 
 var $867=_sbrk($848);
 var $tsize_0323841_i=$tsize_0_i;label=198;break;
 case 197: 
 var $ssize_2_i;
 var $869=($br_0_i|0)==-1;
 if($869){var $tsize_0323841_i=$tsize_0_i;label=198;break;}else{var $tsize_246_i=$ssize_2_i;var $tbase_247_i=$br_0_i;label=202;break;}
 case 198: 
 var $tsize_0323841_i;
 var $870=HEAP32[((5156)>>2)];
 var $871=$870|4;
 HEAP32[((5156)>>2)]=$871;
 var $tsize_1_i=$tsize_0323841_i;label=199;break;
 case 199: 
 var $tsize_1_i;
 var $873=($775>>>0)<2147483647;
 if($873){label=200;break;}else{label=343;break;}
 case 200: 
 var $875=_sbrk($775);
 var $876=_sbrk(0);
 var $notlhs_i=($875|0)!=-1;
 var $notrhs_i=($876|0)!=-1;
 var $or_cond8_not_i=$notrhs_i&$notlhs_i;
 var $877=($875>>>0)<($876>>>0);
 var $or_cond9_i=$or_cond8_not_i&$877;
 if($or_cond9_i){label=201;break;}else{label=343;break;}
 case 201: 
 var $878=$876;
 var $879=$875;
 var $880=((($878)-($879))|0);
 var $881=((($nb_0)+(40))|0);
 var $882=($880>>>0)>($881>>>0);
 var $_tsize_1_i=($882?$880:$tsize_1_i);
 if($882){var $tsize_246_i=$_tsize_1_i;var $tbase_247_i=$875;label=202;break;}else{label=343;break;}
 case 202: 
 var $tbase_247_i;
 var $tsize_246_i;
 var $883=HEAP32[((5144)>>2)];
 var $884=((($883)+($tsize_246_i))|0);
 HEAP32[((5144)>>2)]=$884;
 var $885=HEAP32[((5148)>>2)];
 var $886=($884>>>0)>($885>>>0);
 if($886){label=203;break;}else{label=204;break;}
 case 203: 
 HEAP32[((5148)>>2)]=$884;
 label=204;break;
 case 204: 
 var $888=HEAP32[((4736)>>2)];
 var $889=($888|0)==0;
 if($889){label=205;break;}else{var $sp_075_i=5160;label=212;break;}
 case 205: 
 var $891=HEAP32[((4728)>>2)];
 var $892=($891|0)==0;
 var $893=($tbase_247_i>>>0)<($891>>>0);
 var $or_cond10_i=$892|$893;
 if($or_cond10_i){label=206;break;}else{label=207;break;}
 case 206: 
 HEAP32[((4728)>>2)]=$tbase_247_i;
 label=207;break;
 case 207: 
 HEAP32[((5160)>>2)]=$tbase_247_i;
 HEAP32[((5164)>>2)]=$tsize_246_i;
 HEAP32[((5172)>>2)]=0;
 var $895=HEAP32[((4680)>>2)];
 HEAP32[((4748)>>2)]=$895;
 HEAP32[((4744)>>2)]=-1;
 var $i_02_i_i=0;label=208;break;
 case 208: 
 var $i_02_i_i;
 var $897=$i_02_i_i<<1;
 var $898=((4752+($897<<2))|0);
 var $899=$898;
 var $_sum_i_i=((($897)+(3))|0);
 var $900=((4752+($_sum_i_i<<2))|0);
 HEAP32[(($900)>>2)]=$899;
 var $_sum1_i_i=((($897)+(2))|0);
 var $901=((4752+($_sum1_i_i<<2))|0);
 HEAP32[(($901)>>2)]=$899;
 var $902=((($i_02_i_i)+(1))|0);
 var $903=($902>>>0)<32;
 if($903){var $i_02_i_i=$902;label=208;break;}else{label=209;break;}
 case 209: 
 var $904=((($tsize_246_i)-(40))|0);
 var $905=(($tbase_247_i+8)|0);
 var $906=$905;
 var $907=$906&7;
 var $908=($907|0)==0;
 if($908){var $912=0;label=211;break;}else{label=210;break;}
 case 210: 
 var $910=(((-$906))|0);
 var $911=$910&7;
 var $912=$911;label=211;break;
 case 211: 
 var $912;
 var $913=(($tbase_247_i+$912)|0);
 var $914=$913;
 var $915=((($904)-($912))|0);
 HEAP32[((4736)>>2)]=$914;
 HEAP32[((4724)>>2)]=$915;
 var $916=$915|1;
 var $_sum_i14_i=((($912)+(4))|0);
 var $917=(($tbase_247_i+$_sum_i14_i)|0);
 var $918=$917;
 HEAP32[(($918)>>2)]=$916;
 var $_sum2_i_i=((($tsize_246_i)-(36))|0);
 var $919=(($tbase_247_i+$_sum2_i_i)|0);
 var $920=$919;
 HEAP32[(($920)>>2)]=40;
 var $921=HEAP32[((4696)>>2)];
 HEAP32[((4740)>>2)]=$921;
 label=341;break;
 case 212: 
 var $sp_075_i;
 var $922=(($sp_075_i)|0);
 var $923=HEAP32[(($922)>>2)];
 var $924=(($sp_075_i+4)|0);
 var $925=HEAP32[(($924)>>2)];
 var $926=(($923+$925)|0);
 var $927=($tbase_247_i|0)==($926|0);
 if($927){label=214;break;}else{label=213;break;}
 case 213: 
 var $929=(($sp_075_i+8)|0);
 var $930=HEAP32[(($929)>>2)];
 var $931=($930|0)==0;
 if($931){label=219;break;}else{var $sp_075_i=$930;label=212;break;}
 case 214: 
 var $932=(($sp_075_i+12)|0);
 var $933=HEAP32[(($932)>>2)];
 var $934=$933&8;
 var $935=($934|0)==0;
 if($935){label=215;break;}else{label=219;break;}
 case 215: 
 var $937=$888;
 var $938=($937>>>0)>=($923>>>0);
 var $939=($937>>>0)<($tbase_247_i>>>0);
 var $or_cond49_i=$938&$939;
 if($or_cond49_i){label=216;break;}else{label=219;break;}
 case 216: 
 var $941=((($925)+($tsize_246_i))|0);
 HEAP32[(($924)>>2)]=$941;
 var $942=HEAP32[((4724)>>2)];
 var $943=((($942)+($tsize_246_i))|0);
 var $944=(($888+8)|0);
 var $945=$944;
 var $946=$945&7;
 var $947=($946|0)==0;
 if($947){var $951=0;label=218;break;}else{label=217;break;}
 case 217: 
 var $949=(((-$945))|0);
 var $950=$949&7;
 var $951=$950;label=218;break;
 case 218: 
 var $951;
 var $952=(($937+$951)|0);
 var $953=$952;
 var $954=((($943)-($951))|0);
 HEAP32[((4736)>>2)]=$953;
 HEAP32[((4724)>>2)]=$954;
 var $955=$954|1;
 var $_sum_i18_i=((($951)+(4))|0);
 var $956=(($937+$_sum_i18_i)|0);
 var $957=$956;
 HEAP32[(($957)>>2)]=$955;
 var $_sum2_i19_i=((($943)+(4))|0);
 var $958=(($937+$_sum2_i19_i)|0);
 var $959=$958;
 HEAP32[(($959)>>2)]=40;
 var $960=HEAP32[((4696)>>2)];
 HEAP32[((4740)>>2)]=$960;
 label=341;break;
 case 219: 
 var $961=HEAP32[((4728)>>2)];
 var $962=($tbase_247_i>>>0)<($961>>>0);
 if($962){label=220;break;}else{label=221;break;}
 case 220: 
 HEAP32[((4728)>>2)]=$tbase_247_i;
 label=221;break;
 case 221: 
 var $964=(($tbase_247_i+$tsize_246_i)|0);
 var $sp_168_i=5160;label=222;break;
 case 222: 
 var $sp_168_i;
 var $966=(($sp_168_i)|0);
 var $967=HEAP32[(($966)>>2)];
 var $968=($967|0)==($964|0);
 if($968){label=224;break;}else{label=223;break;}
 case 223: 
 var $970=(($sp_168_i+8)|0);
 var $971=HEAP32[(($970)>>2)];
 var $972=($971|0)==0;
 if($972){label=306;break;}else{var $sp_168_i=$971;label=222;break;}
 case 224: 
 var $973=(($sp_168_i+12)|0);
 var $974=HEAP32[(($973)>>2)];
 var $975=$974&8;
 var $976=($975|0)==0;
 if($976){label=225;break;}else{label=306;break;}
 case 225: 
 HEAP32[(($966)>>2)]=$tbase_247_i;
 var $978=(($sp_168_i+4)|0);
 var $979=HEAP32[(($978)>>2)];
 var $980=((($979)+($tsize_246_i))|0);
 HEAP32[(($978)>>2)]=$980;
 var $981=(($tbase_247_i+8)|0);
 var $982=$981;
 var $983=$982&7;
 var $984=($983|0)==0;
 if($984){var $989=0;label=227;break;}else{label=226;break;}
 case 226: 
 var $986=(((-$982))|0);
 var $987=$986&7;
 var $989=$987;label=227;break;
 case 227: 
 var $989;
 var $990=(($tbase_247_i+$989)|0);
 var $_sum107_i=((($tsize_246_i)+(8))|0);
 var $991=(($tbase_247_i+$_sum107_i)|0);
 var $992=$991;
 var $993=$992&7;
 var $994=($993|0)==0;
 if($994){var $999=0;label=229;break;}else{label=228;break;}
 case 228: 
 var $996=(((-$992))|0);
 var $997=$996&7;
 var $999=$997;label=229;break;
 case 229: 
 var $999;
 var $_sum108_i=((($999)+($tsize_246_i))|0);
 var $1000=(($tbase_247_i+$_sum108_i)|0);
 var $1001=$1000;
 var $1002=$1000;
 var $1003=$990;
 var $1004=((($1002)-($1003))|0);
 var $_sum_i21_i=((($989)+($nb_0))|0);
 var $1005=(($tbase_247_i+$_sum_i21_i)|0);
 var $1006=$1005;
 var $1007=((($1004)-($nb_0))|0);
 var $1008=$nb_0|3;
 var $_sum1_i22_i=((($989)+(4))|0);
 var $1009=(($tbase_247_i+$_sum1_i22_i)|0);
 var $1010=$1009;
 HEAP32[(($1010)>>2)]=$1008;
 var $1011=HEAP32[((4736)>>2)];
 var $1012=($1001|0)==($1011|0);
 if($1012){label=230;break;}else{label=231;break;}
 case 230: 
 var $1014=HEAP32[((4724)>>2)];
 var $1015=((($1014)+($1007))|0);
 HEAP32[((4724)>>2)]=$1015;
 HEAP32[((4736)>>2)]=$1006;
 var $1016=$1015|1;
 var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
 var $1017=(($tbase_247_i+$_sum46_i_i)|0);
 var $1018=$1017;
 HEAP32[(($1018)>>2)]=$1016;
 label=305;break;
 case 231: 
 var $1020=HEAP32[((4732)>>2)];
 var $1021=($1001|0)==($1020|0);
 if($1021){label=232;break;}else{label=233;break;}
 case 232: 
 var $1023=HEAP32[((4720)>>2)];
 var $1024=((($1023)+($1007))|0);
 HEAP32[((4720)>>2)]=$1024;
 HEAP32[((4732)>>2)]=$1006;
 var $1025=$1024|1;
 var $_sum44_i_i=((($_sum_i21_i)+(4))|0);
 var $1026=(($tbase_247_i+$_sum44_i_i)|0);
 var $1027=$1026;
 HEAP32[(($1027)>>2)]=$1025;
 var $_sum45_i_i=((($1024)+($_sum_i21_i))|0);
 var $1028=(($tbase_247_i+$_sum45_i_i)|0);
 var $1029=$1028;
 HEAP32[(($1029)>>2)]=$1024;
 label=305;break;
 case 233: 
 var $_sum2_i23_i=((($tsize_246_i)+(4))|0);
 var $_sum109_i=((($_sum2_i23_i)+($999))|0);
 var $1031=(($tbase_247_i+$_sum109_i)|0);
 var $1032=$1031;
 var $1033=HEAP32[(($1032)>>2)];
 var $1034=$1033&3;
 var $1035=($1034|0)==1;
 if($1035){label=234;break;}else{var $oldfirst_0_i_i=$1001;var $qsize_0_i_i=$1007;label=281;break;}
 case 234: 
 var $1037=$1033&-8;
 var $1038=$1033>>>3;
 var $1039=($1033>>>0)<256;
 if($1039){label=235;break;}else{label=247;break;}
 case 235: 
 var $_sum3940_i_i=$999|8;
 var $_sum119_i=((($_sum3940_i_i)+($tsize_246_i))|0);
 var $1041=(($tbase_247_i+$_sum119_i)|0);
 var $1042=$1041;
 var $1043=HEAP32[(($1042)>>2)];
 var $_sum41_i_i=((($tsize_246_i)+(12))|0);
 var $_sum120_i=((($_sum41_i_i)+($999))|0);
 var $1044=(($tbase_247_i+$_sum120_i)|0);
 var $1045=$1044;
 var $1046=HEAP32[(($1045)>>2)];
 var $1047=$1038<<1;
 var $1048=((4752+($1047<<2))|0);
 var $1049=$1048;
 var $1050=($1043|0)==($1049|0);
 if($1050){label=238;break;}else{label=236;break;}
 case 236: 
 var $1052=$1043;
 var $1053=HEAP32[((4728)>>2)];
 var $1054=($1052>>>0)<($1053>>>0);
 if($1054){label=246;break;}else{label=237;break;}
 case 237: 
 var $1056=(($1043+12)|0);
 var $1057=HEAP32[(($1056)>>2)];
 var $1058=($1057|0)==($1001|0);
 if($1058){label=238;break;}else{label=246;break;}
 case 238: 
 var $1059=($1046|0)==($1043|0);
 if($1059){label=239;break;}else{label=240;break;}
 case 239: 
 var $1061=1<<$1038;
 var $1062=$1061^-1;
 var $1063=HEAP32[((4712)>>2)];
 var $1064=$1063&$1062;
 HEAP32[((4712)>>2)]=$1064;
 label=280;break;
 case 240: 
 var $1066=($1046|0)==($1049|0);
 if($1066){label=241;break;}else{label=242;break;}
 case 241: 
 var $_pre61_i_i=(($1046+8)|0);
 var $_pre_phi62_i_i=$_pre61_i_i;label=244;break;
 case 242: 
 var $1068=$1046;
 var $1069=HEAP32[((4728)>>2)];
 var $1070=($1068>>>0)<($1069>>>0);
 if($1070){label=245;break;}else{label=243;break;}
 case 243: 
 var $1072=(($1046+8)|0);
 var $1073=HEAP32[(($1072)>>2)];
 var $1074=($1073|0)==($1001|0);
 if($1074){var $_pre_phi62_i_i=$1072;label=244;break;}else{label=245;break;}
 case 244: 
 var $_pre_phi62_i_i;
 var $1075=(($1043+12)|0);
 HEAP32[(($1075)>>2)]=$1046;
 HEAP32[(($_pre_phi62_i_i)>>2)]=$1043;
 label=280;break;
 case 245: 
 _abort();
 throw "Reached an unreachable!";
 case 246: 
 _abort();
 throw "Reached an unreachable!";
 case 247: 
 var $1077=$1000;
 var $_sum34_i_i=$999|24;
 var $_sum110_i=((($_sum34_i_i)+($tsize_246_i))|0);
 var $1078=(($tbase_247_i+$_sum110_i)|0);
 var $1079=$1078;
 var $1080=HEAP32[(($1079)>>2)];
 var $_sum5_i_i=((($tsize_246_i)+(12))|0);
 var $_sum111_i=((($_sum5_i_i)+($999))|0);
 var $1081=(($tbase_247_i+$_sum111_i)|0);
 var $1082=$1081;
 var $1083=HEAP32[(($1082)>>2)];
 var $1084=($1083|0)==($1077|0);
 if($1084){label=253;break;}else{label=248;break;}
 case 248: 
 var $_sum3637_i_i=$999|8;
 var $_sum112_i=((($_sum3637_i_i)+($tsize_246_i))|0);
 var $1086=(($tbase_247_i+$_sum112_i)|0);
 var $1087=$1086;
 var $1088=HEAP32[(($1087)>>2)];
 var $1089=$1088;
 var $1090=HEAP32[((4728)>>2)];
 var $1091=($1089>>>0)<($1090>>>0);
 if($1091){label=252;break;}else{label=249;break;}
 case 249: 
 var $1093=(($1088+12)|0);
 var $1094=HEAP32[(($1093)>>2)];
 var $1095=($1094|0)==($1077|0);
 if($1095){label=250;break;}else{label=252;break;}
 case 250: 
 var $1097=(($1083+8)|0);
 var $1098=HEAP32[(($1097)>>2)];
 var $1099=($1098|0)==($1077|0);
 if($1099){label=251;break;}else{label=252;break;}
 case 251: 
 HEAP32[(($1093)>>2)]=$1083;
 HEAP32[(($1097)>>2)]=$1088;
 var $R_1_i_i=$1083;label=260;break;
 case 252: 
 _abort();
 throw "Reached an unreachable!";
 case 253: 
 var $_sum67_i_i=$999|16;
 var $_sum117_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
 var $1102=(($tbase_247_i+$_sum117_i)|0);
 var $1103=$1102;
 var $1104=HEAP32[(($1103)>>2)];
 var $1105=($1104|0)==0;
 if($1105){label=254;break;}else{var $R_0_i_i=$1104;var $RP_0_i_i=$1103;label=255;break;}
 case 254: 
 var $_sum118_i=((($_sum67_i_i)+($tsize_246_i))|0);
 var $1107=(($tbase_247_i+$_sum118_i)|0);
 var $1108=$1107;
 var $1109=HEAP32[(($1108)>>2)];
 var $1110=($1109|0)==0;
 if($1110){var $R_1_i_i=0;label=260;break;}else{var $R_0_i_i=$1109;var $RP_0_i_i=$1108;label=255;break;}
 case 255: 
 var $RP_0_i_i;
 var $R_0_i_i;
 var $1111=(($R_0_i_i+20)|0);
 var $1112=HEAP32[(($1111)>>2)];
 var $1113=($1112|0)==0;
 if($1113){label=256;break;}else{var $R_0_i_i=$1112;var $RP_0_i_i=$1111;label=255;break;}
 case 256: 
 var $1115=(($R_0_i_i+16)|0);
 var $1116=HEAP32[(($1115)>>2)];
 var $1117=($1116|0)==0;
 if($1117){label=257;break;}else{var $R_0_i_i=$1116;var $RP_0_i_i=$1115;label=255;break;}
 case 257: 
 var $1119=$RP_0_i_i;
 var $1120=HEAP32[((4728)>>2)];
 var $1121=($1119>>>0)<($1120>>>0);
 if($1121){label=259;break;}else{label=258;break;}
 case 258: 
 HEAP32[(($RP_0_i_i)>>2)]=0;
 var $R_1_i_i=$R_0_i_i;label=260;break;
 case 259: 
 _abort();
 throw "Reached an unreachable!";
 case 260: 
 var $R_1_i_i;
 var $1125=($1080|0)==0;
 if($1125){label=280;break;}else{label=261;break;}
 case 261: 
 var $_sum31_i_i=((($tsize_246_i)+(28))|0);
 var $_sum113_i=((($_sum31_i_i)+($999))|0);
 var $1127=(($tbase_247_i+$_sum113_i)|0);
 var $1128=$1127;
 var $1129=HEAP32[(($1128)>>2)];
 var $1130=((5016+($1129<<2))|0);
 var $1131=HEAP32[(($1130)>>2)];
 var $1132=($1077|0)==($1131|0);
 if($1132){label=262;break;}else{label=264;break;}
 case 262: 
 HEAP32[(($1130)>>2)]=$R_1_i_i;
 var $cond_i_i=($R_1_i_i|0)==0;
 if($cond_i_i){label=263;break;}else{label=270;break;}
 case 263: 
 var $1134=1<<$1129;
 var $1135=$1134^-1;
 var $1136=HEAP32[((4716)>>2)];
 var $1137=$1136&$1135;
 HEAP32[((4716)>>2)]=$1137;
 label=280;break;
 case 264: 
 var $1139=$1080;
 var $1140=HEAP32[((4728)>>2)];
 var $1141=($1139>>>0)<($1140>>>0);
 if($1141){label=268;break;}else{label=265;break;}
 case 265: 
 var $1143=(($1080+16)|0);
 var $1144=HEAP32[(($1143)>>2)];
 var $1145=($1144|0)==($1077|0);
 if($1145){label=266;break;}else{label=267;break;}
 case 266: 
 HEAP32[(($1143)>>2)]=$R_1_i_i;
 label=269;break;
 case 267: 
 var $1148=(($1080+20)|0);
 HEAP32[(($1148)>>2)]=$R_1_i_i;
 label=269;break;
 case 268: 
 _abort();
 throw "Reached an unreachable!";
 case 269: 
 var $1151=($R_1_i_i|0)==0;
 if($1151){label=280;break;}else{label=270;break;}
 case 270: 
 var $1153=$R_1_i_i;
 var $1154=HEAP32[((4728)>>2)];
 var $1155=($1153>>>0)<($1154>>>0);
 if($1155){label=279;break;}else{label=271;break;}
 case 271: 
 var $1157=(($R_1_i_i+24)|0);
 HEAP32[(($1157)>>2)]=$1080;
 var $_sum3233_i_i=$999|16;
 var $_sum114_i=((($_sum3233_i_i)+($tsize_246_i))|0);
 var $1158=(($tbase_247_i+$_sum114_i)|0);
 var $1159=$1158;
 var $1160=HEAP32[(($1159)>>2)];
 var $1161=($1160|0)==0;
 if($1161){label=275;break;}else{label=272;break;}
 case 272: 
 var $1163=$1160;
 var $1164=HEAP32[((4728)>>2)];
 var $1165=($1163>>>0)<($1164>>>0);
 if($1165){label=274;break;}else{label=273;break;}
 case 273: 
 var $1167=(($R_1_i_i+16)|0);
 HEAP32[(($1167)>>2)]=$1160;
 var $1168=(($1160+24)|0);
 HEAP32[(($1168)>>2)]=$R_1_i_i;
 label=275;break;
 case 274: 
 _abort();
 throw "Reached an unreachable!";
 case 275: 
 var $_sum115_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
 var $1171=(($tbase_247_i+$_sum115_i)|0);
 var $1172=$1171;
 var $1173=HEAP32[(($1172)>>2)];
 var $1174=($1173|0)==0;
 if($1174){label=280;break;}else{label=276;break;}
 case 276: 
 var $1176=$1173;
 var $1177=HEAP32[((4728)>>2)];
 var $1178=($1176>>>0)<($1177>>>0);
 if($1178){label=278;break;}else{label=277;break;}
 case 277: 
 var $1180=(($R_1_i_i+20)|0);
 HEAP32[(($1180)>>2)]=$1173;
 var $1181=(($1173+24)|0);
 HEAP32[(($1181)>>2)]=$R_1_i_i;
 label=280;break;
 case 278: 
 _abort();
 throw "Reached an unreachable!";
 case 279: 
 _abort();
 throw "Reached an unreachable!";
 case 280: 
 var $_sum9_i_i=$1037|$999;
 var $_sum116_i=((($_sum9_i_i)+($tsize_246_i))|0);
 var $1185=(($tbase_247_i+$_sum116_i)|0);
 var $1186=$1185;
 var $1187=((($1037)+($1007))|0);
 var $oldfirst_0_i_i=$1186;var $qsize_0_i_i=$1187;label=281;break;
 case 281: 
 var $qsize_0_i_i;
 var $oldfirst_0_i_i;
 var $1189=(($oldfirst_0_i_i+4)|0);
 var $1190=HEAP32[(($1189)>>2)];
 var $1191=$1190&-2;
 HEAP32[(($1189)>>2)]=$1191;
 var $1192=$qsize_0_i_i|1;
 var $_sum10_i_i=((($_sum_i21_i)+(4))|0);
 var $1193=(($tbase_247_i+$_sum10_i_i)|0);
 var $1194=$1193;
 HEAP32[(($1194)>>2)]=$1192;
 var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
 var $1195=(($tbase_247_i+$_sum11_i_i)|0);
 var $1196=$1195;
 HEAP32[(($1196)>>2)]=$qsize_0_i_i;
 var $1197=$qsize_0_i_i>>>3;
 var $1198=($qsize_0_i_i>>>0)<256;
 if($1198){label=282;break;}else{label=287;break;}
 case 282: 
 var $1200=$1197<<1;
 var $1201=((4752+($1200<<2))|0);
 var $1202=$1201;
 var $1203=HEAP32[((4712)>>2)];
 var $1204=1<<$1197;
 var $1205=$1203&$1204;
 var $1206=($1205|0)==0;
 if($1206){label=283;break;}else{label=284;break;}
 case 283: 
 var $1208=$1203|$1204;
 HEAP32[((4712)>>2)]=$1208;
 var $_sum27_pre_i_i=((($1200)+(2))|0);
 var $_pre_i24_i=((4752+($_sum27_pre_i_i<<2))|0);
 var $F4_0_i_i=$1202;var $_pre_phi_i25_i=$_pre_i24_i;label=286;break;
 case 284: 
 var $_sum30_i_i=((($1200)+(2))|0);
 var $1210=((4752+($_sum30_i_i<<2))|0);
 var $1211=HEAP32[(($1210)>>2)];
 var $1212=$1211;
 var $1213=HEAP32[((4728)>>2)];
 var $1214=($1212>>>0)<($1213>>>0);
 if($1214){label=285;break;}else{var $F4_0_i_i=$1211;var $_pre_phi_i25_i=$1210;label=286;break;}
 case 285: 
 _abort();
 throw "Reached an unreachable!";
 case 286: 
 var $_pre_phi_i25_i;
 var $F4_0_i_i;
 HEAP32[(($_pre_phi_i25_i)>>2)]=$1006;
 var $1217=(($F4_0_i_i+12)|0);
 HEAP32[(($1217)>>2)]=$1006;
 var $_sum28_i_i=((($_sum_i21_i)+(8))|0);
 var $1218=(($tbase_247_i+$_sum28_i_i)|0);
 var $1219=$1218;
 HEAP32[(($1219)>>2)]=$F4_0_i_i;
 var $_sum29_i_i=((($_sum_i21_i)+(12))|0);
 var $1220=(($tbase_247_i+$_sum29_i_i)|0);
 var $1221=$1220;
 HEAP32[(($1221)>>2)]=$1202;
 label=305;break;
 case 287: 
 var $1223=$1005;
 var $1224=$qsize_0_i_i>>>8;
 var $1225=($1224|0)==0;
 if($1225){var $I7_0_i_i=0;label=290;break;}else{label=288;break;}
 case 288: 
 var $1227=($qsize_0_i_i>>>0)>16777215;
 if($1227){var $I7_0_i_i=31;label=290;break;}else{label=289;break;}
 case 289: 
 var $1229=((($1224)+(1048320))|0);
 var $1230=$1229>>>16;
 var $1231=$1230&8;
 var $1232=$1224<<$1231;
 var $1233=((($1232)+(520192))|0);
 var $1234=$1233>>>16;
 var $1235=$1234&4;
 var $1236=$1235|$1231;
 var $1237=$1232<<$1235;
 var $1238=((($1237)+(245760))|0);
 var $1239=$1238>>>16;
 var $1240=$1239&2;
 var $1241=$1236|$1240;
 var $1242=(((14)-($1241))|0);
 var $1243=$1237<<$1240;
 var $1244=$1243>>>15;
 var $1245=((($1242)+($1244))|0);
 var $1246=$1245<<1;
 var $1247=((($1245)+(7))|0);
 var $1248=$qsize_0_i_i>>>($1247>>>0);
 var $1249=$1248&1;
 var $1250=$1249|$1246;
 var $I7_0_i_i=$1250;label=290;break;
 case 290: 
 var $I7_0_i_i;
 var $1252=((5016+($I7_0_i_i<<2))|0);
 var $_sum12_i26_i=((($_sum_i21_i)+(28))|0);
 var $1253=(($tbase_247_i+$_sum12_i26_i)|0);
 var $1254=$1253;
 HEAP32[(($1254)>>2)]=$I7_0_i_i;
 var $_sum13_i_i=((($_sum_i21_i)+(16))|0);
 var $1255=(($tbase_247_i+$_sum13_i_i)|0);
 var $_sum14_i_i=((($_sum_i21_i)+(20))|0);
 var $1256=(($tbase_247_i+$_sum14_i_i)|0);
 var $1257=$1256;
 HEAP32[(($1257)>>2)]=0;
 var $1258=$1255;
 HEAP32[(($1258)>>2)]=0;
 var $1259=HEAP32[((4716)>>2)];
 var $1260=1<<$I7_0_i_i;
 var $1261=$1259&$1260;
 var $1262=($1261|0)==0;
 if($1262){label=291;break;}else{label=292;break;}
 case 291: 
 var $1264=$1259|$1260;
 HEAP32[((4716)>>2)]=$1264;
 HEAP32[(($1252)>>2)]=$1223;
 var $1265=$1252;
 var $_sum15_i_i=((($_sum_i21_i)+(24))|0);
 var $1266=(($tbase_247_i+$_sum15_i_i)|0);
 var $1267=$1266;
 HEAP32[(($1267)>>2)]=$1265;
 var $_sum16_i_i=((($_sum_i21_i)+(12))|0);
 var $1268=(($tbase_247_i+$_sum16_i_i)|0);
 var $1269=$1268;
 HEAP32[(($1269)>>2)]=$1223;
 var $_sum17_i_i=((($_sum_i21_i)+(8))|0);
 var $1270=(($tbase_247_i+$_sum17_i_i)|0);
 var $1271=$1270;
 HEAP32[(($1271)>>2)]=$1223;
 label=305;break;
 case 292: 
 var $1273=HEAP32[(($1252)>>2)];
 var $1274=($I7_0_i_i|0)==31;
 if($1274){var $1279=0;label=294;break;}else{label=293;break;}
 case 293: 
 var $1276=$I7_0_i_i>>>1;
 var $1277=(((25)-($1276))|0);
 var $1279=$1277;label=294;break;
 case 294: 
 var $1279;
 var $1280=(($1273+4)|0);
 var $1281=HEAP32[(($1280)>>2)];
 var $1282=$1281&-8;
 var $1283=($1282|0)==($qsize_0_i_i|0);
 if($1283){var $T_0_lcssa_i28_i=$1273;label=301;break;}else{label=295;break;}
 case 295: 
 var $1284=$qsize_0_i_i<<$1279;
 var $T_055_i_i=$1273;var $K8_056_i_i=$1284;label=297;break;
 case 296: 
 var $1286=$K8_056_i_i<<1;
 var $1287=(($1294+4)|0);
 var $1288=HEAP32[(($1287)>>2)];
 var $1289=$1288&-8;
 var $1290=($1289|0)==($qsize_0_i_i|0);
 if($1290){var $T_0_lcssa_i28_i=$1294;label=301;break;}else{var $T_055_i_i=$1294;var $K8_056_i_i=$1286;label=297;break;}
 case 297: 
 var $K8_056_i_i;
 var $T_055_i_i;
 var $1292=$K8_056_i_i>>>31;
 var $1293=(($T_055_i_i+16+($1292<<2))|0);
 var $1294=HEAP32[(($1293)>>2)];
 var $1295=($1294|0)==0;
 if($1295){label=298;break;}else{label=296;break;}
 case 298: 
 var $1297=$1293;
 var $1298=HEAP32[((4728)>>2)];
 var $1299=($1297>>>0)<($1298>>>0);
 if($1299){label=300;break;}else{label=299;break;}
 case 299: 
 HEAP32[(($1293)>>2)]=$1223;
 var $_sum24_i_i=((($_sum_i21_i)+(24))|0);
 var $1301=(($tbase_247_i+$_sum24_i_i)|0);
 var $1302=$1301;
 HEAP32[(($1302)>>2)]=$T_055_i_i;
 var $_sum25_i_i=((($_sum_i21_i)+(12))|0);
 var $1303=(($tbase_247_i+$_sum25_i_i)|0);
 var $1304=$1303;
 HEAP32[(($1304)>>2)]=$1223;
 var $_sum26_i_i=((($_sum_i21_i)+(8))|0);
 var $1305=(($tbase_247_i+$_sum26_i_i)|0);
 var $1306=$1305;
 HEAP32[(($1306)>>2)]=$1223;
 label=305;break;
 case 300: 
 _abort();
 throw "Reached an unreachable!";
 case 301: 
 var $T_0_lcssa_i28_i;
 var $1308=(($T_0_lcssa_i28_i+8)|0);
 var $1309=HEAP32[(($1308)>>2)];
 var $1310=$T_0_lcssa_i28_i;
 var $1311=HEAP32[((4728)>>2)];
 var $1312=($1310>>>0)<($1311>>>0);
 if($1312){label=304;break;}else{label=302;break;}
 case 302: 
 var $1314=$1309;
 var $1315=($1314>>>0)<($1311>>>0);
 if($1315){label=304;break;}else{label=303;break;}
 case 303: 
 var $1317=(($1309+12)|0);
 HEAP32[(($1317)>>2)]=$1223;
 HEAP32[(($1308)>>2)]=$1223;
 var $_sum21_i_i=((($_sum_i21_i)+(8))|0);
 var $1318=(($tbase_247_i+$_sum21_i_i)|0);
 var $1319=$1318;
 HEAP32[(($1319)>>2)]=$1309;
 var $_sum22_i_i=((($_sum_i21_i)+(12))|0);
 var $1320=(($tbase_247_i+$_sum22_i_i)|0);
 var $1321=$1320;
 HEAP32[(($1321)>>2)]=$T_0_lcssa_i28_i;
 var $_sum23_i_i=((($_sum_i21_i)+(24))|0);
 var $1322=(($tbase_247_i+$_sum23_i_i)|0);
 var $1323=$1322;
 HEAP32[(($1323)>>2)]=0;
 label=305;break;
 case 304: 
 _abort();
 throw "Reached an unreachable!";
 case 305: 
 var $_sum1819_i_i=$989|8;
 var $1324=(($tbase_247_i+$_sum1819_i_i)|0);
 var $mem_0=$1324;label=344;break;
 case 306: 
 var $1325=$888;
 var $sp_0_i_i_i=5160;label=307;break;
 case 307: 
 var $sp_0_i_i_i;
 var $1327=(($sp_0_i_i_i)|0);
 var $1328=HEAP32[(($1327)>>2)];
 var $1329=($1328>>>0)>($1325>>>0);
 if($1329){label=309;break;}else{label=308;break;}
 case 308: 
 var $1331=(($sp_0_i_i_i+4)|0);
 var $1332=HEAP32[(($1331)>>2)];
 var $1333=(($1328+$1332)|0);
 var $1334=($1333>>>0)>($1325>>>0);
 if($1334){label=310;break;}else{label=309;break;}
 case 309: 
 var $1336=(($sp_0_i_i_i+8)|0);
 var $1337=HEAP32[(($1336)>>2)];
 var $sp_0_i_i_i=$1337;label=307;break;
 case 310: 
 var $_sum_i15_i=((($1332)-(47))|0);
 var $_sum1_i16_i=((($1332)-(39))|0);
 var $1338=(($1328+$_sum1_i16_i)|0);
 var $1339=$1338;
 var $1340=$1339&7;
 var $1341=($1340|0)==0;
 if($1341){var $1346=0;label=312;break;}else{label=311;break;}
 case 311: 
 var $1343=(((-$1339))|0);
 var $1344=$1343&7;
 var $1346=$1344;label=312;break;
 case 312: 
 var $1346;
 var $_sum2_i17_i=((($_sum_i15_i)+($1346))|0);
 var $1347=(($1328+$_sum2_i17_i)|0);
 var $1348=(($888+16)|0);
 var $1349=$1348;
 var $1350=($1347>>>0)<($1349>>>0);
 var $1351=($1350?$1325:$1347);
 var $1352=(($1351+8)|0);
 var $1353=$1352;
 var $1354=((($tsize_246_i)-(40))|0);
 var $1355=(($tbase_247_i+8)|0);
 var $1356=$1355;
 var $1357=$1356&7;
 var $1358=($1357|0)==0;
 if($1358){var $1362=0;label=314;break;}else{label=313;break;}
 case 313: 
 var $1360=(((-$1356))|0);
 var $1361=$1360&7;
 var $1362=$1361;label=314;break;
 case 314: 
 var $1362;
 var $1363=(($tbase_247_i+$1362)|0);
 var $1364=$1363;
 var $1365=((($1354)-($1362))|0);
 HEAP32[((4736)>>2)]=$1364;
 HEAP32[((4724)>>2)]=$1365;
 var $1366=$1365|1;
 var $_sum_i_i_i=((($1362)+(4))|0);
 var $1367=(($tbase_247_i+$_sum_i_i_i)|0);
 var $1368=$1367;
 HEAP32[(($1368)>>2)]=$1366;
 var $_sum2_i_i_i=((($tsize_246_i)-(36))|0);
 var $1369=(($tbase_247_i+$_sum2_i_i_i)|0);
 var $1370=$1369;
 HEAP32[(($1370)>>2)]=40;
 var $1371=HEAP32[((4696)>>2)];
 HEAP32[((4740)>>2)]=$1371;
 var $1372=(($1351+4)|0);
 var $1373=$1372;
 HEAP32[(($1373)>>2)]=27;
 assert(16 % 1 === 0);HEAP32[(($1352)>>2)]=HEAP32[((5160)>>2)];HEAP32[((($1352)+(4))>>2)]=HEAP32[((5164)>>2)];HEAP32[((($1352)+(8))>>2)]=HEAP32[((5168)>>2)];HEAP32[((($1352)+(12))>>2)]=HEAP32[((5172)>>2)];
 HEAP32[((5160)>>2)]=$tbase_247_i;
 HEAP32[((5164)>>2)]=$tsize_246_i;
 HEAP32[((5172)>>2)]=0;
 HEAP32[((5168)>>2)]=$1353;
 var $1374=(($1351+28)|0);
 var $1375=$1374;
 HEAP32[(($1375)>>2)]=7;
 var $1376=(($1351+32)|0);
 var $1377=($1376>>>0)<($1333>>>0);
 if($1377){var $1378=$1375;label=315;break;}else{label=316;break;}
 case 315: 
 var $1378;
 var $1379=(($1378+4)|0);
 HEAP32[(($1379)>>2)]=7;
 var $1380=(($1378+8)|0);
 var $1381=$1380;
 var $1382=($1381>>>0)<($1333>>>0);
 if($1382){var $1378=$1379;label=315;break;}else{label=316;break;}
 case 316: 
 var $1383=($1351|0)==($1325|0);
 if($1383){label=341;break;}else{label=317;break;}
 case 317: 
 var $1385=$1351;
 var $1386=$888;
 var $1387=((($1385)-($1386))|0);
 var $1388=(($1325+$1387)|0);
 var $_sum3_i_i=((($1387)+(4))|0);
 var $1389=(($1325+$_sum3_i_i)|0);
 var $1390=$1389;
 var $1391=HEAP32[(($1390)>>2)];
 var $1392=$1391&-2;
 HEAP32[(($1390)>>2)]=$1392;
 var $1393=$1387|1;
 var $1394=(($888+4)|0);
 HEAP32[(($1394)>>2)]=$1393;
 var $1395=$1388;
 HEAP32[(($1395)>>2)]=$1387;
 var $1396=$1387>>>3;
 var $1397=($1387>>>0)<256;
 if($1397){label=318;break;}else{label=323;break;}
 case 318: 
 var $1399=$1396<<1;
 var $1400=((4752+($1399<<2))|0);
 var $1401=$1400;
 var $1402=HEAP32[((4712)>>2)];
 var $1403=1<<$1396;
 var $1404=$1402&$1403;
 var $1405=($1404|0)==0;
 if($1405){label=319;break;}else{label=320;break;}
 case 319: 
 var $1407=$1402|$1403;
 HEAP32[((4712)>>2)]=$1407;
 var $_sum11_pre_i_i=((($1399)+(2))|0);
 var $_pre_i_i=((4752+($_sum11_pre_i_i<<2))|0);
 var $F_0_i_i=$1401;var $_pre_phi_i_i=$_pre_i_i;label=322;break;
 case 320: 
 var $_sum12_i_i=((($1399)+(2))|0);
 var $1409=((4752+($_sum12_i_i<<2))|0);
 var $1410=HEAP32[(($1409)>>2)];
 var $1411=$1410;
 var $1412=HEAP32[((4728)>>2)];
 var $1413=($1411>>>0)<($1412>>>0);
 if($1413){label=321;break;}else{var $F_0_i_i=$1410;var $_pre_phi_i_i=$1409;label=322;break;}
 case 321: 
 _abort();
 throw "Reached an unreachable!";
 case 322: 
 var $_pre_phi_i_i;
 var $F_0_i_i;
 HEAP32[(($_pre_phi_i_i)>>2)]=$888;
 var $1416=(($F_0_i_i+12)|0);
 HEAP32[(($1416)>>2)]=$888;
 var $1417=(($888+8)|0);
 HEAP32[(($1417)>>2)]=$F_0_i_i;
 var $1418=(($888+12)|0);
 HEAP32[(($1418)>>2)]=$1401;
 label=341;break;
 case 323: 
 var $1420=$888;
 var $1421=$1387>>>8;
 var $1422=($1421|0)==0;
 if($1422){var $I1_0_i_i=0;label=326;break;}else{label=324;break;}
 case 324: 
 var $1424=($1387>>>0)>16777215;
 if($1424){var $I1_0_i_i=31;label=326;break;}else{label=325;break;}
 case 325: 
 var $1426=((($1421)+(1048320))|0);
 var $1427=$1426>>>16;
 var $1428=$1427&8;
 var $1429=$1421<<$1428;
 var $1430=((($1429)+(520192))|0);
 var $1431=$1430>>>16;
 var $1432=$1431&4;
 var $1433=$1432|$1428;
 var $1434=$1429<<$1432;
 var $1435=((($1434)+(245760))|0);
 var $1436=$1435>>>16;
 var $1437=$1436&2;
 var $1438=$1433|$1437;
 var $1439=(((14)-($1438))|0);
 var $1440=$1434<<$1437;
 var $1441=$1440>>>15;
 var $1442=((($1439)+($1441))|0);
 var $1443=$1442<<1;
 var $1444=((($1442)+(7))|0);
 var $1445=$1387>>>($1444>>>0);
 var $1446=$1445&1;
 var $1447=$1446|$1443;
 var $I1_0_i_i=$1447;label=326;break;
 case 326: 
 var $I1_0_i_i;
 var $1449=((5016+($I1_0_i_i<<2))|0);
 var $1450=(($888+28)|0);
 var $I1_0_c_i_i=$I1_0_i_i;
 HEAP32[(($1450)>>2)]=$I1_0_c_i_i;
 var $1451=(($888+20)|0);
 HEAP32[(($1451)>>2)]=0;
 var $1452=(($888+16)|0);
 HEAP32[(($1452)>>2)]=0;
 var $1453=HEAP32[((4716)>>2)];
 var $1454=1<<$I1_0_i_i;
 var $1455=$1453&$1454;
 var $1456=($1455|0)==0;
 if($1456){label=327;break;}else{label=328;break;}
 case 327: 
 var $1458=$1453|$1454;
 HEAP32[((4716)>>2)]=$1458;
 HEAP32[(($1449)>>2)]=$1420;
 var $1459=(($888+24)|0);
 var $_c_i_i=$1449;
 HEAP32[(($1459)>>2)]=$_c_i_i;
 var $1460=(($888+12)|0);
 HEAP32[(($1460)>>2)]=$888;
 var $1461=(($888+8)|0);
 HEAP32[(($1461)>>2)]=$888;
 label=341;break;
 case 328: 
 var $1463=HEAP32[(($1449)>>2)];
 var $1464=($I1_0_i_i|0)==31;
 if($1464){var $1469=0;label=330;break;}else{label=329;break;}
 case 329: 
 var $1466=$I1_0_i_i>>>1;
 var $1467=(((25)-($1466))|0);
 var $1469=$1467;label=330;break;
 case 330: 
 var $1469;
 var $1470=(($1463+4)|0);
 var $1471=HEAP32[(($1470)>>2)];
 var $1472=$1471&-8;
 var $1473=($1472|0)==($1387|0);
 if($1473){var $T_0_lcssa_i_i=$1463;label=337;break;}else{label=331;break;}
 case 331: 
 var $1474=$1387<<$1469;
 var $T_014_i_i=$1463;var $K2_015_i_i=$1474;label=333;break;
 case 332: 
 var $1476=$K2_015_i_i<<1;
 var $1477=(($1484+4)|0);
 var $1478=HEAP32[(($1477)>>2)];
 var $1479=$1478&-8;
 var $1480=($1479|0)==($1387|0);
 if($1480){var $T_0_lcssa_i_i=$1484;label=337;break;}else{var $T_014_i_i=$1484;var $K2_015_i_i=$1476;label=333;break;}
 case 333: 
 var $K2_015_i_i;
 var $T_014_i_i;
 var $1482=$K2_015_i_i>>>31;
 var $1483=(($T_014_i_i+16+($1482<<2))|0);
 var $1484=HEAP32[(($1483)>>2)];
 var $1485=($1484|0)==0;
 if($1485){label=334;break;}else{label=332;break;}
 case 334: 
 var $1487=$1483;
 var $1488=HEAP32[((4728)>>2)];
 var $1489=($1487>>>0)<($1488>>>0);
 if($1489){label=336;break;}else{label=335;break;}
 case 335: 
 HEAP32[(($1483)>>2)]=$1420;
 var $1491=(($888+24)|0);
 var $T_0_c8_i_i=$T_014_i_i;
 HEAP32[(($1491)>>2)]=$T_0_c8_i_i;
 var $1492=(($888+12)|0);
 HEAP32[(($1492)>>2)]=$888;
 var $1493=(($888+8)|0);
 HEAP32[(($1493)>>2)]=$888;
 label=341;break;
 case 336: 
 _abort();
 throw "Reached an unreachable!";
 case 337: 
 var $T_0_lcssa_i_i;
 var $1495=(($T_0_lcssa_i_i+8)|0);
 var $1496=HEAP32[(($1495)>>2)];
 var $1497=$T_0_lcssa_i_i;
 var $1498=HEAP32[((4728)>>2)];
 var $1499=($1497>>>0)<($1498>>>0);
 if($1499){label=340;break;}else{label=338;break;}
 case 338: 
 var $1501=$1496;
 var $1502=($1501>>>0)<($1498>>>0);
 if($1502){label=340;break;}else{label=339;break;}
 case 339: 
 var $1504=(($1496+12)|0);
 HEAP32[(($1504)>>2)]=$1420;
 HEAP32[(($1495)>>2)]=$1420;
 var $1505=(($888+8)|0);
 var $_c7_i_i=$1496;
 HEAP32[(($1505)>>2)]=$_c7_i_i;
 var $1506=(($888+12)|0);
 var $T_0_c_i_i=$T_0_lcssa_i_i;
 HEAP32[(($1506)>>2)]=$T_0_c_i_i;
 var $1507=(($888+24)|0);
 HEAP32[(($1507)>>2)]=0;
 label=341;break;
 case 340: 
 _abort();
 throw "Reached an unreachable!";
 case 341: 
 var $1508=HEAP32[((4724)>>2)];
 var $1509=($1508>>>0)>($nb_0>>>0);
 if($1509){label=342;break;}else{label=343;break;}
 case 342: 
 var $1511=((($1508)-($nb_0))|0);
 HEAP32[((4724)>>2)]=$1511;
 var $1512=HEAP32[((4736)>>2)];
 var $1513=$1512;
 var $1514=(($1513+$nb_0)|0);
 var $1515=$1514;
 HEAP32[((4736)>>2)]=$1515;
 var $1516=$1511|1;
 var $_sum_i34=((($nb_0)+(4))|0);
 var $1517=(($1513+$_sum_i34)|0);
 var $1518=$1517;
 HEAP32[(($1518)>>2)]=$1516;
 var $1519=$nb_0|3;
 var $1520=(($1512+4)|0);
 HEAP32[(($1520)>>2)]=$1519;
 var $1521=(($1512+8)|0);
 var $1522=$1521;
 var $mem_0=$1522;label=344;break;
 case 343: 
 var $1523=___errno_location();
 HEAP32[(($1523)>>2)]=12;
 var $mem_0=0;label=344;break;
 case 344: 
 var $mem_0;
 return $mem_0;
  default: assert(0, "bad label: " + label);
 }

}
Module["_malloc"] = _malloc;

function _free($mem){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=($mem|0)==0;
 if($1){label=141;break;}else{label=2;break;}
 case 2: 
 var $3=((($mem)-(8))|0);
 var $4=$3;
 var $5=HEAP32[((4728)>>2)];
 var $6=($3>>>0)<($5>>>0);
 if($6){label=140;break;}else{label=3;break;}
 case 3: 
 var $8=((($mem)-(4))|0);
 var $9=$8;
 var $10=HEAP32[(($9)>>2)];
 var $11=$10&3;
 var $12=($11|0)==1;
 if($12){label=140;break;}else{label=4;break;}
 case 4: 
 var $14=$10&-8;
 var $_sum=((($14)-(8))|0);
 var $15=(($mem+$_sum)|0);
 var $16=$15;
 var $17=$10&1;
 var $18=($17|0)==0;
 if($18){label=5;break;}else{var $p_0=$4;var $psize_0=$14;label=56;break;}
 case 5: 
 var $20=$3;
 var $21=HEAP32[(($20)>>2)];
 var $22=($11|0)==0;
 if($22){label=141;break;}else{label=6;break;}
 case 6: 
 var $_sum3=(((-8)-($21))|0);
 var $24=(($mem+$_sum3)|0);
 var $25=$24;
 var $26=((($21)+($14))|0);
 var $27=($24>>>0)<($5>>>0);
 if($27){label=140;break;}else{label=7;break;}
 case 7: 
 var $29=HEAP32[((4732)>>2)];
 var $30=($25|0)==($29|0);
 if($30){label=54;break;}else{label=8;break;}
 case 8: 
 var $32=$21>>>3;
 var $33=($21>>>0)<256;
 if($33){label=9;break;}else{label=21;break;}
 case 9: 
 var $_sum47=((($_sum3)+(8))|0);
 var $35=(($mem+$_sum47)|0);
 var $36=$35;
 var $37=HEAP32[(($36)>>2)];
 var $_sum48=((($_sum3)+(12))|0);
 var $38=(($mem+$_sum48)|0);
 var $39=$38;
 var $40=HEAP32[(($39)>>2)];
 var $41=$32<<1;
 var $42=((4752+($41<<2))|0);
 var $43=$42;
 var $44=($37|0)==($43|0);
 if($44){label=12;break;}else{label=10;break;}
 case 10: 
 var $46=$37;
 var $47=($46>>>0)<($5>>>0);
 if($47){label=20;break;}else{label=11;break;}
 case 11: 
 var $49=(($37+12)|0);
 var $50=HEAP32[(($49)>>2)];
 var $51=($50|0)==($25|0);
 if($51){label=12;break;}else{label=20;break;}
 case 12: 
 var $52=($40|0)==($37|0);
 if($52){label=13;break;}else{label=14;break;}
 case 13: 
 var $54=1<<$32;
 var $55=$54^-1;
 var $56=HEAP32[((4712)>>2)];
 var $57=$56&$55;
 HEAP32[((4712)>>2)]=$57;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 14: 
 var $59=($40|0)==($43|0);
 if($59){label=15;break;}else{label=16;break;}
 case 15: 
 var $_pre84=(($40+8)|0);
 var $_pre_phi85=$_pre84;label=18;break;
 case 16: 
 var $61=$40;
 var $62=($61>>>0)<($5>>>0);
 if($62){label=19;break;}else{label=17;break;}
 case 17: 
 var $64=(($40+8)|0);
 var $65=HEAP32[(($64)>>2)];
 var $66=($65|0)==($25|0);
 if($66){var $_pre_phi85=$64;label=18;break;}else{label=19;break;}
 case 18: 
 var $_pre_phi85;
 var $67=(($37+12)|0);
 HEAP32[(($67)>>2)]=$40;
 HEAP32[(($_pre_phi85)>>2)]=$37;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 19: 
 _abort();
 throw "Reached an unreachable!";
 case 20: 
 _abort();
 throw "Reached an unreachable!";
 case 21: 
 var $69=$24;
 var $_sum37=((($_sum3)+(24))|0);
 var $70=(($mem+$_sum37)|0);
 var $71=$70;
 var $72=HEAP32[(($71)>>2)];
 var $_sum38=((($_sum3)+(12))|0);
 var $73=(($mem+$_sum38)|0);
 var $74=$73;
 var $75=HEAP32[(($74)>>2)];
 var $76=($75|0)==($69|0);
 if($76){label=27;break;}else{label=22;break;}
 case 22: 
 var $_sum44=((($_sum3)+(8))|0);
 var $78=(($mem+$_sum44)|0);
 var $79=$78;
 var $80=HEAP32[(($79)>>2)];
 var $81=$80;
 var $82=($81>>>0)<($5>>>0);
 if($82){label=26;break;}else{label=23;break;}
 case 23: 
 var $84=(($80+12)|0);
 var $85=HEAP32[(($84)>>2)];
 var $86=($85|0)==($69|0);
 if($86){label=24;break;}else{label=26;break;}
 case 24: 
 var $88=(($75+8)|0);
 var $89=HEAP32[(($88)>>2)];
 var $90=($89|0)==($69|0);
 if($90){label=25;break;}else{label=26;break;}
 case 25: 
 HEAP32[(($84)>>2)]=$75;
 HEAP32[(($88)>>2)]=$80;
 var $R_1=$75;label=34;break;
 case 26: 
 _abort();
 throw "Reached an unreachable!";
 case 27: 
 var $_sum40=((($_sum3)+(20))|0);
 var $93=(($mem+$_sum40)|0);
 var $94=$93;
 var $95=HEAP32[(($94)>>2)];
 var $96=($95|0)==0;
 if($96){label=28;break;}else{var $R_0=$95;var $RP_0=$94;label=29;break;}
 case 28: 
 var $_sum39=((($_sum3)+(16))|0);
 var $98=(($mem+$_sum39)|0);
 var $99=$98;
 var $100=HEAP32[(($99)>>2)];
 var $101=($100|0)==0;
 if($101){var $R_1=0;label=34;break;}else{var $R_0=$100;var $RP_0=$99;label=29;break;}
 case 29: 
 var $RP_0;
 var $R_0;
 var $102=(($R_0+20)|0);
 var $103=HEAP32[(($102)>>2)];
 var $104=($103|0)==0;
 if($104){label=30;break;}else{var $R_0=$103;var $RP_0=$102;label=29;break;}
 case 30: 
 var $106=(($R_0+16)|0);
 var $107=HEAP32[(($106)>>2)];
 var $108=($107|0)==0;
 if($108){label=31;break;}else{var $R_0=$107;var $RP_0=$106;label=29;break;}
 case 31: 
 var $110=$RP_0;
 var $111=($110>>>0)<($5>>>0);
 if($111){label=33;break;}else{label=32;break;}
 case 32: 
 HEAP32[(($RP_0)>>2)]=0;
 var $R_1=$R_0;label=34;break;
 case 33: 
 _abort();
 throw "Reached an unreachable!";
 case 34: 
 var $R_1;
 var $115=($72|0)==0;
 if($115){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=35;break;}
 case 35: 
 var $_sum41=((($_sum3)+(28))|0);
 var $117=(($mem+$_sum41)|0);
 var $118=$117;
 var $119=HEAP32[(($118)>>2)];
 var $120=((5016+($119<<2))|0);
 var $121=HEAP32[(($120)>>2)];
 var $122=($69|0)==($121|0);
 if($122){label=36;break;}else{label=38;break;}
 case 36: 
 HEAP32[(($120)>>2)]=$R_1;
 var $cond=($R_1|0)==0;
 if($cond){label=37;break;}else{label=44;break;}
 case 37: 
 var $124=1<<$119;
 var $125=$124^-1;
 var $126=HEAP32[((4716)>>2)];
 var $127=$126&$125;
 HEAP32[((4716)>>2)]=$127;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 38: 
 var $129=$72;
 var $130=HEAP32[((4728)>>2)];
 var $131=($129>>>0)<($130>>>0);
 if($131){label=42;break;}else{label=39;break;}
 case 39: 
 var $133=(($72+16)|0);
 var $134=HEAP32[(($133)>>2)];
 var $135=($134|0)==($69|0);
 if($135){label=40;break;}else{label=41;break;}
 case 40: 
 HEAP32[(($133)>>2)]=$R_1;
 label=43;break;
 case 41: 
 var $138=(($72+20)|0);
 HEAP32[(($138)>>2)]=$R_1;
 label=43;break;
 case 42: 
 _abort();
 throw "Reached an unreachable!";
 case 43: 
 var $141=($R_1|0)==0;
 if($141){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=44;break;}
 case 44: 
 var $143=$R_1;
 var $144=HEAP32[((4728)>>2)];
 var $145=($143>>>0)<($144>>>0);
 if($145){label=53;break;}else{label=45;break;}
 case 45: 
 var $147=(($R_1+24)|0);
 HEAP32[(($147)>>2)]=$72;
 var $_sum42=((($_sum3)+(16))|0);
 var $148=(($mem+$_sum42)|0);
 var $149=$148;
 var $150=HEAP32[(($149)>>2)];
 var $151=($150|0)==0;
 if($151){label=49;break;}else{label=46;break;}
 case 46: 
 var $153=$150;
 var $154=HEAP32[((4728)>>2)];
 var $155=($153>>>0)<($154>>>0);
 if($155){label=48;break;}else{label=47;break;}
 case 47: 
 var $157=(($R_1+16)|0);
 HEAP32[(($157)>>2)]=$150;
 var $158=(($150+24)|0);
 HEAP32[(($158)>>2)]=$R_1;
 label=49;break;
 case 48: 
 _abort();
 throw "Reached an unreachable!";
 case 49: 
 var $_sum43=((($_sum3)+(20))|0);
 var $161=(($mem+$_sum43)|0);
 var $162=$161;
 var $163=HEAP32[(($162)>>2)];
 var $164=($163|0)==0;
 if($164){var $p_0=$25;var $psize_0=$26;label=56;break;}else{label=50;break;}
 case 50: 
 var $166=$163;
 var $167=HEAP32[((4728)>>2)];
 var $168=($166>>>0)<($167>>>0);
 if($168){label=52;break;}else{label=51;break;}
 case 51: 
 var $170=(($R_1+20)|0);
 HEAP32[(($170)>>2)]=$163;
 var $171=(($163+24)|0);
 HEAP32[(($171)>>2)]=$R_1;
 var $p_0=$25;var $psize_0=$26;label=56;break;
 case 52: 
 _abort();
 throw "Reached an unreachable!";
 case 53: 
 _abort();
 throw "Reached an unreachable!";
 case 54: 
 var $_sum4=((($14)-(4))|0);
 var $175=(($mem+$_sum4)|0);
 var $176=$175;
 var $177=HEAP32[(($176)>>2)];
 var $178=$177&3;
 var $179=($178|0)==3;
 if($179){label=55;break;}else{var $p_0=$25;var $psize_0=$26;label=56;break;}
 case 55: 
 HEAP32[((4720)>>2)]=$26;
 var $181=HEAP32[(($176)>>2)];
 var $182=$181&-2;
 HEAP32[(($176)>>2)]=$182;
 var $183=$26|1;
 var $_sum35=((($_sum3)+(4))|0);
 var $184=(($mem+$_sum35)|0);
 var $185=$184;
 HEAP32[(($185)>>2)]=$183;
 var $186=$15;
 HEAP32[(($186)>>2)]=$26;
 label=141;break;
 case 56: 
 var $psize_0;
 var $p_0;
 var $188=$p_0;
 var $189=($188>>>0)<($15>>>0);
 if($189){label=57;break;}else{label=140;break;}
 case 57: 
 var $_sum34=((($14)-(4))|0);
 var $191=(($mem+$_sum34)|0);
 var $192=$191;
 var $193=HEAP32[(($192)>>2)];
 var $194=$193&1;
 var $phitmp=($194|0)==0;
 if($phitmp){label=140;break;}else{label=58;break;}
 case 58: 
 var $196=$193&2;
 var $197=($196|0)==0;
 if($197){label=59;break;}else{label=112;break;}
 case 59: 
 var $199=HEAP32[((4736)>>2)];
 var $200=($16|0)==($199|0);
 if($200){label=60;break;}else{label=62;break;}
 case 60: 
 var $202=HEAP32[((4724)>>2)];
 var $203=((($202)+($psize_0))|0);
 HEAP32[((4724)>>2)]=$203;
 HEAP32[((4736)>>2)]=$p_0;
 var $204=$203|1;
 var $205=(($p_0+4)|0);
 HEAP32[(($205)>>2)]=$204;
 var $206=HEAP32[((4732)>>2)];
 var $207=($p_0|0)==($206|0);
 if($207){label=61;break;}else{label=141;break;}
 case 61: 
 HEAP32[((4732)>>2)]=0;
 HEAP32[((4720)>>2)]=0;
 label=141;break;
 case 62: 
 var $210=HEAP32[((4732)>>2)];
 var $211=($16|0)==($210|0);
 if($211){label=63;break;}else{label=64;break;}
 case 63: 
 var $213=HEAP32[((4720)>>2)];
 var $214=((($213)+($psize_0))|0);
 HEAP32[((4720)>>2)]=$214;
 HEAP32[((4732)>>2)]=$p_0;
 var $215=$214|1;
 var $216=(($p_0+4)|0);
 HEAP32[(($216)>>2)]=$215;
 var $217=(($188+$214)|0);
 var $218=$217;
 HEAP32[(($218)>>2)]=$214;
 label=141;break;
 case 64: 
 var $220=$193&-8;
 var $221=((($220)+($psize_0))|0);
 var $222=$193>>>3;
 var $223=($193>>>0)<256;
 if($223){label=65;break;}else{label=77;break;}
 case 65: 
 var $225=(($mem+$14)|0);
 var $226=$225;
 var $227=HEAP32[(($226)>>2)];
 var $_sum2829=$14|4;
 var $228=(($mem+$_sum2829)|0);
 var $229=$228;
 var $230=HEAP32[(($229)>>2)];
 var $231=$222<<1;
 var $232=((4752+($231<<2))|0);
 var $233=$232;
 var $234=($227|0)==($233|0);
 if($234){label=68;break;}else{label=66;break;}
 case 66: 
 var $236=$227;
 var $237=HEAP32[((4728)>>2)];
 var $238=($236>>>0)<($237>>>0);
 if($238){label=76;break;}else{label=67;break;}
 case 67: 
 var $240=(($227+12)|0);
 var $241=HEAP32[(($240)>>2)];
 var $242=($241|0)==($16|0);
 if($242){label=68;break;}else{label=76;break;}
 case 68: 
 var $243=($230|0)==($227|0);
 if($243){label=69;break;}else{label=70;break;}
 case 69: 
 var $245=1<<$222;
 var $246=$245^-1;
 var $247=HEAP32[((4712)>>2)];
 var $248=$247&$246;
 HEAP32[((4712)>>2)]=$248;
 label=110;break;
 case 70: 
 var $250=($230|0)==($233|0);
 if($250){label=71;break;}else{label=72;break;}
 case 71: 
 var $_pre82=(($230+8)|0);
 var $_pre_phi83=$_pre82;label=74;break;
 case 72: 
 var $252=$230;
 var $253=HEAP32[((4728)>>2)];
 var $254=($252>>>0)<($253>>>0);
 if($254){label=75;break;}else{label=73;break;}
 case 73: 
 var $256=(($230+8)|0);
 var $257=HEAP32[(($256)>>2)];
 var $258=($257|0)==($16|0);
 if($258){var $_pre_phi83=$256;label=74;break;}else{label=75;break;}
 case 74: 
 var $_pre_phi83;
 var $259=(($227+12)|0);
 HEAP32[(($259)>>2)]=$230;
 HEAP32[(($_pre_phi83)>>2)]=$227;
 label=110;break;
 case 75: 
 _abort();
 throw "Reached an unreachable!";
 case 76: 
 _abort();
 throw "Reached an unreachable!";
 case 77: 
 var $261=$15;
 var $_sum6=((($14)+(16))|0);
 var $262=(($mem+$_sum6)|0);
 var $263=$262;
 var $264=HEAP32[(($263)>>2)];
 var $_sum78=$14|4;
 var $265=(($mem+$_sum78)|0);
 var $266=$265;
 var $267=HEAP32[(($266)>>2)];
 var $268=($267|0)==($261|0);
 if($268){label=83;break;}else{label=78;break;}
 case 78: 
 var $270=(($mem+$14)|0);
 var $271=$270;
 var $272=HEAP32[(($271)>>2)];
 var $273=$272;
 var $274=HEAP32[((4728)>>2)];
 var $275=($273>>>0)<($274>>>0);
 if($275){label=82;break;}else{label=79;break;}
 case 79: 
 var $277=(($272+12)|0);
 var $278=HEAP32[(($277)>>2)];
 var $279=($278|0)==($261|0);
 if($279){label=80;break;}else{label=82;break;}
 case 80: 
 var $281=(($267+8)|0);
 var $282=HEAP32[(($281)>>2)];
 var $283=($282|0)==($261|0);
 if($283){label=81;break;}else{label=82;break;}
 case 81: 
 HEAP32[(($277)>>2)]=$267;
 HEAP32[(($281)>>2)]=$272;
 var $R7_1=$267;label=90;break;
 case 82: 
 _abort();
 throw "Reached an unreachable!";
 case 83: 
 var $_sum10=((($14)+(12))|0);
 var $286=(($mem+$_sum10)|0);
 var $287=$286;
 var $288=HEAP32[(($287)>>2)];
 var $289=($288|0)==0;
 if($289){label=84;break;}else{var $R7_0=$288;var $RP9_0=$287;label=85;break;}
 case 84: 
 var $_sum9=((($14)+(8))|0);
 var $291=(($mem+$_sum9)|0);
 var $292=$291;
 var $293=HEAP32[(($292)>>2)];
 var $294=($293|0)==0;
 if($294){var $R7_1=0;label=90;break;}else{var $R7_0=$293;var $RP9_0=$292;label=85;break;}
 case 85: 
 var $RP9_0;
 var $R7_0;
 var $295=(($R7_0+20)|0);
 var $296=HEAP32[(($295)>>2)];
 var $297=($296|0)==0;
 if($297){label=86;break;}else{var $R7_0=$296;var $RP9_0=$295;label=85;break;}
 case 86: 
 var $299=(($R7_0+16)|0);
 var $300=HEAP32[(($299)>>2)];
 var $301=($300|0)==0;
 if($301){label=87;break;}else{var $R7_0=$300;var $RP9_0=$299;label=85;break;}
 case 87: 
 var $303=$RP9_0;
 var $304=HEAP32[((4728)>>2)];
 var $305=($303>>>0)<($304>>>0);
 if($305){label=89;break;}else{label=88;break;}
 case 88: 
 HEAP32[(($RP9_0)>>2)]=0;
 var $R7_1=$R7_0;label=90;break;
 case 89: 
 _abort();
 throw "Reached an unreachable!";
 case 90: 
 var $R7_1;
 var $309=($264|0)==0;
 if($309){label=110;break;}else{label=91;break;}
 case 91: 
 var $_sum21=((($14)+(20))|0);
 var $311=(($mem+$_sum21)|0);
 var $312=$311;
 var $313=HEAP32[(($312)>>2)];
 var $314=((5016+($313<<2))|0);
 var $315=HEAP32[(($314)>>2)];
 var $316=($261|0)==($315|0);
 if($316){label=92;break;}else{label=94;break;}
 case 92: 
 HEAP32[(($314)>>2)]=$R7_1;
 var $cond69=($R7_1|0)==0;
 if($cond69){label=93;break;}else{label=100;break;}
 case 93: 
 var $318=1<<$313;
 var $319=$318^-1;
 var $320=HEAP32[((4716)>>2)];
 var $321=$320&$319;
 HEAP32[((4716)>>2)]=$321;
 label=110;break;
 case 94: 
 var $323=$264;
 var $324=HEAP32[((4728)>>2)];
 var $325=($323>>>0)<($324>>>0);
 if($325){label=98;break;}else{label=95;break;}
 case 95: 
 var $327=(($264+16)|0);
 var $328=HEAP32[(($327)>>2)];
 var $329=($328|0)==($261|0);
 if($329){label=96;break;}else{label=97;break;}
 case 96: 
 HEAP32[(($327)>>2)]=$R7_1;
 label=99;break;
 case 97: 
 var $332=(($264+20)|0);
 HEAP32[(($332)>>2)]=$R7_1;
 label=99;break;
 case 98: 
 _abort();
 throw "Reached an unreachable!";
 case 99: 
 var $335=($R7_1|0)==0;
 if($335){label=110;break;}else{label=100;break;}
 case 100: 
 var $337=$R7_1;
 var $338=HEAP32[((4728)>>2)];
 var $339=($337>>>0)<($338>>>0);
 if($339){label=109;break;}else{label=101;break;}
 case 101: 
 var $341=(($R7_1+24)|0);
 HEAP32[(($341)>>2)]=$264;
 var $_sum22=((($14)+(8))|0);
 var $342=(($mem+$_sum22)|0);
 var $343=$342;
 var $344=HEAP32[(($343)>>2)];
 var $345=($344|0)==0;
 if($345){label=105;break;}else{label=102;break;}
 case 102: 
 var $347=$344;
 var $348=HEAP32[((4728)>>2)];
 var $349=($347>>>0)<($348>>>0);
 if($349){label=104;break;}else{label=103;break;}
 case 103: 
 var $351=(($R7_1+16)|0);
 HEAP32[(($351)>>2)]=$344;
 var $352=(($344+24)|0);
 HEAP32[(($352)>>2)]=$R7_1;
 label=105;break;
 case 104: 
 _abort();
 throw "Reached an unreachable!";
 case 105: 
 var $_sum23=((($14)+(12))|0);
 var $355=(($mem+$_sum23)|0);
 var $356=$355;
 var $357=HEAP32[(($356)>>2)];
 var $358=($357|0)==0;
 if($358){label=110;break;}else{label=106;break;}
 case 106: 
 var $360=$357;
 var $361=HEAP32[((4728)>>2)];
 var $362=($360>>>0)<($361>>>0);
 if($362){label=108;break;}else{label=107;break;}
 case 107: 
 var $364=(($R7_1+20)|0);
 HEAP32[(($364)>>2)]=$357;
 var $365=(($357+24)|0);
 HEAP32[(($365)>>2)]=$R7_1;
 label=110;break;
 case 108: 
 _abort();
 throw "Reached an unreachable!";
 case 109: 
 _abort();
 throw "Reached an unreachable!";
 case 110: 
 var $368=$221|1;
 var $369=(($p_0+4)|0);
 HEAP32[(($369)>>2)]=$368;
 var $370=(($188+$221)|0);
 var $371=$370;
 HEAP32[(($371)>>2)]=$221;
 var $372=HEAP32[((4732)>>2)];
 var $373=($p_0|0)==($372|0);
 if($373){label=111;break;}else{var $psize_1=$221;label=113;break;}
 case 111: 
 HEAP32[((4720)>>2)]=$221;
 label=141;break;
 case 112: 
 var $376=$193&-2;
 HEAP32[(($192)>>2)]=$376;
 var $377=$psize_0|1;
 var $378=(($p_0+4)|0);
 HEAP32[(($378)>>2)]=$377;
 var $379=(($188+$psize_0)|0);
 var $380=$379;
 HEAP32[(($380)>>2)]=$psize_0;
 var $psize_1=$psize_0;label=113;break;
 case 113: 
 var $psize_1;
 var $382=$psize_1>>>3;
 var $383=($psize_1>>>0)<256;
 if($383){label=114;break;}else{label=119;break;}
 case 114: 
 var $385=$382<<1;
 var $386=((4752+($385<<2))|0);
 var $387=$386;
 var $388=HEAP32[((4712)>>2)];
 var $389=1<<$382;
 var $390=$388&$389;
 var $391=($390|0)==0;
 if($391){label=115;break;}else{label=116;break;}
 case 115: 
 var $393=$388|$389;
 HEAP32[((4712)>>2)]=$393;
 var $_sum19_pre=((($385)+(2))|0);
 var $_pre=((4752+($_sum19_pre<<2))|0);
 var $F16_0=$387;var $_pre_phi=$_pre;label=118;break;
 case 116: 
 var $_sum20=((($385)+(2))|0);
 var $395=((4752+($_sum20<<2))|0);
 var $396=HEAP32[(($395)>>2)];
 var $397=$396;
 var $398=HEAP32[((4728)>>2)];
 var $399=($397>>>0)<($398>>>0);
 if($399){label=117;break;}else{var $F16_0=$396;var $_pre_phi=$395;label=118;break;}
 case 117: 
 _abort();
 throw "Reached an unreachable!";
 case 118: 
 var $_pre_phi;
 var $F16_0;
 HEAP32[(($_pre_phi)>>2)]=$p_0;
 var $402=(($F16_0+12)|0);
 HEAP32[(($402)>>2)]=$p_0;
 var $403=(($p_0+8)|0);
 HEAP32[(($403)>>2)]=$F16_0;
 var $404=(($p_0+12)|0);
 HEAP32[(($404)>>2)]=$387;
 label=141;break;
 case 119: 
 var $406=$p_0;
 var $407=$psize_1>>>8;
 var $408=($407|0)==0;
 if($408){var $I18_0=0;label=122;break;}else{label=120;break;}
 case 120: 
 var $410=($psize_1>>>0)>16777215;
 if($410){var $I18_0=31;label=122;break;}else{label=121;break;}
 case 121: 
 var $412=((($407)+(1048320))|0);
 var $413=$412>>>16;
 var $414=$413&8;
 var $415=$407<<$414;
 var $416=((($415)+(520192))|0);
 var $417=$416>>>16;
 var $418=$417&4;
 var $419=$418|$414;
 var $420=$415<<$418;
 var $421=((($420)+(245760))|0);
 var $422=$421>>>16;
 var $423=$422&2;
 var $424=$419|$423;
 var $425=(((14)-($424))|0);
 var $426=$420<<$423;
 var $427=$426>>>15;
 var $428=((($425)+($427))|0);
 var $429=$428<<1;
 var $430=((($428)+(7))|0);
 var $431=$psize_1>>>($430>>>0);
 var $432=$431&1;
 var $433=$432|$429;
 var $I18_0=$433;label=122;break;
 case 122: 
 var $I18_0;
 var $435=((5016+($I18_0<<2))|0);
 var $436=(($p_0+28)|0);
 var $I18_0_c=$I18_0;
 HEAP32[(($436)>>2)]=$I18_0_c;
 var $437=(($p_0+20)|0);
 HEAP32[(($437)>>2)]=0;
 var $438=(($p_0+16)|0);
 HEAP32[(($438)>>2)]=0;
 var $439=HEAP32[((4716)>>2)];
 var $440=1<<$I18_0;
 var $441=$439&$440;
 var $442=($441|0)==0;
 if($442){label=123;break;}else{label=124;break;}
 case 123: 
 var $444=$439|$440;
 HEAP32[((4716)>>2)]=$444;
 HEAP32[(($435)>>2)]=$406;
 var $445=(($p_0+24)|0);
 var $_c=$435;
 HEAP32[(($445)>>2)]=$_c;
 var $446=(($p_0+12)|0);
 HEAP32[(($446)>>2)]=$p_0;
 var $447=(($p_0+8)|0);
 HEAP32[(($447)>>2)]=$p_0;
 label=137;break;
 case 124: 
 var $449=HEAP32[(($435)>>2)];
 var $450=($I18_0|0)==31;
 if($450){var $455=0;label=126;break;}else{label=125;break;}
 case 125: 
 var $452=$I18_0>>>1;
 var $453=(((25)-($452))|0);
 var $455=$453;label=126;break;
 case 126: 
 var $455;
 var $456=(($449+4)|0);
 var $457=HEAP32[(($456)>>2)];
 var $458=$457&-8;
 var $459=($458|0)==($psize_1|0);
 if($459){var $T_0_lcssa=$449;label=133;break;}else{label=127;break;}
 case 127: 
 var $460=$psize_1<<$455;
 var $T_071=$449;var $K19_072=$460;label=129;break;
 case 128: 
 var $462=$K19_072<<1;
 var $463=(($470+4)|0);
 var $464=HEAP32[(($463)>>2)];
 var $465=$464&-8;
 var $466=($465|0)==($psize_1|0);
 if($466){var $T_0_lcssa=$470;label=133;break;}else{var $T_071=$470;var $K19_072=$462;label=129;break;}
 case 129: 
 var $K19_072;
 var $T_071;
 var $468=$K19_072>>>31;
 var $469=(($T_071+16+($468<<2))|0);
 var $470=HEAP32[(($469)>>2)];
 var $471=($470|0)==0;
 if($471){label=130;break;}else{label=128;break;}
 case 130: 
 var $473=$469;
 var $474=HEAP32[((4728)>>2)];
 var $475=($473>>>0)<($474>>>0);
 if($475){label=132;break;}else{label=131;break;}
 case 131: 
 HEAP32[(($469)>>2)]=$406;
 var $477=(($p_0+24)|0);
 var $T_0_c16=$T_071;
 HEAP32[(($477)>>2)]=$T_0_c16;
 var $478=(($p_0+12)|0);
 HEAP32[(($478)>>2)]=$p_0;
 var $479=(($p_0+8)|0);
 HEAP32[(($479)>>2)]=$p_0;
 label=137;break;
 case 132: 
 _abort();
 throw "Reached an unreachable!";
 case 133: 
 var $T_0_lcssa;
 var $481=(($T_0_lcssa+8)|0);
 var $482=HEAP32[(($481)>>2)];
 var $483=$T_0_lcssa;
 var $484=HEAP32[((4728)>>2)];
 var $485=($483>>>0)<($484>>>0);
 if($485){label=136;break;}else{label=134;break;}
 case 134: 
 var $487=$482;
 var $488=($487>>>0)<($484>>>0);
 if($488){label=136;break;}else{label=135;break;}
 case 135: 
 var $490=(($482+12)|0);
 HEAP32[(($490)>>2)]=$406;
 HEAP32[(($481)>>2)]=$406;
 var $491=(($p_0+8)|0);
 var $_c15=$482;
 HEAP32[(($491)>>2)]=$_c15;
 var $492=(($p_0+12)|0);
 var $T_0_c=$T_0_lcssa;
 HEAP32[(($492)>>2)]=$T_0_c;
 var $493=(($p_0+24)|0);
 HEAP32[(($493)>>2)]=0;
 label=137;break;
 case 136: 
 _abort();
 throw "Reached an unreachable!";
 case 137: 
 var $495=HEAP32[((4744)>>2)];
 var $496=((($495)-(1))|0);
 HEAP32[((4744)>>2)]=$496;
 var $497=($496|0)==0;
 if($497){var $sp_0_in_i=5168;label=138;break;}else{label=141;break;}
 case 138: 
 var $sp_0_in_i;
 var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
 var $498=($sp_0_i|0)==0;
 var $499=(($sp_0_i+8)|0);
 if($498){label=139;break;}else{var $sp_0_in_i=$499;label=138;break;}
 case 139: 
 HEAP32[((4744)>>2)]=-1;
 label=141;break;
 case 140: 
 _abort();
 throw "Reached an unreachable!";
 case 141: 
 return;
  default: assert(0, "bad label: " + label);
 }

}
Module["_free"] = _free;

function __ZNSt9bad_allocD0Ev($this){
 var label=0;

 label = 1; 
 while(1)switch(label){
 case 1: 
 var $1=(($this)|0);

 var $2=($this|0)==0;
 if($2){label=3;break;}else{label=2;break;}
 case 2: 
 var $4=$this;
 _free($4);
 label=3;break;
 case 3: 
 return;
  default: assert(0, "bad label: " + label);
 }

}


function __ZNSt9bad_allocD2Ev($this){
 var label=0;


 var $1=(($this)|0);

 return;
}


function __ZNKSt9bad_alloc4whatEv($this){
 var label=0;


 return 176;
}



// EMSCRIPTEN_END_FUNCS
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
    return tempRet0 = h,l|0;
  }
function _i64Subtract(a, b, c, d) {
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a - c)>>>0;
    h = (b - d)>>>0;
    h = (b - d - (((c>>>0) > (a>>>0))|0))>>>0; // Borrow one from high word to low word on underflow.
    return tempRet0 = h,l|0;
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
    ret = HEAP8[(((ctlz_i8)+(x >>> 24))>>0)];
    if ((ret|0) < 8) return ret|0;
    ret = HEAP8[(((ctlz_i8)+((x >> 16)&0xff))>>0)];
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = HEAP8[(((ctlz_i8)+((x >> 8)&0xff))>>0)];
    if ((ret|0) < 8) return (ret + 16)|0;
    return (HEAP8[(((ctlz_i8)+(x&0xff))>>0)] + 24)|0;
  }
/* PRE_ASM */ var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);

function _llvm_cttz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = HEAP8[(((cttz_i8)+(x & 0xff))>>0)];
    if ((ret|0) < 8) return ret|0;
    ret = HEAP8[(((cttz_i8)+((x >> 8)&0xff))>>0)];
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = HEAP8[(((cttz_i8)+((x >> 16)&0xff))>>0)];
    if ((ret|0) < 8) return (ret + 16)|0;
    return (HEAP8[(((cttz_i8)+(x >>> 24))>>0)] + 24)|0;
  }
/* PRE_ASM */ var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

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



//# sourceMappingURL=fskube.js.map