#include "assert.h"
#include "logging.h"

static LogHandle logHandles[MAX_LOG_HANDLES];
static unsigned int nextLogHandleId = 0;

#define MAX_LOG_HANDLE_DESC_LENGTH (MAX_LOG_HANDLE_LENGTH + 1 + (MAX_LOG_LEVEL + 1))
static char logLevels[MAX_LOG_HANDLES * (MAX_LOG_HANDLE_DESC_LENGTH + 1) + 1];

static const char *LOGGING_ENV_VAR = "FSKUBE_LOGGING";

void readLogLevels(LogHandle *lh) {
    // First, disable all log levels
    for(int i = 0; i <= MAX_LOG_LEVEL; i++) {
        lh->levels[i] = false;
    }
    // Log level 0 is enabled by default
    lh->levels[0] = true;

    char *logLevels = getenv(LOGGING_ENV_VAR);
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

const char *getLogLevels() {
    char *ptr = logLevels;
    for(unsigned int i = 0; i < nextLogHandleId; i++) {
        if(i != 0) {
            *(ptr++) = ',';
        }
        LogHandle *lh = &logHandles[i];

        char *name = lh->name;
        while(*name != '\0') {
            *(ptr++) = *(name++);
        }

        *(ptr++) = '/';
        for(int l = 0; l <= MAX_LOG_LEVEL; l++) {
            if(lh->levels[l]) {
                *(ptr++) = '0' + l;
            }
        }
    }
    *(ptr++) = '\0';
    return logLevels;
}

void setLogLevels(const char *logLevels) {
    setenv(LOGGING_ENV_VAR, logLevels, 1);
    readLogLevels();
}
