#!/usr/bin/env bash

if [ ! -d "./node_modules/" ]; then
    npm install;
fi

export NODE_ENV=production && ./node_modules/.bin/gulp clean && ./node_modules/.bin/gulp build