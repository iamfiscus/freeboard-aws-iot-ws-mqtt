#!/bin/(shell)
PROJECT="freeboard-aws-iot-ws-mqtt"
pwd
if [ -z "$1" ]; then
  PROJECT_LOCATION="../../"
  PROJECT_PATH="plugins"

  if [ ! -d "$PROJECT_LOCATION$PROJECT_PATH" ]; then
    echo 'Must be in a valid Freeboard project'
    exit
  fi
  PROJECT_FULL_PATH="${PROJECT_LOCATION}${PROJECT_PATH}/${PROJECT}"
else
  PROJECT_PATH=$1
  PROJECT_FULL_PATH="${PROJECT_PATH}/${PROJECT}"
fi

if [ ! -d "$PROJECT_FULL_PATH" ]; then
  mkdir -p $PROJECT_FULL_PATH
  echo "Created directory ${PROJECT_FULL_PATH}"
fi

mkdir out

cp node_modules/crypto-js/core.js out/core.js
cp node_modules/crypto-js/hmac.js out/hmac.js
cp node_modules/crypto-js/sha256.js out/sha256.js
cp node_modules/moment/min/moment.min.js out/moment.min.js
cp node_modules/paho-mqtt/mqttws31-min.js out/mqttws31-min.js
cp src/index.js out/index.js
if [ -z "$1" ]; then
  sed -i -e "s:plugins:${PROJECT_PATH}:g" out/index.js
fi
rm out/index.js-e

cp -R out/* $PROJECT_FULL_PATH

echo "Files copied to ${PROJECT_FULL_PATH}"

rm -rf out

exit
