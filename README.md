# freeboard-aws-iot-ws-mqtt
Freeboard plugin that allows you to create a datasource to AWS IoT topic by way of websockets and MQTT

## Install
``` shell
npm install -S freeboard-aws-iot-ws-mqtt
```
Make sure you are in a valid [Freeboard](https://github.com/Freeboard/freeboard) project in order for post install to work correctly.

#### Create
If post install doesn't work you can run:
``` shell
npm run create
```
Define specific folder:
``` shell
npm run create -d ${DIRECTORY}
```

#### Manual
Move everything from the `./src` folder to the plugins folder in your [Freeboard](https://github.com/Freeboard/freeboard) project.

## Example
#### HTML
Modify the `index.html` file in your [Freeboard](https://github.com/Freeboard/freeboard)
 project.
``` html
<script type="text/javascript">
    head.js("js/freeboard_plugins.min.js",
            // **** Load AWS IoT Websockets MQTT
            "plugins/aws_iot_ws_mqtt/index.js",
            // *** Load more plugins here ***
            function(){
                $(function()
                { //DOM Ready
                    freeboard.initialize(true);

                    var hashpattern = window.location.hash.match(/(&|#)source=([^&]+)/);
                    if (hashpattern !== null) {
                        $.getJSON(hashpattern[2], function(data) {
                            freeboard.loadDashboard(data, function() {
                                freeboard.setEditing(false);
                            });
                        });
                    }

                });
            });
</script>
```
#### AWS IoT
- Create a thing
- Copy IoT endpoint

![AWS IoT Endpoint](https://github.com/iamfiscus/freeboard-aws-iot-ws-mqtt/raw/master/img/create-thing.png "AWS IoT Endpoint")


#### Datasource
Start [Freeboard](https://github.com/Freeboard/freeboard) project and add Datasource.
- Add AWS IoT Endpoint
- Add AWS Region
- Add AWS Access Key w/ IoT permissions
- Add AWS Secret Key w/ IoT permissions
- Add Topic(s) to subscribe to

![Add Datasource](https://github.com/iamfiscus/freeboard-aws-iot-ws-mqtt/raw/master/img/add-datasource.png "Add Datasource")

#### Panel
Create a Text panel with 3 columns, and the datasource to `datasources["Read Me"].message`

![Add Panel](https://github.com/iamfiscus/freeboard-aws-iot-ws-mqtt/raw/master/img/add-panel.png "Add Panel")

#### Test
In the AWS IoT console go to the Test tab.

Subscribe to a topic.

![Subscribe to topic](https://github.com/iamfiscus/freeboard-aws-iot-ws-mqtt/raw/master/img/aws-subscribe.png "Subscribe to topic")

Publish to the same topic.

![Publish to topic](https://github.com/iamfiscus/freeboard-aws-iot-ws-mqtt/raw/master/img/aws-publish.png "Publish to topic")

#### Result

![AWS IoT Console](https://github.com/iamfiscus/freeboard-aws-iot-ws-mqtt/raw/master/img/aws-result.png "AWS IoT Console")

![Freeboard Panel](https://github.com/iamfiscus/freeboard-aws-iot-ws-mqtt/raw/master/img/panel-result.png "Freeboard Panel")
