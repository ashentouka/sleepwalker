#!/bin/bash
MY_PATH="$(dirname -- "${BASH_SOURCE[0]}")"
cd $MY_PATH
node servo.js > ~/.sleepwalker/wrapper.log 2>&1 &