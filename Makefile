BLD := bld
SRC := src
CXX := clang++
CFLAGS := -Wall -g -std=c++11
INC := -I/usr/include/python3.3m -I$(SRC)

TESTER_OBJS := $(BLD)/fskube.o $(BLD)/tester.o
PYTHONWRAPPER_OBJS := $(BLD)/fskube.o $(BLD)/fskube_wrap.o

# Create BLD directory if necessary
$(shell mkdir -p $(BLD))

.PHONY: all check clean

all: $(BLD)/tester $(BLD)/fskube.js $(BLD)/_fskube.so

# Autogenerated dependencies trick from
# http://scottmcpeak.com/autodepend/autodepend.html
-include $(TESTER_OBJS:.o=.d)
-include $(PYTHONWRAPPER_OBJS:.o=.d)

$(BLD)/tester: $(TESTER_OBJS)
	$(CXX) $^ -o $@

$(BLD)/_fskube.so: $(PYTHONWRAPPER_OBJS)
	$(CXX) -shared $(CFLAGS) $(INC) $^ -o $@

# Since some cpp files are autogenerated and end up in the BLD directory,
# treat all cpp files as being in the bld directory. This is a simple rule
# to copy those cpp files that are not actually autogenerated.
$(BLD)/%.cpp: $(SRC)/%.cpp
	cp $< $@

# Make recognizes that the cpp files we copied into BLD are "intermediate" files,
# and will kindly automatically delete them after compilation. However, the
# dependency information generated by CXX points at these BLD files.
# http://www.gnu.org/software/make/manual/html_node/Chained-Rules.html
# details this trick to prevent the deletion of "intermediate" files.
.PRECIOUS: $(BLD)/%.cpp

$(BLD)/%.o: $(BLD)/%.cpp
	$(CXX) -c -fPIC $(CFLAGS) $(INC) $< -o $@
	$(CXX) -MM -MT $(BLD)/$*.o $(CFLAGS) $(INC) $< > $(BLD)/$*.d

# These targets don't actually depend on fskube.o, but they
# should get remade whenever fskube.o is remade, so it's listed
# as a dependency.
$(BLD)/fskube.py $(BLD)/fskube_wrap.cpp $(BLD)/fskube_wrap.h: $(BLD)/fskube.o $(SRC)/fskube.i
	swig -python -c++ -o $(BLD)/fskube_wrap.cpp $(SRC)/fskube.i

# Similar trick as above: fskube.js doesn't actually depend on
# tester, but every time tester gets remade, fskube.js should be
# remade as well.
$(BLD)/fskube.js: $(BLD)/tester
	emcc $(CFLAGS) $(SRC)/tester.cpp $(SRC)/fskube.cpp -o $(BLD)/fskube.js

check: $(BLD)/_fskube.so
	PYTHONPATH=$(BLD) python3 -m unittest discover -s test/ -p *Test.py

clean:
	rm -rf $(BLD)

#<<<
serve:
	python -m SimpleHTTPServer

test/signal.data: scripts/*.js test/*.js
	node test/modemtest.js

graph: test/signal.data
	gnuplot signal.plot
#<<<
