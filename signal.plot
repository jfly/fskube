#!/usr/bin/env gnuplot

set title "Fsk samples a2"
set xlabel "Time"
set ylabel "Voltage?"
set autoscale
plot "test/ABC.testdata" title "" with linespoints

# When people run this script, a window
# appears on the screen and immediately disappears.
# This makes it persist.
set term wxt persist
