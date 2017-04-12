#!/bin/(shell)

if [ ! -d "../plugins" ]; then
  echo 'Must be in a valid Freeboard project'
  exit
fi

if [ ! -d "../plugins/freeboard-aws-iot-ws-mqtt" ]; then
  mkdir ../plugins/freeboard-aws-iot-ws-mqtt
fi

cp -R src ../plugins/freeboard-aws-iot-ws-mqtt

exit
