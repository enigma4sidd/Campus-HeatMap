/*
 * Server.js
 * 
 * The main portion of this project. Contains all the defined routes for express,
 * rules for the websockets, and rules for the MQTT broker.
 * 
 * Refer to the portions surrounded by --- for points of interest
 */
var express   = require('express'),
    app       = express();
var pug       = require('pug');
var sockets   = require('socket.io');
var path      = require('path');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var conf      = require(path.join(__dirname, 'config'));
var internals = require(path.join(__dirname, 'internals'));
var mqtt = require('mqtt');

var zone1=0, zone2=0, zone3=0, zone4=0;
var t_zone1=0, t_zone2=0, t_zone3=0, t_zone4=0;
// -- Setup the application
var global_socket;
setupExpress();
setupSocket();

client_mqtt = mqtt.createClient(1883, 'localhost');

client_mqtt.subscribe('ZONE_1');
//client_mqtt.subscribe('T_ZONE_1');
client_mqtt.subscribe('ZONE_2');
client_mqtt.subscribe('ZONE_3');
client_mqtt.subscribe('ZONE_4');

// -- Socket Handler
// Here is where you should handle socket/mqtt events
// The mqtt object should allow you to interface with the MQTT broker through 
// events. Refer to the documentation for more info 
// -> https://github.com/mcollina/mosca/wiki/Mosca-basic-usage
// ----------------------------------------------------------------------------
function socket_handler(socket, mqtt) {

    // Called when a client connects
	mqtt.on('clientConnected', client => {
		console.log("Client Connected");
		socket.emit('debug', {
			type: 'CLIENT', msg: 'New client connected: ' + client.id
		});
	});

	// Called when a client disconnects
	mqtt.on('clientDisconnected', client => {
        console.log("Client DisConnected");
		socket.emit('debug', {
			type: 'CLIENT', msg: 'Client "' + client.id + '" has disconnected'
		});
	});

	// Called when a client publishes data
	mqtt.on('published', (data, client) => {
		if (!client) return;
    //console.log("Message Received"+ data.topic+" "+data.payload);
    if (data.topic=="ZONE_1"&& data.payload=="1"){
        zone1++;
        console.log('zone 1 updated'+zone1);
        global_socket.emit('debug', {
            type: 'SUBSCRIBE',
            msg: 'Zone 1 "' + zone1
        });
        global_socket.emit('zones', {type: 'COUNT', msg:zone1, name:'zone_1'});
        if (zone1>=t_zone1) {
            console.log('Sending zone1 ');
            //client_mqtt.publish('ZONE_1', 'Threshold');
            client_mqtt.publish('T_ZONE_1', 'Threshold');
        }

    }
    else     if (data.topic=="ZONE_2"&& data.payload=="1"){
        zone2++;
        console.log('zone 2 updated');
        global_socket.emit('debug', {
            type: 'SUBSCRIBE',
            msg: 'Zone 2 "' + zone2
        });
        global_socket.emit('zones', {type: 'COUNT', msg:zone2, name:'zone_2'});
        if (zone2>=t_zone2) {
            console.log('Sending zone2');
            client_mqtt.publish('T_ZONE_2', 'Threshold');
        }

    }
    else    if (data.topic=="ZONE_3"&& data.payload=="1"){
        zone3++;
        console.log('zone 3 updated');
        global_socket.emit('debug', {
            type: 'SUBSCRIBE',
            msg: 'Zone 3 "' + zone3
        });
        global_socket.emit('zones', {type: 'COUNT', msg:zone3, name:'zone_3'});
        if (zone3>=t_zone3) {
            console.log('Sending zone3 ');
            client_mqtt.publish('T_ZONE_3', 'Threshold');
        }
    }
    else    if (data.topic=="ZONE_4"&& data.payload=="1"){
        zone4++;
        console.log('zone 4 updated'+zone4+""+t_zone4);
        global_socket.emit('debug', {
            type: 'SUBSCRIBE',
            msg: 'Zone 4 "' + zone4
        });
        global_socket.emit('zones', {type: 'COUNT', msg:zone4, name:'zone_4'});
        if (zone4>=t_zone4) {
            console.log('Sending zone4');
            client_mqtt.publish('T_ZONE_4', 'Threshold');
        }
    }
		socket.emit('debug', {
			type: 'PUBLISH',
			msg: 'Client "' + client.id + '" published "' + JSON.stringify(data) + '"'
		});
	});

	// Called when a client subscribes
	mqtt.on('subscribed', (topic, client) => {
		if (!client) return;
    console.log("Subscribed"+ client.id);
		socket.emit('debug', {
			type: 'SUBSCRIBE',
			msg: 'Client "' + client.id + '" subscribed to "' + topic + '"'
		});
	});

	// Called when a client unsubscribes
	mqtt.on('unsubscribed', (topic, client) => {
		if (!client) return;

		socket.emit('debug', {
			type: 'SUBSCRIBE',
			msg: 'Client "' + client.id + '" unsubscribed from "' + topic + '"'
		});
	});

    socket.on('threshold', data => {
        console.log(data);
    if (data.zone === "zone1") {
        t_zone1 = data.msg;
        console.log("set threshold t_zone1" + data.msg + "" + data.zone);
    }
    if (data.zone === "zone2") {
        t_zone2 = data.msg;
        console.log("set threshold t_zone2" + data.msg + "" + data.zone);
    }
    if (data.zone === "zone3") {
        t_zone3 = data.msg;
        console.log("set threshold t_zone3" + data.msg + "" + data.zone);
    }
    if (data.zone === "zone4") {

    t_zone4 = data.msg;
    console.log("set threshold t_zone4" + data.msg + "" + data.zone);
}
});

}
// ----------------------------------------------------------------------------


// Helper functions
function setupExpress() {
	app.set('view engine', 'pug'); // Set express to use pug for rendering HTML

	// Setup the 'public' folder to be statically accessable
	var publicDir = path.join(__dirname, 'public');
	app.use(express.static(publicDir));

	// Setup the paths (Insert any other needed paths here)
	// ------------------------------------------------------------------------
	// Home page
    app.get('/beacon',jsonParser, function (req, res) {
        if (!req.body) return res.sendStatus(400)

        else {
            var myobject = req.query.beacon;
            if (myobject.includes("41")){
                zone1++;
                console.log('zone 1 updated');
                global_socket.emit('zones', {type: 'COUNT', msg:zone1, name:'zone_1'});
                if (zone1>=t_zone1) {
                    console.log('Sending zone1 ');
                    client_mqtt.publish('T_ZONE_1', 'Threshold');
                }
            }
            else  if (myobject.includes("42")){
                zone2++;
                console.log('zone 2 updated');
                global_socket.emit('zones', {type:'COUNT' ,msg:zone2, name:'zone_2'});
                if (zone2>=t_zone2) {
                    console.log('Sending zone2 ');
                    client_mqtt.publish('T_ZONE_2', 'Threshold');
                }
            }
            else  if (myobject.includes("43")){
                zone3++;
                console.log('zone 3 updated');
                global_socket.emit('zones', {type:'COUNT' ,msg:zone3, name:'zone_3'});
                if (zone3>=t_zone3) {
                    console.log('Sending zone3 ');
                    client_mqtt.publish('T_ZONE_3', 'Threshold');
                }
            }
            else  if (myobject.includes("44")){
                zone4++;
                console.log('zone 4 updated');
                global_socket.emit('zones', {type:'COUNT' ,msg:zone4, name:'zone_4'});
                if (zone4>=t_zone4) {
                    console.log('Sending zone4 ');
                    client_mqtt.publish('T_ZONE_4', 'Threshold');
                }
            }
        }
        console.log(zone1+""+ zone2+""+ zone3+"" +zone4);
        res.sendStatus(200);
    });
            app.get('/', (req, res) => {
                res.render('index', {title: 'MQTT Tracker'});
        });
	// Basic 404 Page
	app.use((req, res, next) => {
		var err = {
			stack: {},
			status: 404,
			message: "Error 404: Page Not Found '" + req.path + "'"
		};

		// Pass the error to the error handler below
		next(err);
	});

	// Error handler
	app.use((err, req, res, next) => {
		console.log("Error found: ", err);
		res.status(err.status || 500);

		res.render('error', {title: 'Error', error: err.message});
	});
	// ------------------------------------------------------------------------

	// Handle killing the server
	process.on('SIGINT', () => {
		internals.stop();
		process.kill(process.pid);
	});
}

function setupSocket() {
	var server = require('http').createServer(app);
	var io = sockets(server);

	// Setup the internals
	internals.start(mqtt => {
		io.on('connection', socket => {
			console.log("IO Connected");
		global_socket=socket;
			socket_handler(socket, mqtt)
		});
	});

	server.listen(conf.PORT, conf.HOST, () => {
		console.log("Listening on: " + conf.HOST + ":" + conf.PORT);
	});
}