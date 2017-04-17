var LDAPHandler = require('./LDAPHandler.js').LDAPHandler,
drink_db = require('./MySQLHandler.js').MySQLHandler,
colors = require('colors'),
utils = require('./utils.js').utils,
net = require('net'); //https://nodejs.org/api/net.html

class SundayServer2 {
  constructor (logger, config) {
    //logger for monogdb and terminal output
    this.logger = logger;
    //record the start time for analysis
    this.time_started = utils.get_time();
    this.server = null;

    // parse the config file "drink_config.js"
    this.error_codes = config.error_codes;
    this.machine_aliases = config.machine_codes; //machine aliases
    this.machine_ip_mapping = config.machine_ip_mapping; //machine IP mapping
    this.sunday_config = config.sunday; //sunday server config file
    this.machine_server = null;
    this.sunday_opcodes = config.sunday_opcodes;
  }
  init(){
    this.logger.log([{msg: utils.get_time(), color: 'red'},{msg: ' - Sunday Server.js start', color:null}],0);

    // setup the server
    this.server = net.Server();
    this.server.listen(this.sunday_config.port, this.sunday_config.host, function(){
      this.logger.log([{msg: utils.get_time(), color: 'red'},{msg: ' - Sunday Server.js Server Listening: '+ this.server.listening +' '+this.sunday_config.host+':'+this.sunday_config.port, color:null}],0);
    });

    this.server.on('connection', function(socket){
      //this.setup_connection_handler(socket);
      this.logger.log([{msg: utils.get_time(), color: 'red'},{msg: ' - Sunday Server.js init connection', color:null}],0);
    });
    this.logger.log([{msg: utils.get_time(), color: 'red'},{msg: ' - Sunday Server.js init', color:null}],0);
  }//end init

  is_valid_opcode(opcode){
    logger.log([{msg: utils.get_time(), color: 'red'},{msg: ' - Sunday Server.js is_valid_opcode '+opcode, color:null}],0);

    for(var i = 0; i < this.sunday_opcodes.length; i++){
      if(opcode == this.sunday_opcodes[i]){
        return true;
      }
    }
    return false;
  }//end is valid opcode

  sunday_time(conn){
    if(typeof conn != 'undefined' && conn.authenticated == true){
      return utils.get_time() + ' (sunday : ' + conn.username + ')';
    } else {
      return utils.get_time() + ' (sunday)';
    }
  }//end Sunday_time


  set_machine_server(machine_server){
    this.machine_server = machine_server;
    this.logger.log([{msg: utils.get_time(), color: 'red'},{msg: ' - Sunday Server.js set_Machine_server', color:null}],0);
  }//end set_machine_server

};//end class
