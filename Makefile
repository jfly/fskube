serve:
	python -m SimpleHTTPServer

check:
	node test/modemtest.js

test/signal.data: scripts/*.js test/*.js
	node test/modemtest.js

graph: test/signal.data
	gnuplot signal.plot

clean:
	rm -f test/signal.data
