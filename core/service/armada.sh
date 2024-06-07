#!/bin/bash
stdir=$(pwd)
cd ../armada
# rm -rf data/blacklist/
node core/core.js | tee $stdir/armada.log