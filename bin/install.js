var shell = require('shelljs');

var PROJECT = 'freeboard-aws-iot-ws-mqtt';
var PROJECT_LOCATION = '../../';
var PROJECT_PATH = 'plugins';
var PROJECT_FULL_PATH = PROJECT_LOCATION+PROJECT_PATH+'/'+PROJECT

shell.echo('Attempting to create files in Freeboard project.');

if (process.argv[2]) {
  PROJECT_PATH = process.argv[2]
  PROJECT_FULL_PATH = PROJECT_PATH + '/' + PROJECT;
} else {
  if ( !shell.find(PROJECT_LOCATION + PROJECT_PATH).stdout ){
    shell.echo('Must be in a valid Freeboard project');
    shell.exit();
  }
}

if (!shell.find(PROJECT_FULL_PATH).stdout) {
  shell.mkdir('-p', PROJECT_FULL_PATH);
  shell.echo('Created directory ' + PROJECT_FULL_PATH);
}

shell.mkdir('out');

shell.cp('node_modules/crypto-js/core.js', 'out/core.js');
shell.cp('node_modules/crypto-js/hmac.js', 'out/hmac.js');
shell.cp('node_modules/crypto-js/sha256.js', 'out/sha256.js');
shell.cp('node_modules/moment/min/moment.min.js', 'out/moment.min.js');
shell.cp('node_modules/paho-mqtt/mqttws31-min.js', 'out/mqttws31-min.js');
shell.cp('src/index.js', 'out/index.js');

if (process.argv[2]) {
  shell.sed('-i', 'plugins', PROJECT_PATH, 'out/index.js');
  shell.echo('Changing index.js dependency paths to ' + PROJECT_PATH);
}

shell.cp('-R', 'out/*', PROJECT_FULL_PATH);

shell.echo('Files copied to ' + PROJECT_FULL_PATH);

shell.rm('-rf', 'out');

shell.exit();
