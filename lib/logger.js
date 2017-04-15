var colors = require('colors'),
    utils = require('./utils.js').utils,
    util = require('util'),
    //mongo = require('mongodb-wrapper'),
    LDAPHandler = require('./LDAPHandler').LDAPHandler,
    fs = require('fs'),
	config = utils.get_config(),
	https = require('https');

function Logger(){
    var self = this;

    var config = utils.get_config().logging;//drink_config.js logging

    self.stdout = config.stdout;
    /*stdout: true*/
    self.db = config.db;
    /*db: true*/
    self.file = config.file;
    /*file: true*/

    if('db_data' in config){
        self.db_config = config.db_data;
        /*host: 'localhost',
        port: 27017,
        db: 'drink_log'*/
        //self.mongodb = mongo.db(self.db_config.host, self.db_config.port, self.db_config.db);
        //self.mongodb.collection('logs');
    } else {
        self.db_config = null;
    }

    self.websocket_running = false;

    self.setup_websocket();
};

Logger.prototype = {
    setup_websocket: function(){
        var self = this;
        //self.log([{msg: self.get_time(), color: 'yellow'}, {msg: ' - Starting logging websocket', color: null}], 0);

        //set up the live logging websocket server
        self.io = require('socket.io');

		var express = require('express'),
			ssl = config.sunday_ssl,
        	app = express(),
			https_server = https.createServer(ssl, app);

        self.io = self.io.listen(https_server);

        self.io.set('log level', 0);

        self.io.sockets.on('connection', function(socket){
            socket.on('auth_drink_admin', function(data){
                var ldap_handler = new LDAPHandler(self);

                ldap_handler.auth_ibutton(data.ibutton, function(user_data){
                    if(user_data != false && user_data.drink_admin == 1){
                        socket.join('logger');
                        /*
			   self.mongodb.logs.find().limit(10).sort({time_logged: -1}).toArray(function(err, post){
                            socket.emit('auth_drink_admin_res', {status: true, logs: post});
                        });
                        */
                    } else {
                        socket.emit('auth_drink_admin_res', {status: false});
                    }
                });
            })
        });

        https_server.listen(8081);

        self.websocket_running = true;
    },
    get_time: function() {
	    return new Date().toUTCString();
    },
    set_stdout: function(val){
        var self = this;

        self.stdout = val;
    },
    set_db: function(val){
        var self = this;

        self.db = val;
    },
    set_file: function(val){
        var self = this;

        self.file = val;
    },
    log_error: function(error_msg, location){
        var self = this;
        self.log([{msg: self.get_time() + ' (' + location + ')', color: 'red'}, {msg: ' - ' + error_msg, color: 'grey'}], 3);
    },
    /**
     *
     * @param message   - The message (object) to log
     *                  [{
     *                      msg: <message (string)>,
     *                      color: <color (string)>,
     *                   },{}]
     *
     * @param level     - Levels of log messages
     *                      - 0 Normal
     *                      - 1 Warn
     *                      - 3 Error
     */
    log: function(message, level){
        var self = this;

        var stdout_string = '';
        var log_string = '';

        for(var i in message){
            if(message[i].color == null){
                message[i].color = 'white';
            }


            var str = message[i].msg;

            stdout_string += str[message[i].color];
            log_string += str;

            //console.log(stdout_string);
        }

        // send to the websocket

        if(self.websocket_running){
            self.io.sockets.in('logger').emit('log_message', {msg: log_string});
            //self.log([{msg: self.get_time(), color: 'yellow'}, {msg: ' - Logger websocket_running', color: null}], 0);
        }

        if(self.stdout == true){
            // print to stdout
            console.log(stdout_string);
            //self.log([{msg: self.get_time(), color: 'yellow'}, {msg: ' - Logger STD out = true', color: null}], 0);
        }

        if(self.db == true){
           // self.mongodb.logs.save({time_logged: utils.get_unix_time(), message: log_string, log_level: level}, function(err, post){});
           // self.log([{msg: self.get_time(), color: 'yellow'}, {msg: ' - Logger DB = true', color: null}], 0);
        }

        if(self.file == true){
          //self.log([{msg: self.get_time(), color: 'yellow'}, {msg: ' - Logger File = true', color: null}], 0);
        }
    }
}

exports.logger = new Logger();
