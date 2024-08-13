#!/bin/bash
MY_PATH="$(dirname -- "${BASH_SOURCE[0]}")"
cd $MY_PATH
mkdir ~/.sleepwalker/
echo "" > ~/.sleepwalker/armada.log
echo "" > ~/.sleepwalker/wrapper.log
node service.js > ~/.sleepwalker/service.log 2>&1 &