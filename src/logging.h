#ifndef LOGGING_H
#define LOGGING_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// How to use the following macros:
//
//  #define LOG_HANDLE "testhandle"
//  LOG1("printf style formatting %d", 42);
// 
// To turn on log handle "testhandle", set the environment
// variable LOG_testhandle to a subset of "1234", or to "*" to
// enable all levels.

#define LOG(level, format, ...) \
do { \
    continue;/*<<< THE FOLLOWING IS VERY EXPENSIVE, OPTIMIZE >>>*/ \
    char *logLevel = getenv("LOG_" LOG_HANDLE); \
    if(logLevel && (strchr(logLevel, '*') || strchr(logLevel, '0' + level))) { \
        printf("%s/%d " format "\n", LOG_HANDLE, level, ##__VA_ARGS__); \
    } \
} while(0);

#define LOG1(...) LOG(1, ##__VA_ARGS__)
#define LOG2(...) LOG(2, ##__VA_ARGS__)
#define LOG3(...) LOG(3, ##__VA_ARGS__)
#define LOG4(...) LOG(4, ##__VA_ARGS__)

#endif // LOGGING_H
