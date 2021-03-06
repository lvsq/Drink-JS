/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 9/26/11
 * Time: 1:27 AM
 * To change this template use File | Settings | File Templates.
 */
var io = require('socket.io'),
	express = require('express'),
	net = require('net'),
	fs = require('fs'),
	tls = require('tls'),
	utils = require('../lib/utils.js').utils,
	config = utils.get_config(),
	https = require('https');

var ssl = config.sunday_ssl,
	app = express(ssl),
	https_server = https.createServer(ssl, app);

io = io.listen(https_server);

io.sockets.on('connection', function(socket){

    var conn = {};

    var request_queue = [];
    var requesting = false;
    var request_callback = null;

    var request_num = 0;
    
    // connect to the sunday server
    conn.drink_conn = new net.Socket();
    conn.drink_conn.connect(4242, 'drink.csh.rit.edu', function(){
        
    });

    //conn.drink_conn = tls.connect(4243, 'drink.csh.rit.edu', ssl, function(){
    //
    //});

    conn.drink_conn.on('data', function(data){
        var data = data.toString();

        if(request_callback != null && request_num > 0){
            request_callback(data);
            requesting = false;

            process_queue();
        }

        request_num++;

    });

    function process_queue(){
        if(request_queue.length > 0){
            var request = request_queue.pop();
            requesting = true;
            request_callback = request.callback;

            request.command();
        }
    }

    function command_prep(callback, command){
        if(requesting == false){
            request_callback = callback;
            command();
        } else {
            request_queue.push({command: command, callback: callback});
        }
    }

    socket.on('ibutton', function(data){
        var ibutton = data.ibutton;

        var callback = function(drink_data){
            //console.log('sending');
            console.log(drink_data.substr(0,1));
            socket.emit('ibutton_recv', drink_data);
        }

        var command = function(){
            conn.drink_conn.write("IBUTTON " + ibutton + "\n");
        }

        command_prep(callback, command);

    });

    socket.on('machine', function(data){
        console.log("MACHINE");
        console.log(data);
        var callback = function(recv_data){
            socket.emit('machine_recv', recv_data);
        }

        var command = function(){
            console.log("Machine id = " + data.machine_id);
            conn.drink_conn.write("MACHINE " + data.machine_id + "\n");
        }

        command_prep(callback, command);
    });

    socket.on('getbalance', function(data){
        console.log("GETBALANCE");
        console.log(data);
        var callback = function(recv_data){
            socket.emit('balance_recv', recv_data);
        }

        var command = function(){
            conn.drink_conn.write("GETBALANCE\n");
        }

        command_prep(callback, command);
    });

    socket.on('drop', function(data){
        console.log("DROPPING");
        var callback = function(recv_data){
            socket.emit('drop_recv', recv_data);
        }

        var command = function(){
            conn.drink_conn.write("DROP " + data.slot_num + " " + data.delay + "\n");
        }

        command_prep(callback, command);
    });

    socket.on('stat', function(){
        console.log('sending stat');

        var callback = function(drink_data){
            socket.emit('stat_recv', drink_data);
        }

        var command = function(){
            conn.drink_conn.write("STAT\n");
        }

        command_prep(callback, command);
    });

});

https_server.listen(8080);
