#!/bin/bash
MY_PATH="$(dirname -- "${BASH_SOURCE[0]}")"
echo "Script Path: $MY_PATH"
cd $MY_PATH
node core/core.js $@ > ~/.sleepwalker/armada.log 2>&1 &