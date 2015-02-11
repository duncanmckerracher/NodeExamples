/*
	Express.js Serial to Browser example
	Shows how to serve static pages along with a dynamic route
	which communicates with the serial port.
	in Express.js 4.0
	
	created 10 Feb 2015
	by Tom Igoe
*/

var express = require('express');			// include express.js
var app = express();								// a local instance of it

var serialport = require("serialport"),	// include the serialport library
	SerialPort  = serialport.SerialPort,	// make a local instance of serial
	portName = process.argv[2];				// get the port name from the command line

app.use(express.static('public'));			// use the /public directory for static files
	
// open the serial port. Uses the command line parameter:
var myPort = new SerialPort(portName, { 
	baudRate: 9600,
	// look for return and newline at the end of each data packet:
	parser: serialport.parsers.readline("\r\n") 
});

// this runs after the server successfully starts:
function serverStart() {
  var port = server.address().port;
  console.log('Server listening on port '+ port);
}

// this is the callback function for when the client
// requests a static file:
function serveFiles(request, response) {
  var options = {							// options for serving files
    root: __dirname + '/public/'		// root is the /public directory in the app directory
  };
  // get the file name from the request parameter:
  var fileName = request.params.name;
  // send the file:
  response.sendFile(fileName, options);
}

// get an analog reading from the serial port.
// This is a callback function for when the client requests /device/channel:
function getSensorReading(request, response) {
	// the parameter after /device/ is the channel number:
	var channel = request.params.channel;  
	console.log("getting channel: "+ channel + "...");
	
	// send it out the serial port and wait for a response:
	myPort.write(channel, function(){
		// when you get a response from the serial port, write it out to the client: 
		myPort.on('data', function(data) {
			// send the data and close the connection:
			response.write(data);
			response.end();
		});	
	}); 
}

// start the server:
var server = app.listen(8080, serverStart);
// start the listeners for GET requests:
app.get('/files/:name', serveFiles);	// GET handler for all static files
app.get('/device/:channel', getSensorReading);				// GET handler for /date

