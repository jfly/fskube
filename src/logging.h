#ifndef LOGGING_H
#define LOGGING_H

extern "C" {

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// How to use the following macros:
//
//  LOG_HANDLE("testhandle")
//  LOG1("printf style formatting %d", 42);
// 
// The environment variable FSKUBE_LOGGING controls what log
// handles/levels are enabled. To enable foo/1, foo/2, and all
// log levels for bar, set FSKUBE_LOGGING to "foo/12,bar/*".
// Or, to enable all log levels for every handle, simply
// set FSKUBE_LOGGING to "*".

#define MAX_LOG_HANDLES 128
#define MAX_LOG_HANDLE_LENGTH 20
#define MAX_LOG_LEVEL 4

struct LogHandle {
    char name[MAX_LOG_HANDLE_LENGTH + 1];
    bool levels[MAX_LOG_LEVEL + 1];
};

const char *getLogLevels();
void setLogLevels(const char *logLevels);

LogHandle *createLogHandle(const char *logHandleName);

inline bool isLogLevelEnabled(LogHandle *lh, int level) {
    return level >= 0 && level <= MAX_LOG_LEVEL && lh->levels[level];
}

#define LOG_HANDLE(logHandleName) static LogHandle *logHandle = createLogHandle(logHandleName);

#define LOG(level, format, ...) \
do { \
    if(isLogLevelEnabled(logHandle, level)) { \
        printf("%s/%d " format "\n", logHandle->name, level, ##__VA_ARGS__); \
    } \
} while(0);

#define LOG0(...) LOG(0, ##__VA_ARGS__)
#define LOG1(...) LOG(1, ##__VA_ARGS__)
#define LOG2(...) LOG(2, ##__VA_ARGS__)
#define LOG3(...) LOG(3, ##__VA_ARGS__)
#define LOG4(...) LOG(4, ##__VA_ARGS__)

}

#endif // LOGGING_H
