#include "assert.h"
#include "logging.h"

LogHandle logHandles[MAX_LOG_HANDLES];
static unsigned int nextLogHandleId = 0;

void readLogLevels(LogHandle *lh) {
    // First, disable all log levels
    for(int i = 0; i <= MAX_LOG_LEVEL; i++) {
        lh->levels[i] = false;
    }
    // Log level 0 is enabled by default
    lh->levels[0] = true;

    char *logLevels = getenv("FSKUBE_LOGGING");
    if(logLevels == NULL) {
        return;
    }
    char logLevelsCopy[strlen(logLevels)];
    strcpy(logLevelsCopy, logLevels);

    unsigned int levelNameLength = strlen(lh->name);
    const char *delimiter = ",";
    char *logLevel = strtok(logLevelsCopy, delimiter);
    while(logLevel != NULL) {
        if(!strcmp(logLevel, "*")) {
            // enable all levels!
            for(int l = 0; l <= MAX_LOG_LEVEL; l++) {
                lh->levels[l] = true;
            }
        } else if(!strncmp(logLevel, lh->name, levelNameLength) &&
                  logLevel[levelNameLength] == '/') {
            for(int i = levelNameLength + 1; logLevel[i] != '\0'; i++) {
                if(logLevel[i] == '*') {
                    // enable all levels!
                    for(int l = 0; l <= MAX_LOG_LEVEL; l++) {
                        lh->levels[l] = true;
                    }
                } else {
                    int level = logLevel[i] - '0';
                    if(level >= 0 && level <= MAX_LOG_LEVEL) {
                        lh->levels[level] = true;
                    }
                }
            }
        }
        logLevel = strtok(NULL, delimiter);
    }
}

void readLogLevels() {
    for(int i = 0; i < nextLogHandleId; i++) {
        readLogLevels(&logHandles[i]);
    }
}

LogHandle *createLogHandle(const char *logHandleName) {
    if(nextLogHandleId >= MAX_LOG_HANDLES) {
        assert(false);
        return NULL;
    }
    if(strlen(logHandleName) > MAX_LOG_HANDLE_LENGTH) {
        assert(false);
        return NULL;
    }
    LogHandle *lh = &logHandles[nextLogHandleId++];
    strcpy(lh->name, logHandleName);
    readLogLevels(lh);
    return lh;
}
