#!/usr/bin/env bash

#npm install
export NODE_ENV=production && export ENABLE_LINT=true && export ENABLE_DEBUG=true && ./node_modules/.bin/gulp clean && ./node_modules/.bin/gulp build