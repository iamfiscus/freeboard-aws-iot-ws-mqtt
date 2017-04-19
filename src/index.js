// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ freeboard.io-node.js                                               │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2014 Hugo Sequeira (https://github.com/hugocore)       │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                    │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Freeboard datasource plugin for node.js and socket.io.             │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {

    var nodeJSDatasource = function(settings, updateCallback) {

        var self = this,
            currentSettings = settings,
            url,
            mqtt,
            newMessageCallback;
        var reconnectTimeout = 2000;

        function subscribe(topic) {
            // Sends request to subscribe
            // (handle event on server-side)
            self.mqtt.subscribe(topic, {
                qos: 0
            });
            console.info("Subscribing to MQTT topic %s", topic);
        }

        function disconnect() {
            // Disconnect datasource websocket
            if (self.socket) {
                self.socket.disconnect();
            }
        }

        /**
         * utilities to do sigv4
         * @class SigV4Utils
         */
        function SigV4Utils() {}

        SigV4Utils.sign = function(key, msg) {
            var hash = CryptoJS.HmacSHA256(msg, key);
            return hash.toString(CryptoJS.enc.Hex);
        };

        SigV4Utils.sha256 = function(msg) {
            var hash = CryptoJS.SHA256(msg);
            return hash.toString(CryptoJS.enc.Hex);
        };

        SigV4Utils.getSignatureKey = function(key, dateStamp, regionName, serviceName) {
            var kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
            var kRegion = CryptoJS.HmacSHA256(regionName, kDate);
            var kService = CryptoJS.HmacSHA256(serviceName, kRegion);
            var kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
            return kSigning;
        };

        function computeUrl() {
            // must use utc time
            var time = moment.utc();
            var dateStamp = time.format('YYYYMMDD');
            var amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z';
            var service = 'iotdevicegateway';
            var region = self.region;
            var secretKey = self.secretKey;
            var accessKey = self.accessKey;
            var sessionToken = self.sessionToken;
            var algorithm = 'AWS4-HMAC-SHA256';
            var method = 'GET';
            var canonicalUri = '/mqtt';
            var host = self.endpoint;

            var credentialScope = dateStamp + '/' + region + '/' + service + '/' + 'aws4_request';
            var canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
            canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope);
            canonicalQuerystring += '&X-Amz-Date=' + amzdate;
            canonicalQuerystring += '&X-Amz-Expires=86400';
            canonicalQuerystring += '&X-Amz-SignedHeaders=host';

            var canonicalHeaders = 'host:' + host + '\n';
            var payloadHash = SigV4Utils.sha256('');
            var canonicalRequest = method + '\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;
            console.log('canonicalRequest ' + canonicalRequest);

            var stringToSign = algorithm + '\n' + amzdate + '\n' + credentialScope + '\n' + SigV4Utils.sha256(canonicalRequest);
            var signingKey = SigV4Utils.getSignatureKey(secretKey, dateStamp, region, service);
            console.log('stringToSign-------');
            console.log(stringToSign);
            console.log('------------------');
            console.log('signingKey ' + signingKey);
            var signature = SigV4Utils.sign(signingKey, stringToSign);

            canonicalQuerystring += '&X-Amz-Signature=' + signature;
            if (sessionToken) {
                canonicalQuerystring += '&X-Amz-Security-Token=' + encodeURIComponent(sessionToken);
            }
            var requestUrl = 'wss://' + host + canonicalUri + '?' + canonicalQuerystring;
            return requestUrl;
        };

        function connect(url) {

            self.clientId = "aws_iot_" + parseInt(Math.random() * 100, 10);
            console.log(computeUrl(),
                self.clientId
            )
            self.mqtt = new Paho.MQTT.Client(computeUrl(),
                self.clientId
            );


            // set callback handlers
            self.mqtt.onConnectionLost = onConnectionLost;
            self.mqtt.onMessageArrived = onMessageArrived;

            // Connect the client, providing an onConnect callback
            self.mqtt.connect({
                onSuccess: onConnect
            });

        }

        function onConnectionLost(response) {
            setTimeout(connect, reconnectTimeout);
            console.error("Connection to websocket lost, reconnecting to url: %s", self.url);
        };

        function init() {
            // Reset connection to server
            disconnect();
            self.endpoint = currentSettings.endpoint;
            self.region = currentSettings.region;
            self.accessKey = currentSettings.accessKey;
            self.secretKey = currentSettings.secretKey;
            connect();
        }

        // Called when the connection is made
        function onConnect() {
            console.log("Connected to MQTT!");

            // Subscribe to MQTT topics
            _.each(currentSettings.topics, function(topicConfig) {
                var topicName = topicConfig.topicName;
                console.info("topic: %s", topicName);
                if (!_.isUndefined(topicName)) {
                    subscribe(topicName);
                }
            });

        }

        // called when a message arrives
        function onMessageArrived(message) {
            console.log("Topic: %s => %s", message.destinationName, message.payloadString);
            try {
                var objdata = JSON.parse(message.payloadString);
                if (typeof objdata == "object") {
                    updateCallback(objdata);
                } else {
                    var data = {};
                    var text = message.destinationName;
                    data[text] = message.payloadString;
                    updateCallback(data);
                }
            } catch (e) {
                console.log(e instanceof SyntaxError); // true
                console.log(e.message); // "missing ; before statement"
                console.log(e.name); // "SyntaxError"
                console.log(e.fileName); // "Scratchpad/1"
                console.log(e.lineNumber); // 1
                console.log(e.columnNumber); // 4
                console.log(e.stack); // "@Scratchpad/1:2:3\n"
            }
        }

        this.updateNow = function() {
            // Just seat back, relax and wait for incoming events
            return;
        };

        this.onDispose = function() {
            // Stop responding to messages
            self.newMessageCallback = function(message) {
                return;
            };
            disconnect();
        };

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
            init();
        };

        init();
    };

    freeboard
        .loadDatasourcePlugin({
            type_name: "aws_iot_ws_mqtt",
            display_name: "AWS IoT over Websockets",
            description: "A real-time stream datasource using AWS IoT over websockets.",
            external_scripts: [
              "/plugins/freeboard-aws-iot-ws-mqtt/core.js",
              "/plugins/freeboard-aws-iot-ws-mqtt/hmac.js",
              "/plugins/freeboard-aws-iot-ws-mqtt/moment.min.js",
              "/plugins/freeboard-aws-iot-ws-mqtt/sha256.js",
              "/plugins/freeboard-aws-iot-ws-mqtt/mqttws31-min.js"
            ],
            settings: [{
                    name: "endpoint",
                    display_name: "IoT Endpoint",
                    description: "Find your custom endpoint in the <a href=\"https://console.aws.amazon.com/iot/home?region=us-east-1#/dashboard/help\" target=\"_blank\">iot console</a> or run the command <kbd>aws iot describe-endpoint</kbd>. The IAM credentials(the access key and secret key below) must associate with a policy that has access rights to IoT services(action: <kbd>iot:*</kbd>, resource: <kbd>*</kbd>).",
                    type: "text"
                },
                {
                    name: "region",
                    display_name: "Region",
                    description: "The AWS region your IoT endpoint is in.",
                    type: "text"
                },
                {
                    name: "accessKey",
                    display_name: "Access Key",
                    description: "The AWS access key for profile with credentials for IoT endpoint.",
                    type: "text"
                },
                {
                    name: "secretKey",
                    display_name: "Secret Key",
                    description: "The AWS secret key for profile with credentials for IoT endpoint.",
                    type: "text"
                },
                {
                    name: "topics",
                    display_name: "Topics to subscribe to",
                    description: "In case you are using rooms, specify the name of the rooms you want to join. Otherwise, leave this empty.",
                    type: "array",
                    settings: [{
                        name: "topicName",
                        display_name: "Topic name",
                        type: "text"
                    }]
                }
            ],
            newInstance: function(settings, newInstanceCallback, updateCallback) {
                newInstanceCallback(new nodeJSDatasource(settings, updateCallback));
            }
        });
}());
