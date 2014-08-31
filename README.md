fskube [![Build Status](https://travis-ci.org/jfly/fskube.svg?branch=gh-pages)](https://travis-ci.org/jfly/fskube)
======

A software modem with a web audio api demo.

* `make` builds the c++ code with clang++. `CXX=g++ make -e` to build with g++.
* `make js` builds fskube.js. Requires emscripten.
* `make jsmin` compresses fskube.js to fskube.min.js. Requires clojure compiler.
* `make check` runs the tests. Requires swig to produce the python wrapper for the c++ code.

* `make serve` starts up a local server

== TODO

* Move off gh-pages branch
* Add android to travis-ci
* Integrate android release with git tags
