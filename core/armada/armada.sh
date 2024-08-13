#!/bin/bash
MY_PATH="$(dirname -- "${BASH_SOURCE[0]}")"
cd $MY_PATH
node core/core.js > ~/.sleepwalker/armada.log 2>&1 &