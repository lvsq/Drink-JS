/**
 * Created by JetBrains PhpStorm.
 * User: seanmcgary
 * Date: 9/7/11
 * Time: 3:31 PM
 * To change this template use File | Settings | File Templates.
 */
var net = require('net');
var colors = require('colors');
var util = require('./util.js').util;
var sys = require('sys');
var machine = require('./drink_machine.js');

function MachineServer(config, sunday_server, logger){
    var self = this;

    self.sunday_serv = sunday_server;
    self.logger = logger;

    self.machines = config.machines;
    self.machine_config = config.machine_server;
    self.tini_ips = config.tini_ips;

    self.server = null;
    
}

MachineServer.prototype = {
    init: function(){
        var self = this;

        self.server = net.createServer(function(socket){
            var conn = this;
            conn.machine = null;
            conn.authenticated = false;
            
            socket.on('connect', function(){
                self.logger.log([{msg: self.machine_time(), color: 'cyan'}, {msg: ' - Tini connecting from ' + socket.remoteAddress, color: null}], 0);
                if(socket.remoteAddress in self.tini_ips){
                    var machine_id = self.tini_ips[socket.remoteAddress];
                    if(self.machines[machine_id].connected == false){
                        self.machines[machine_id].connected = true;
                        
                        conn.machine = self.machines[machine_id];
                        conn.socket = socket;

                        self.machines[machine_id].machine_inst = new machine.server(conn, self.logger);
                    }
                } else {
                    self.logger.log([{msg: self.machine_time(), color: 'gray'}, {msg: ' - Invalid IP address for tini ' + socket.remoteAddress, color: 'gray'}], 0);
                    socket.write("2\n");
                }
            });
        });
        self.server.listen(self.machine_config.port, self.machine_config.host);
        self.logger.log([{msg: self.machine_time(), color: 'cyan'}, {msg: ' - Initializing machine server ' + self.machine_config.host + ':' + self.machine_config.port, color: null}], 0);
    },
    machine_time: function(){
        var self = this;
        return util.get_time() + ' (machine_server)';
    }
};

exports.server = MachineServer;