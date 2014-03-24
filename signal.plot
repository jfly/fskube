#!/usr/bin/env gnuplot

set title "Fsk samples"
set xlabel "Time"
set ylabel "Voltage?"
set autoscale
plot "test/helloworld.testdata" title "" with linespoints

# When people run this script, a window
# appears on the screen and immediately disappears.
# This makes it persist.
set term wxt persist
