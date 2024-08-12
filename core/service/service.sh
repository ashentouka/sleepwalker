#!/bin/bash
MY_PATH="$(dirname -- "${BASH_SOURCE[0]}")"
cd $MY_PATH
touch ../armada/armada.log
touch ../wrapper/wrapper.log
node service.js > service.log 2>&1 &
echo "$!" > "service.pid"