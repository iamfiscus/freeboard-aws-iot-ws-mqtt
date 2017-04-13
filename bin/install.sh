#!/bin/(shell)
PROJECT="freeboard-aws-iot-ws-mqtt"

if [ -z "$1" ]; then
  PROJECT_PATH="../plugins"

  if [ ! -d "$PROJECT_PATH" ]; then
    echo 'Must be in a valid Freeboard project'
    exit
  fi

else
  PROJECT_PATH=$1
fi


PROJECT_PATH="${PROJECT_PATH}/${PROJECT}"

if [ ! -d "$PROJECT_PATH" ]; then
  mkdir -p $PROJECT_PATH
  echo "Created directory ${PROJECT_PATH}"
fi

mkdir out

cp ./node_modules/crypto-js/core.js out/core.js
cp ./node_modules/crypto-js/hmac.js out/hmac.js
cp ./node_modules/crypto-js/sha256.js out/sha256.js
cp ./node_modules/moment/min/moment.min.js out/moment.min.js
cp ./node_modules/paho-mqtt/mqttws31-min.js out/mqttws31-min.js
cp ./src/index.js out/index.js

cp -R out/* $PROJECT_PATH

echo "Files copied to ${PROJECT_PATH}"

rm -rf out

exit
