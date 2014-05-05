CC=clang++
CFLAGS=-Wall -g -std=c++11

all: tester fskube.js _fskube.so

serve:
	python -m SimpleHTTPServer

check: _fskube.so
# node test/modemtest.js
	./test.py

test/signal.data: scripts/*.js test/*.js
	node test/modemtest.js

graph: test/signal.data
	gnuplot signal.plot

clean:
	#rm -f test/signal.data
	rm -f *.o *.so
	rm -f tester
	rm -f fskube.js
	rm -f fskube.js.map
	rm -f fskube_wrap.cxx
	rm -f fskube.py

fskube.o: fskube.cpp fskube.h logging.h
	$(CC) $(CFLAGS) -c -fPIC fskube.cpp -o fskube.o

libfskube.so: fskube.o
	$(CC) $(CFLAGS) -shared -o libfskube.so fskube.o

tester: test.cpp libfskube.so
# Neat trick to avoid having to specify LD_LIBRARY_PATH.
# http://stackoverflow.com/questions/12399056/how-to-encode-the-executable-location-in-a-linux-rpath
	$(CC) $(CFLAGS) test.cpp -lfskube -L . -Wl,-rpath=\$$ORIGIN -o tester

fskube.js: test.cpp fskube.cpp *.h
	emcc $(CFLAGS) test.cpp fskube.cpp -o fskube.js

fskube.py: fskube.cpp fskube.i *.h
	swig -python -c++ fskube.i

fskube_wrap.o: fskube.py
	$(CC) -c -fPIC fskube_wrap.cxx -std=c++11 -I/usr/include/python3.3m

_fskube.so: fskube_wrap.o fskube.o
	$(CC) -shared fskube_wrap.o fskube.o -o _fskube.so
