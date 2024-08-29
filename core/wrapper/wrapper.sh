#!/bin/bash
MY_PATH="$(dirname -- "${BASH_SOURCE[0]}")"
echo "Script Path: $MY_PATH"
cd $MY_PATH
node servo.js > ~/.sleepwalker/wrapper.log 2>&1 &